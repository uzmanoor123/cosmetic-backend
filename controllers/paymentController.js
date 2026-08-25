const Stripe = require("stripe");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          images: item.product.image ? [item.product.image] : [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: req.user.email || undefined,
      mode: "payment",
      line_items: lineItems,
      metadata: {
        userId: req.user.id,
      },
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log("Stripe checkout error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create checkout session",
    });
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("Webhook signature error:", error.message);

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata?.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID missing from Stripe session",
        });
      }

      const existingOrder = await Order.findOne({
        stripeSessionId: session.id,
      });

      if (existingOrder) {
        return res.json({
          received: true,
        });
      }

      const cart = await Cart.findOne({
        user: userId,
      }).populate("items.product");

      if (!cart || cart.items.length === 0) {
        return res.json({
          received: true,
        });
      }

      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.image || "",
        price: item.product.price,
        quantity: item.quantity,
      }));

      const totalAmount = cart.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

      await Order.create({
        user: userId,
        items: orderItems,
        totalAmount,
        paymentStatus: "paid",
        stripeSessionId: session.id,
        orderStatus: "processing",
      });

      await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } }
      );
    }

    res.json({
      received: true,
    });
  } catch (error) {
    console.log("Stripe webhook error:", error);

    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
};
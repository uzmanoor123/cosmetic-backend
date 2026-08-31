const Order = require("../models/Order");
const Review = require("../models/Review")

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    const ordersWithReviews = await Promise.all(
      orders.map(async (order) => {
        const reviews = await Review.find({
          user: req.user.id,
          order: order._id,
        }).select("product");

        return {
          ...order.toObject(),
          reviews,
        };
      })
    );

    res.status(200).json({
      success: true,
      orders: ordersWithReviews,
    });
  } catch (error) {
    console.log("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get orders",
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log("Get all orders error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.log("Update order status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update order status",
    });
  }
};


module.exports = {
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
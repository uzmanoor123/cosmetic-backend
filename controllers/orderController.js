const Order = require("../models/Order");
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
};

module.exports = {
  getMyOrders,
};
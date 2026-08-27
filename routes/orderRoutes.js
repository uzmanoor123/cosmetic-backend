const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getMyOrders } = require("../controllers/orderController");

router.get("/my-orders", authMiddleware, getMyOrders);

module.exports = router;
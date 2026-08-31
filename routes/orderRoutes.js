const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware")
const { getMyOrders, getAllOrders, updateOrderStatus } = require("../controllers/orderController");

router.get("/my-orders", authMiddleware, getMyOrders);
router.get( "/all", authMiddleware,adminMiddleware, getAllOrders);
router.put( "/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
module.exports = router;
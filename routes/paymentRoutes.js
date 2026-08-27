const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware")
const {createCheckoutSession,getAllTransactions, refundTransaction } = require("../controllers/paymentController");

router.post( "/create-checkout-session", authMiddleware,  createCheckoutSession);
router.get("/transactions",authMiddleware,adminMiddleware,getAllTransactions);
router.post("/transactions/:orderId/refund",authMiddleware,adminMiddleware,refundTransaction);
module.exports = router;
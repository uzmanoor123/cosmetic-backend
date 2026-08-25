const express = require("express");
const router = express.Router();

const { handleStripeWebhook } = require("../controllers/paymentController");

router.post("/", handleStripeWebhook);

module.exports = router;
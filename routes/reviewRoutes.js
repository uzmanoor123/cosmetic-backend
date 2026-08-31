const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createReview,getProductReviews } = require("../controllers/reviewController");
router.post("/",authMiddleware,createReview);
router.get("/product/:productId", getProductReviews);
module.exports = router;
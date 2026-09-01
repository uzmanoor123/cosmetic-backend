const express = require("express");
const { recommendProducts,  beautyChat } = require("../controllers/aiController.js");

const router = express.Router();

router.post("/recommend", recommendProducts);
router.post("/chat", beautyChat);

module.exports = router;
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: String,
    price: Number,
    originalPrice: Number,
    image: String,
    badge: String,
    badgeColor: String,
    category: String,
    concerns: [String],
    description: String,
    ingredients: [String],
    howToUse: String,
    benefits: [String],
    skinType: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
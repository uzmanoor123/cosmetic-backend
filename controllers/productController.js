const Product = require("../models/Product");
const Review = require("../models/Review");
const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.find({
          product: product._id,
        });

        const totalReviews = reviews.length;

        const averageRating =
          totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            : 0;

        return {
          ...product.toObject(),
          averageRating,
          totalReviews,
        };
      })
    );

    res.status(200).json({
      success: true,
      products: productsWithReviews,
    });
  } catch (error) {
    console.log("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get products",
    });
  }
};
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
};
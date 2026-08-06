const express = require("express");
const router = express.Router();

const { addProduct, getProducts, getProductById , updateProduct, deleteProduct} = require("../controllers/productController");
router.post("/", addProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
module.exports = router;
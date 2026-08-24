const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { getAdminProducts,addProduct, updateProduct, deleteProduct,} = require("../controllers/adminController");
router.use(authMiddleware, adminMiddleware);

router.get("/products", getAdminProducts);
router.post("/add-product", addProduct);
router.put("/edit-product/:id", updateProduct);
router.delete("/delete-product/:id", deleteProduct);

module.exports = router;
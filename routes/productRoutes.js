// routes/productRoutes.js
import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/auth.js";
import { permit } from "../middleware/permit.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
// router.get("/approved", getApprovedProducts); 

// vendors or admin create product
router.post("/", verifyToken, permit("vendor", "admin"), createProduct);
router.put("/:id/status", verifyToken, permit("admin"), updateProductStatus);

// update / delete — handled inside controller for own resources
router.put("/:id", verifyToken, permit("vendor", "admin"), updateProduct);
router.delete("/:id", verifyToken, permit("vendor", "admin"), deleteProduct);

export default router;

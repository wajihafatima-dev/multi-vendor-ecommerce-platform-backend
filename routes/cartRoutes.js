import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getCart, addToCart, removeFromCart } from "../controllers/cartController.js";
import { permit } from "../middleware/permit.js";

const router = express.Router();

// Only customers can access cart
router.get("/", verifyToken, permit("customer"), getCart);
router.post("/", verifyToken, permit("customer"), addToCart);
router.delete("/", verifyToken, permit("customer"), removeFromCart);

export default router;

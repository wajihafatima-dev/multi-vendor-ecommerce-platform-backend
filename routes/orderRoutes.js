import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { createOrder, getUserOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", verifyToken, createOrder); 
router.get("/", verifyToken, getUserOrders); 
router.put("/:id", verifyToken, updateOrderStatus);

export default router;

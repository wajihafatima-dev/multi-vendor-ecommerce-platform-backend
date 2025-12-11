import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { checkout } from "../controllers/checkoutController.js";
import { permit } from "../middleware/permit.js";

const router = express.Router();

router.post("/", verifyToken, permit("customer"), checkout);

export default router;

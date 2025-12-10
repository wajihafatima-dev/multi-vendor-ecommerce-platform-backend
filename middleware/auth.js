import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Access denied: Admin only" });
};

export const isVendor = (req, res, next) => {
  if (req.user?.role === "vender") return next();
  return res.status(403).json({ message: "Access denied: Vendor only" });
};
export const isCustomer = (req, res, next) => {
  if (req.user?.role === "customer") return next();
  return res.status(403).json({ message: "Access denied: Customer only" });
};
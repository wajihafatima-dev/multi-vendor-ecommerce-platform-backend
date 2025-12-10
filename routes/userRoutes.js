import express from "express";
import { verifyToken, isAdmin, isVendor, isCustomer} from "../middleware/auth.js";
import { deleteUser, getAllUsers, getUserById, updateUser} from "../controllers/userController.js";

const router = express.Router();

router.get("/", verifyToken, getAllUsers);
router.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin Dashboard", user: req.user });
});

router.get("/vendor", verifyToken, isVendor, (req, res) => {
  res.json({ message: "Welcome Vendor Dashboard", user: req.user });
}); 
router.get("/customer", verifyToken,isCustomer, (req, res) => {
  res.json({ message: "Welcome Customer Dashboard", user: req.user });
});

router.get("/:id", verifyToken, getUserById);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
export default router;

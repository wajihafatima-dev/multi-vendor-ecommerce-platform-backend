import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Cart from "../models/Cart.js";

// ✅ Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // token payload
    process.env.JWT_SECRET, // secret key
    { expiresIn: "7d" } // expiry
  );
};
// export const getMe = async (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ message: 'Not authorized' });
//   }

//   res.status(200).json({
//     _id: req.user._id,
//     name: req.user.name,
//     email: req.user.email,
//     role: req.user.role,
//   });
// };
// ✅ Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, role  } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer" 
    });

    // generate token
    const token = generateToken(user);

    res.status(201).json({
      message: "Signup successful",
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, guestCart } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Merge guest cart
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({ user: user._id, items: [] });
    }

    if (guestCart && guestCart.length > 0) {
      guestCart.forEach(item => {
        const existItem = cart.items.find(i => i.product.toString() === item.productId);
        if (existItem) existItem.quantity += item.qty;
        else cart.items.push({ product: item.productId, quantity: item.qty });
      });
    }

    await cart.save();

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        cart: cart.items,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

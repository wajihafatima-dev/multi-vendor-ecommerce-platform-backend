import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import sendEmail from "../utils/email.js";

export const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart empty" });

    let totalAmount = 0;
    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.status !== "approved") return res.status(400).json({ message: `Product ${product?.name} not available` });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      customer: req.user._id,
      products: cart.items.map(i => ({ product: i.product._id, quantity: i.quantity })),
      totalAmount,
      shippingAddress: req.body.shippingAddress,
      paymentInfo: req.body.paymentInfo,
      status: "confirmed"
    });

    await Cart.findOneAndDelete({ user: req.user._id });

    // Optional email notification
    try {
      await sendEmail(req.user.email, "Order Confirmation", `Your order ${order._id} has been placed successfully.`);
    } catch (e) {}

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import sendEmail from "../utils/email.js";

export const createOrder = async (req, res) => {
  try {
    // only customers create orders (can be adjusted)
    if (req.user.role !== "customer") return res.status(403).json({ message: "Only customers can place orders" });

    const { products, shippingAddress, paymentInfo } = req.body;
    if (!products || !products.length) return res.status(400).json({ message: "Products required" });

    let total = 0;
    for (const item of products) {
      const p = await Product.findById(item.product);
      if (!p || p.status !== "approved") return res.status(400).json({ message: "Product not available" });
      if (p.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${p.name}` });
      total += p.price * item.quantity;
      // optionally reduce stock here or on confirmed payment
      p.stock -= item.quantity;
      await p.save();
    }

    const order = await Order.create({
      customer: req.user._id,
      products,
      totalAmount: total,
      shippingAddress,
      paymentInfo,
      status: "confirmed"
    });

    // email (optional)
    try { await sendEmail(req.user.email, "Order placed", `Your order ${order._id} placed.`); } catch(e){}

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    if (req.user.role === "customer") {
      const orders = await Order.find({ customer: req.user._id }).populate("products.product", "name price");
      return res.json(orders);
    }
    // vendor: orders that include vendor's products
    if (req.user.role === "vendor") {
      const orders = await Order.find().populate("products.product customer");
      const vendorOrders = orders.filter(o => o.products.some(p => p.product && p.product.vendor && p.product.vendor.equals(req.user._id)));
      return res.json(vendorOrders);
    }
    // admin: all orders
    const orders = await Order.find().populate("customer", "name email").populate("products.product", "name price");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // vendor can update only if order contains their product(s)
    if (req.user.role === "vendor") {
      const isVendorOrder = order.products.some(p => p.product.vendor && p.product.vendor.equals(req.user._id));
      if (!isVendorOrder) return res.status(403).json({ message: "Forbidden" });
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only vendor or admin can update status" });
    }

    const { status } = req.body;
    order.status = status || order.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

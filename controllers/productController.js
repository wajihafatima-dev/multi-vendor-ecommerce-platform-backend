// controllers/productController.js
import Product from "../models/Product.js";

// Create product — vendor or admin
export const createProduct = async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res
        .status(403)
        .json({ message: "Only vendors can create products" });
    }

    const product = await Product.create({
      ...req.body,
      vendor: req.user._id,
      status: "pending", // default
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  const products = await Product.find().populate("vendor", "name email role");
  res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "vendor",
    "name email role"
  );
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};
// export const getApprovedProducts = async (req, res) => {
//   try {
//     const products = await Product.find({ status: "approved" })
//       .populate("vendor", "name email role");
 
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const updateProductStatus = async (req, res) => {
  try {
    // check admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update status" });
    }

    const { status } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.status = status;
    await product.save();

    res.json({ message: `Product status updated to ${status}`, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // vendor can update only own product; admin can update any
  if (req.user.role !== "admin" && !product.vendor.equals(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  Object.assign(product, req.body);
  await product.save();
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (req.user.role !== "admin" && !product.vendor.equals(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await product.remove();
  res.json({ message: "Product deleted" });
};

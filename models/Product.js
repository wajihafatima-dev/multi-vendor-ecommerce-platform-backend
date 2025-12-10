// models/Product.js
import mongoose from "mongoose";

// models/Product.js
const productSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: String,
    images: [String],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
        comment: String,
      },
    ],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // new
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);

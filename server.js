import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoute.js";
import connectDB from "./config/db.js";


dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",          
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => res.send(" Backend Running"));

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

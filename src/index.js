import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import potholeRoutes from "./routes/potholes.js";

dotenv.config();

const app = express();


app.use(cors({
  origin: process.env.ORIGIN
}));
app.use(express.json());


app.use("/api/potholes", potholeRoutes);


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

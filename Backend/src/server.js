import "dotenv/config";
import express from "express";
import cors from "cors";
import admin from "./firebase.js";
import { getFirestore } from "firebase-admin/firestore";
import riskRoutes from "./routes/riskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import complianceRoutes from "./routes/complianceRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

const db = getFirestore(admin);

app.get("/", (req, res) => {
  res.json({
    message: "RiskRadar API is running 🚨"
  });
});

app.get("/test-firebase", async (req, res) => {
  try {
    await db.collection("test").doc("connection").set({
      message: "Firebase connected successfully",
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: "Firebase is working 🔥"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
app.use("/api/compliance", complianceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/risks", riskRoutes);
app.listen(5000, () => {
  console.log("RiskRadar API running on port 5000 🚨");
});
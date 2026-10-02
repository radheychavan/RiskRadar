import express from "express";
import { getFirestore } from "firebase-admin/firestore";
import {
  protect,
  authorize
} from "../middleware/authMiddleware.js";const router = express.Router();
const db = getFirestore();

// CREATE RISK
router.post(
  "/",
  protect,
  authorize("admin", "risk_manager"),
  async (req, res) =>  {  try {
    console.log("Request body:", req.body);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing"
      });
    }

    const {
      title,
      description,
      category,
      probability,
      impact,
      owner,
      mitigation
    } = req.body;

    if (!title || !category || probability === undefined || impact === undefined) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    const riskScore = Number(probability) * Number(impact);

    let severity;

    if (riskScore >= 15) {
      severity = "Critical";
    } else if (riskScore >= 10) {
      severity = "High";
    } else if (riskScore >= 5) {
      severity = "Medium";
    } else {
      severity = "Low";
    }

    const risk = {
      title,
      description: description || "",
      category,
      probability: Number(probability),
      impact: Number(impact),
      riskScore,
      severity,
      owner: owner || "",
      mitigation: mitigation || "",
      status: "Open",
      createdAt: new Date()
    };

    const doc = await db.collection("risks").add(risk);

    res.status(201).json({
      success: true,
      message: "Risk created successfully",
      riskId: doc.id,
      risk
    });

  } catch (error) {
    console.error("CREATE RISK ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET ALL RISKS
router.get(
  "/",
  protect,
  authorize("admin", "risk_manager", "compliance_officer", "employee"),
  async (req, res) => {  try {
    const snapshot = await db
      .collection("risks")
      .orderBy("createdAt", "desc")
      .get();

    const risks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      count: risks.length,
      risks
    });

  } catch (error) {
    console.error("GET RISKS ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET SINGLE RISK
router.get(
  "/:id",
  protect,
  authorize("admin", "risk_manager", "compliance_officer", "employee"),
  async (req, res) => {  try {
    const doc = await db
      .collection("risks")
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Risk not found"
      });
    }

    res.json({
      success: true,
      risk: {
        id: doc.id,
        ...doc.data()
      }
    });

  } catch (error) {
    console.error("GET RISK ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE RISK
router.delete(
  "/:id",
  protect,
  authorize("admin", "risk_manager"),
  async (req, res) => { try {
    await db
      .collection("risks")
      .doc(req.params.id)
      .delete();

    res.json({
      success: true,
      message: "Risk deleted successfully"
    });

  } catch (error) {
    console.error("DELETE RISK ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
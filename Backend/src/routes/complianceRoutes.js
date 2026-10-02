import express from "express";
import { getFirestore } from "firebase-admin/firestore";
import {
  protect,
  authorize
} from "../middleware/authMiddleware.js";

const router = express.Router();
const db = getFirestore();


// CREATE COMPLIANCE RECORD
router.post(
  "/",
  protect,
  authorize("admin", "compliance_officer"),
  async (req, res) => {
    try {
      const {
        framework,
        requirement,
        description,
        status,
        owner,
        dueDate
      } = req.body;

      if (!framework || !requirement) {
        return res.status(400).json({
          success: false,
          message: "Framework and requirement are required"
        });
      }

      const compliance = {
        framework,
        requirement,
        description: description || "",
        status: status || "Not Started",
        owner: owner || "",
        dueDate: dueDate || null,
        createdBy: req.user.userId,
        createdByEmail: req.user.email,
        createdAt: new Date()
      };

      const doc = await db
        .collection("compliance")
        .add(compliance);

      res.status(201).json({
        success: true,
        message: "Compliance record created successfully",
        complianceId: doc.id,
        compliance: {
          id: doc.id,
          ...compliance
        }
      });

    } catch (error) {
      console.error("CREATE COMPLIANCE ERROR:", error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);


// GET ALL COMPLIANCE RECORDS
router.get(
  "/",
  protect,
  async (req, res) => {
    try {
      const snapshot = await db
        .collection("compliance")
        .orderBy("createdAt", "desc")
        .get();

      const compliance = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        count: compliance.length,
        compliance
      });

    } catch (error) {
      console.error("GET COMPLIANCE ERROR:", error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);


// GET SINGLE COMPLIANCE RECORD
router.get(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const doc = await db
        .collection("compliance")
        .doc(req.params.id)
        .get();

      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          message: "Compliance record not found"
        });
      }

      res.json({
        success: true,
        compliance: {
          id: doc.id,
          ...doc.data()
        }
      });

    } catch (error) {
      console.error("GET COMPLIANCE ERROR:", error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);


// UPDATE COMPLIANCE STATUS
router.patch(
  "/:id",
  protect,
  authorize("admin", "compliance_officer"),
  async (req, res) => {
    try {
      const { status, owner, dueDate, description } = req.body;

      const updateData = {};

      if (status !== undefined) updateData.status = status;
      if (owner !== undefined) updateData.owner = owner;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (description !== undefined) {
        updateData.description = description;
      }

      updateData.updatedAt = new Date();

      await db
        .collection("compliance")
        .doc(req.params.id)
        .update(updateData);

      res.json({
        success: true,
        message: "Compliance record updated successfully"
      });

    } catch (error) {
      console.error("UPDATE COMPLIANCE ERROR:", error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);


// DELETE COMPLIANCE RECORD
router.delete(
  "/:id",
  protect,
  authorize("admin", "compliance_officer"),
  async (req, res) => {
    try {
      await db
        .collection("compliance")
        .doc(req.params.id)
        .delete();

      res.json({
        success: true,
        message: "Compliance record deleted successfully"
      });

    } catch (error) {
      console.error("DELETE COMPLIANCE ERROR:", error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);


export default router;
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getFirestore } from "firebase-admin/firestore";

const router = express.Router();
const db = getFirestore();

const JWT_SECRET = process.env.JWT_SECRET || "riskradar-secret-key";

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db
      .collection("users")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "employee",
      createdAt: new Date()
    };

    const doc = await db.collection("users").add(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: doc.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const snapshot = await db
      .collection("users")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: userDoc.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: userDoc.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
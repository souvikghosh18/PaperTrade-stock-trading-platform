import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();


// =========================================================
// REGISTER
// =========================================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password
    } = req.body;

    // Accept either username or name from frontend
    const finalUsername = username || name;
    const finalName = name || username;

    // Check required fields
    if (!finalUsername || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Check existing email or username
    const exists = await User.findOne({
      $or: [
        { email },
        { username: finalUsername }
      ]
    });

    if (exists) {
      return res.status(409).json({
        message: "Email or username already registered"
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: finalName,
      username: finalUsername,
      email,
      password: hash
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // Send response
    res.status(201).json({
      token,
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        cash: user.cash
      }
    });

  } catch (e) {
    console.error("REGISTER ERROR:", e);

    res.status(500).json({
      message: e.message || "Registration failed"
    });
  }
});


// =========================================================
// LOGIN
// =========================================================

router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    const user =
      await User.findOne({
        email
      });


    if (
      !user ||
      !(await bcrypt.compare(
        password,
        user.password
      ))
    ) {

      return res.status(401).json({
        message:
          "Invalid email or password"
      });

    }


    const token =
      jwt.sign(
        {
          id: user._id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );


    res.json({

      token,

      user: {
        name: user.name,
        email: user.email,
        cash: user.cash
      }

    });


  } catch (e) {

    console.error(
      "LOGIN ERROR:",
      e
    );


    res.status(500).json({
      message:
        e.message ||
        "Login failed"
    });

  }

});


export default router;
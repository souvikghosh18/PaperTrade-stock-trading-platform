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

    const { name, email, password } = req.body;


    // Check required fields
    if (!name || !email || !password) {
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


    // Check existing user
    const exists = await User.findOne({
      email
    });


    if (exists) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }


    // Hash password
    const hash = await bcrypt.hash(
      password,
      10
    );


    // Create user
    const user = await User.create({
      name,
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
        email: user.email,
        cash: user.cash
      }
    });


  } catch (e) {

    // IMPORTANT:
    // Show the real registration error
    console.error(
      "REGISTER ERROR:",
      e
    );


    res.status(500).json({
      message:
        e.message ||
        "Registration failed"
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
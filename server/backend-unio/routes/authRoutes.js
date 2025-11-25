import express from "express";
import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateToken from "../middleware/auth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    console.log("Login attempt:", req.body);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

  try {
    const { email, password } = req.body;
    if (!email || !password) 
      return res.status(400).json({ code: 400, message: "Please fill all fields" });

    // ===== ADMIN FIXE =====
    const ADMIN_EMAIL = "admin@admin.com";
    const ADMIN_PASSWORD = "admin5566@";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { userId: "admin-fixed-id", email: ADMIN_EMAIL, role: "admin", isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ RETURN CORRECT DANS LA FONCTION
      return res.json({
        code: 200,
        message: "Login successful (admin)",
        token,
        user: {
          _id: "admin-fixed-id",
          username: "Super Admin",
          email: ADMIN_EMAIL,
          role: "admin",
          isAdmin: true
        }
      });
    }

    // ===== UTILISATEUR NORMAL =====
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ code: 404, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ code: 400, message: "Invalid credentials" });

    const token = generateToken(res, user._id);

    return res.json({
      code: 200,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin || false
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ code: 500, message: "Server error" });
  }
});

export default router;

import express from "express";
import passport from "passport";
import generateToken from "../utlis/createToken.js"; // Fixed import path and filename

const router = express.Router();

// GOOGLE
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/auth/failure" }),
  (req, res) => {
    generateToken(res, req.user._id, true); // "Se souvenir" par défaut
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173/dashboard");
  }
);

// FACEBOOK
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/api/auth/failure" }),
  (req, res) => {
    generateToken(res, req.user._id, true);
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173/dashboard");
  }
);

router.get("/failure", (_req, res) => {
  res.status(401).json({ message: "OAuth failed" });
});
export default router;
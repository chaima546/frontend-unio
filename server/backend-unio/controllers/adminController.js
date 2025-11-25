import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utlis/createToken.js";
import jwt from 'jsonwebtoken'; 

// Add this helper function if generateToken doesn't return token
const createAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const signupAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(422).json({ message: "Please fill all the inputs" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const newAdmin = new User({
      username,
      email,
      password,
      isAdmin: true,
    });

    await newAdmin.save();
    
    //  FIX: Generate token for response AND set cookie
    const responseToken = createAuthToken(newAdmin._id);
    generateToken(res, newAdmin._id); // Still set cookie if needed

    res.status(201).json({
      message: "Admin created successfully",
      token: responseToken, //  ADD TOKEN TO RESPONSE
      admin: {
        _id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        isAdmin: newAdmin.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Failed to create admin" });
  }
};

// Login Admin - FIXED VERSION
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  console.log(' ADMIN LOGIN ATTEMPT:', { email, password: password ? '***' : 'MISSING' });

  if (!email || !password) {
    console.log(' MISSING CREDENTIALS');
    return res.status(422).json({ message: "Please fill all the inputs" });
  }

  try {
    console.log('LOOKING FOR ADMIN IN DATABASE...');
    const admin = await User.findOne({ email, isAdmin: true }).select('+password');
    
    if (!admin) {
      console.log(' ADMIN NOT FOUND OR NOT ADMIN');
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.password) {
      console.log('❌ ADMIN PASSWORD MISSING IN DATABASE');
      return res.status(500).json({ message: "Admin password not set correctly" });
    }

    console.log('🔐 COMPARING PASSWORDS...');
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('✅ PASSWORD MATCH:', isMatch);
    
    if (!isMatch) {
      console.log('❌ INVALID PASSWORD');
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log('✅ GENERATING TOKEN...');
    
    // ✅ FIX: Generate token for response AND set cookie
    const responseToken = createAuthToken(admin._id);
    generateToken(res, admin._id); // Still set cookie if needed

    console.log('✅ ADMIN LOGIN SUCCESSFUL');
    res.json({
      message: "Admin login successful",
      token: responseToken, // ✅ ADD TOKEN TO RESPONSE
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        isAdmin: admin.isAdmin,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR DETAILS:", error);
    console.error("❌ ERROR STACK:", error.stack);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Logout Admin (unchanged)
export const logoutAdmin = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Admin logout successful" });
};
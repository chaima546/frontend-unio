import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/UserModel.js'; // adapte le chemin si nécessaire

dotenv.config();

// Connecte à la DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error("❌ DB connection error:", err));

async function testUser() {
  const user = await User.findOne({ email: "admin@admin.com" });
  console.log("User trouvé :", user);
  process.exit();
}

testUser();

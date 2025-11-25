import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";

const profSchema = new mongoose.Schema(
  {
    
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    

    username: { type: String, required: true, trim: true },
    
  
    department: { type: String, required: true },
    speciality: { type: String, required: true },
    
  
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, 
    
    role: { type: String, default: "prof" },
    
    bio: { type: String, default: "" },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }]
  },
  {
    timestamps: true
  }
);

// Middleware Mongoose pour hacher le mot de passe avant l'enregistrement
profSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode Mongoose pour comparer le mot de passe
profSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Méthode Mongoose pour générer un JWT
profSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const Prof = mongoose.model("Prof", profSchema);

export default Prof;

// ⚠️ Assurez-vous d'importer ce modèle sous le nom 'User' dans votre contrôleur si vous ne voulez pas changer le nom dans le contrôleur.
// Ex: import User from "../models/Prof.js";
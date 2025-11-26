import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },

  // Rôle de l'utilisateur
  role: { type: String, enum: ["user", "prof", "admin"], default: "user" },

// ✅ Champs spécifiques aux étudiants (role = "user")
niveauScolaire: {
  type: String,
  enum: ["1ère", "2ème", "3ème", "Bac"],
  default: "1ère"
},
section: {
  type: String,
  enum: [
    "Informatique",
    "Sciences",
    "Mathématiques",
    "Économie",
    "Lettres",
    "Technologie",
    "Sport"
  ],
  validate: {
    validator: function(value) {
      // 👉 Si niveauScolaire = "1ère", alors section ne doit PAS être renseignée
      if (this.niveauScolaire === "1ère" && value) {
        return false;
      }
      return true;
    },
    message: "Les élèves en 1ère ne doivent pas choisir de section."
  },
  default: function() {
    // 👉 Si c'est 1ère, pas de section par défaut
    return this.niveauScolaire === "1ère" ? null : "Sciences";
  }
},

// ✅ Champ spécifique aux professeurs (role = "prof")
speciality: {
  type: String,
  enum: [
    "Mathématiques",
    "Physique",
    "Chimie",
    "Biologie",
    "Informatique",
    "Français",
    "Anglais",
    "Arabe",
    "Histoire",
    "Géographie",
    "Économie",
    "Philosophie",
    "Sport",
    "Arts",
    "Musique"
  ],
  required: function() {
    return this.role === 'prof';
  }
},

}, { timestamps: true });

// Virtual property for isAdmin
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Ensure virtuals are included in JSON and Object outputs
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// 🔒 Hash du mot de passe avant sauvegarde
userSchema.pre("save", async function(next){
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Comparaison du mot de passe
userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password, this.password);
};

// 🔐 Génération du token JWT
userSchema.methods.generateJWT = function(){
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export default mongoose.model("User", userSchema);

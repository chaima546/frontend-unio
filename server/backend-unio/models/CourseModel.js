import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  
  // Professeur et étudiants
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // référence à User (professors have role='prof')
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],             // étudiants référencés dans User

  // Progression et détails du cours
  progress: { type: Number, default: 0, min: 0, max: 100 },
  nextLesson: { type: String, default: "" },
  description: { type: String, default: "" },

  
}, 
{ timestamps: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;

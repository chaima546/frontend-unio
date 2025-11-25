import dotenv from 'dotenv';
dotenv.config();

import cookieParser from "cookie-parser";
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import passport from "passport";

// Routes
import userRoutes from './routes/userRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import profRoutes from "./routes/profRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import coursesRoutes from './routes/coursesRoutes.js';
import ressourcesRoutes from "./routes/ressourcesRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import calendrierRoutes from "./routes/calendrierRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// --- DIAGNOSTIC LOGGING ---
console.log('--------------------------------------------------');
console.log('Checking environment variables...');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Not Found');
console.log('--------------------------------------------------');

const app = express();
const port = process.env.PORT || 3000;

// --- CORS ---
app.use(cors({
  origin: [
    'http://localhost:8081',
    '192.168.1.118:8082',
    'http://localhost:8082'

  ],
  credentials: true,
}));

// --- Middlewares globaux ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Passport ---
import "./config/passport.js";

// --- Connect DB ---
connectDB();

// --- Routes ---
app.get('/', (req, res) => res.json('Hello World!'));

// Auth & Users
app.use('/api/users', userRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/profs", profRoutes);
app.use("/api/auth", oauthRoutes);

// Autres modules

app.use("/api/ressources", ressourcesRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/calendrier", calendrierRoutes);
app.use("/api/dashboard", dashboardRoutes);

// --- Global error handler (optionnel) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: "Server error" });
});

// --- Start server ---
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// server.js
const express = require("express");
const dotenv = require("dotenv");
const path = require('path');

const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const workshopRoutes = require("./routes/workshopRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("KFZ-Buchungssystem Backend läuft...");
});
app.use("/api/auth", authRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/bookings", bookingRoutes);
//  uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});

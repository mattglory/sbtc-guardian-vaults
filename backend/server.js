require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
  origin: ['https://sbtc-guardian-vaults.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Import routes
const vaultRoutes = require("./routes/vaultRoutes");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const marketRoutes = require("./routes/marketRoutes");

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/vault", vaultRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/market", marketRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 sBTC Guardian Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

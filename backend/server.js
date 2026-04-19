const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
const leetcodeRoutes = require("./routes/leetcodeRoutes");
app.use("/api/leetcode", leetcodeRoutes);

// START SERVER — this was missing!
app.listen(5001, () => {
  console.log("Backend running on port 5001");
});
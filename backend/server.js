const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// routes
const leetcodeRoutes = require("./routes/leetcodeRoutes");
app.use("/api/leetcode", leetcodeRoutes);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
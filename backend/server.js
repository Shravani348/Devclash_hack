const express = require("express");
const cors = require("cors");

const leetcodeRoutes = require("./routes/leetcodeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/leetcode", leetcodeRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
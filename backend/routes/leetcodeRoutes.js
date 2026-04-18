const express = require("express");
const router = express.Router();

router.post("/analyze", (req, res) => {
  const { username } = req.body;

  console.log("Username received:", username);

  const dummyResponse = {
    username,
    level: "Intermediate",
    ranking: 12345,
    skillScore: 75,
    problemsSolved: {
      easy: 120,
      medium: 80,
      hard: 25,
      total: 225
    }
  };

  res.json({ success: true, data: dummyResponse });
});

module.exports = router;
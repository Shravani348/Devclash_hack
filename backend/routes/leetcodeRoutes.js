const express = require("express");
const router = express.Router();

router.post("/analyze", (req, res) => {
  const { username } = req.body;

  res.json({
    username,
    ranking: 15234,
    skillScore: 78,
    level: "Intermediate",
    problemsSolved: {
      easy: 45,
      medium: 30,
      hard: 12,
      total: 87
    }
  });
});

module.exports = router;
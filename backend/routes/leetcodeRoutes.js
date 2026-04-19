const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const LC_GRAPHQL = "https://leetcode.com/graphql";

const PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        realName
        countryName
        skillTags
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      badges {
        id
        displayName
      }
      userCalendar {
        streak
        totalActiveDays
      }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
  }
`;

function computeSkillScore(stats, contestData) {
  const ac     = stats?.acSubmissionNum || [];
  const easy   = ac.find(d => d.difficulty === "Easy")?.count   || 0;
  const medium = ac.find(d => d.difficulty === "Medium")?.count || 0;
  const hard   = ac.find(d => d.difficulty === "Hard")?.count   || 0;
  const weighted     = easy * 1 + medium * 2 + hard * 3;
  const solveScore   = Math.min(60, (weighted / 500) * 60);
  const contestScore = Math.min(25, ((contestData?.rating || 0) / 3000) * 25);
  const topPct       = contestData?.topPercentage || 100;
  const rankScore    = Math.min(15, ((100 - topPct) / 100) * 15);
  return Math.round(solveScore + contestScore + rankScore);
}

function skillLevel(score) {
  if (score >= 80) return "Expert";
  if (score >= 60) return "Advanced";
  if (score >= 40) return "Intermediate";
  if (score >= 20) return "Beginner";
  return "Novice";
}

function acceptanceRate(stats) {
  const total = stats?.totalSubmissionNum || [];
  const ac    = stats?.acSubmissionNum    || [];
  const t = total.find(d => d.difficulty === "All")?.submissions || 0;
  const a = ac.find(d => d.difficulty === "All")?.submissions    || 0;
  return t === 0 ? 0 : Math.round((a / t) * 100);
}

router.post("/analyze", async (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: "LeetCode username is required" });
  }

  const clean = username.trim();
  console.log(`[LeetCode] Fetching: ${clean}`);

  try {
    const response = await axios.post(
      LC_GRAPHQL,
      { query: PROFILE_QUERY, variables: { username: clean } },
      {
        headers: {
          "Content-Type": "application/json",
          "Referer":      "https://leetcode.com",
          "User-Agent":   "Mozilla/5.0 DevIntel360/1.0",
          "Origin":       "https://leetcode.com",
        },
        timeout: 12000,
      }
    );

    const gqlErrors = response.data?.errors;
    if (gqlErrors?.length > 0) {
      return res.status(400).json({
        error: `LeetCode API error: ${gqlErrors[0].message}`
      });
    }

    const data = response.data?.data;
    if (!data?.matchedUser) {
      return res.status(404).json({
        error: `User "${clean}" not found on LeetCode.`
      });
    }

    const user        = data.matchedUser;
    const stats       = user.submitStats;
    const contestData = data.userContestRanking;
    const ac          = stats?.acSubmissionNum || [];

    const easy   = ac.find(d => d.difficulty === "Easy")?.count   || 0;
    const medium = ac.find(d => d.difficulty === "Medium")?.count || 0;
    const hard   = ac.find(d => d.difficulty === "Hard")?.count   || 0;
    const total  = easy + medium + hard;
    const skillScore = computeSkillScore(stats, contestData);

    res.json({
      username:    user.username,
      displayName: user.profile?.realName || user.username,
      country:     user.profile?.countryName || null,
      ranking:     user.profile?.ranking     || null,
      skillScore,
      level:       skillLevel(skillScore),
      problemsSolved: { easy, medium, hard, total },
      acceptanceRate: acceptanceRate(stats),
      streak:      user.userCalendar?.streak          || 0,
      activeDays:  user.userCalendar?.totalActiveDays || 0,
      badges:      (user.badges || []).slice(0, 8).map(b => b.displayName),
      skills:      user.profile?.skillTags || [],
      contest: contestData ? {
        attended:      contestData.attendedContestsCount,
        rating:        Math.round(contestData.rating || 0),
        globalRanking: contestData.globalRanking,
        topPercentage: Math.round(contestData.topPercentage || 100),
      } : null,
    });

  } catch (err) {
    if (err.response?.status === 429) {
      return res.status(429).json({ error: "Rate limited by LeetCode. Wait 30s and retry." });
    }
    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      return res.status(504).json({ error: "LeetCode API timed out. Try again." });
    }
    console.error("[LeetCode] Error:", err.message);
    res.status(500).json({ error: "Failed to reach LeetCode: " + err.message });
  }
});

module.exports = router;
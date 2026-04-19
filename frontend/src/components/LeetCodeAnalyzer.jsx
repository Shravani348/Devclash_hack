import React, { useState } from "react";


function LeetCodeAnalyzer() {
  const [username, setUsername] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeLeetCode = async () => {
    try {
      setLoading(true);
      setReport(null);

      const response = await fetch("http://localhost:5000/api/leetcode/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const responseData = await response.json();

      console.log("API Response:", responseData); // debug

      setReport(responseData.data);
        setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          🧠 AI LeetCode Intelligence Dashboard
        </h1>

        {/* INPUT SECTION */}
        <div style={styles.inputBox}>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter LeetCode Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button style={styles.button} onClick={analyzeLeetCode}>
            Analyze
          </button>
        </div>

        {loading && (
          <p style={styles.loading}>Analyzing profile...</p>
        )}

        {/* DASHBOARD */}
        {report && (
          <div style={styles.grid}>

            <div style={styles.card}>
              <h3>👤 Profile</h3>
              <p><b>Username:</b> {report.username}</p>
              <p><b>Level:</b> {report.level}</p>
              <p><b>Ranking:</b> #{report.ranking}</p>
            </div>

            <div style={styles.card}>
              <h3>📊 Skill Score</h3>
              <div style={styles.score}>
                {report.skillScore}/100
              </div>
            </div>

            <div style={styles.card}>
              <h3>💻 Problems Solved</h3>
              <p>Easy: {report.problemsSolved.easy}</p>
              <p>Medium: {report.problemsSolved.medium}</p>
              <p>Hard: {report.problemsSolved.hard}</p>
              <p><b>Total:</b> {report.problemsSolved.total}</p>
            </div>

            <div style={styles.cardWide}>
              <h3>🧠 AI Insight</h3>
              <p>
                {report.skillScore > 70
                  ? "Strong problem-solving skills. Good for product-based companies."
                  : "Needs improvement in DSA consistency and problem solving."}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  bg: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #0f172a, #1e293b, #0f172a)",
    fontFamily: "Arial",
    color: "white"
  },

  container: {
    width: "90%",
    maxWidth: "1000px",
    textAlign: "center",
  },

  title: {
    fontSize: "32px",
    marginBottom: "25px",
  },

  inputBox: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
  },

  input: {
  padding: "12px",
  width: "300px",
  borderRadius: "10px",
  border: "none",
  outline: "none",
  color: "#0f172a",        // ✅ IMPORTANT (dark text)
  backgroundColor: "white", // already good but make sure explicit
  fontWeight: "500"
},

  button: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#38bdf8",
    fontWeight: "bold",
  },

  loading: {
    color: "#38bdf8",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: "15px",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "left",
  },

  cardWide: {
    gridColumn: "span 2",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: "15px",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "left",
  },

  score: {
    fontSize: "40px",
    fontWeight: "bold",
    color: "#38bdf8",
  },
};

export default LeetCodeAnalyzer;
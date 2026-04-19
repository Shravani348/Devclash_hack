import React, { useState } from "react";

const API_BASE = "http://localhost:8000";

function skillLabel(score) {
  if (score >= 80) return { text: "Expert",       color: "#a78bfa" };
  if (score >= 60) return { text: "Advanced",     color: "#34d399" };
  if (score >= 40) return { text: "Intermediate", color: "#fbbf24" };
  if (score >= 20) return { text: "Beginner",     color: "#f87171" };
  return               { text: "Novice",          color: "#9ca3af" };
}

function fmtNum(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString();
}

function Ring({ value, max = 100, size = 96, stroke = 8, color = "#6366f1", label }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(1, value / max);
  const dash = circ * pct;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,.08)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray .8s ease" }}/>
        <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize={size*0.22} fontWeight="700"
          style={{ transform:`rotate(90deg)`, transformOrigin:`${size/2}px ${size/2}px` }}>
          {value}
        </text>
      </svg>
      {label && <span style={{ fontSize:11, color:"#9ca3af", textAlign:"center" }}>{label}</span>}
    </div>
  );
}

function DiffBar({ label, count, total, color, bg }) {
  const pct = total > 0 ? Math.round((count/total)*100) : 0;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:13, color:"#d1d5db" }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:600, color }}>
          {count} <span style={{ color:"#6b7280", fontWeight:400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height:6, borderRadius:99, background:bg, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:99, background:color,
          width:`${pct}%`, transition:"width .8s ease" }}/>
      </div>
    </div>
  );
}

function Tile({ label, value, accent }) {
  return (
    <div style={{ background:"rgba(255,255,255,.04)",
      border:"1px solid rgba(255,255,255,.08)",
      borderRadius:12, padding:"16px 20px", textAlign:"center" }}>
      <div style={{ fontSize:22, fontWeight:700, color:accent||"#fff" }}>{value}</div>
      <div style={{ fontSize:11, color:"#6b7280", marginTop:3 }}>{label}</div>
    </div>
  );
}

export default function LeetCodeAnalyzer() {
  const [username, setUsername] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [data,     setData]     = useState(null);
  const [error,    setError]    = useState("");

  const analyze = async () => {
    const u = username.trim();
    if (!u) { setError("Please enter a LeetCode username."); return; }
    setLoading(true); setError(""); setData(null);

    try {
      const res  = await fetch(`${API_BASE}/api/leetcode/analyze`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ username: u }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || `Server error ${res.status}`); return; }
      setData(json.data || json); // Support both nested 'data' and flat response
    } catch(err) {
      setError(`Network error: ${err.message}. Make sure the backend is running on port 8000.`);
    } finally {
      setLoading(false);
    }
  };

  const level = data ? skillLabel(data.skillScore || 0) : null;
  const total = data?.problemsSolved?.total || 0;

  return (
    <div style={{ minHeight:"auto",
      background:"transparent",
      fontFamily:"'Segoe UI',system-ui,sans-serif", color:"#f3f4f6", padding:"20px 16px" }}>
      <div style={{ maxWidth:720, margin:"0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>⚡</div>
          <h1 style={{ fontSize:28, fontWeight:800, margin:0,
            background:"linear-gradient(90deg,#6366f1,#a78bfa,#34d399)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            LeetCode Intelligence
          </h1>
          <p style={{ color:"#6b7280", fontSize:14, marginTop:8 }}>
            Real-time profile analysis from LeetCode's public API
          </p>
        </div>

        {/* ── Input ── */}
        <div style={{ display:"flex", gap:10, marginBottom:12,
          background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)",
          borderRadius:14, padding:6 }}>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="Enter LeetCode username…"
            style={{ flex:1, background:"transparent", border:"none", outline:"none",
              color:"#f3f4f6", fontSize:15, padding:"10px 14px" }}
          />
          <button
            onClick={analyze}
            disabled={loading}
            style={{ background: loading
                ? "rgba(99,102,241,.4)"
                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border:"none", borderRadius:10, color:"#fff", fontSize:14,
              fontWeight:600, cursor: loading ? "not-allowed" : "pointer",
              padding:"10px 28px", transition:"opacity .2s", whiteSpace:"nowrap" }}>
            {loading ? "Analysing…" : "Analyze"}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background:"rgba(239,68,68,.12)",
            border:"1px solid rgba(239,68,68,.3)",
            borderRadius:12, padding:"14px 18px", marginBottom:20,
            color:"#fca5a5", fontSize:14, lineHeight:1.5 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign:"center", padding:"60px 0", color:"#4b5563" }}>
            <div style={{ fontSize:32, marginBottom:12 }} className="animate-spin">⟳</div>
            Fetching from LeetCode…
          </div>
        )}

        {/* RESULTS */}
        {data && !loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }} className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Profile card */}
            <div style={{ background:"rgba(255,255,255,.04)",
              border:"1px solid rgba(255,255,255,.08)",
              borderRadius:16, padding:"24px 28px",
              display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
              <Ring value={data.skillScore || 0} color={level.color} size={96} label="Skill score"/>
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontSize:22, fontWeight:700, color:"#fff" }}>
                  {data.displayName || data.username}
                </div>
                <div style={{ fontSize:13, color:"#6b7280" }}>@{data.username}</div>
                <span style={{ display:"inline-block", marginTop:10,
                  background:`${level.color}22`, border:`1px solid ${level.color}55`,
                  color:level.color, fontSize:12, fontWeight:600,
                  padding:"4px 12px", borderRadius:99 }}>
                  {level.text}
                </span>
              </div>
              {data.ranking && (
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:"#6b7280" }}>Global rank</div>
                  <div style={{ fontSize:26, fontWeight:800, color:"#fbbf24" }}>
                    #{fmtNum(data.ranking)}
                  </div>
                </div>
              )}
            </div>

            {/* Problems solved */}
            <div style={{ background:"rgba(255,255,255,.04)",
              border:"1px solid rgba(255,255,255,.08)",
              borderRadius:16, padding:"24px 28px" }}>
              <div style={{ fontSize:12, color:"#6b7280", fontWeight:600,
                letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:20 }}>
                Problems Solved — {fmtNum(total)} total
              </div>
              <div style={{ display:"flex", gap:32, alignItems:"center", flexWrap:"wrap" }}>
                <Ring value={total} max={Math.max(total,500)} size={80}
                  color="#6366f1" stroke={7}/>
                <div style={{ flex:1, minWidth:200 }}>
                  <DiffBar label="Easy"
                    count={data.problemsSolved.easy} total={total}
                    color="#34d399" bg="rgba(52,211,153,.15)"/>
                  <DiffBar label="Medium"
                    count={data.problemsSolved.medium} total={total}
                    color="#fbbf24" bg="rgba(251,191,36,.15)"/>
                  <DiffBar label="Hard"
                    count={data.problemsSolved.hard} total={total}
                    color="#f87171" bg="rgba(248,113,113,.15)"/>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
              <Tile label="Acceptance rate"
                value={`${data.acceptanceRate ?? "—"}%`} accent="#34d399"/>
              <Tile label="Day streak"
                value={fmtNum(data.streak || 0)}              accent="#f59e0b"/>
              <Tile label="Active days"
                value={fmtNum(data.activeDays || 0)}          accent="#6366f1"/>
            </div>

          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div style={{ textAlign:"center", marginTop:60, color:"#374151" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:14 }}>Enter a username above and click Analyze</div>
          </div>
        )}

      </div>
      <style>{`
        input::placeholder { color: #4b5563; }
        * { box-sizing: border-box; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
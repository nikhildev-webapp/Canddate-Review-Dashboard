import { useState, useMemo, useCallback } from "react";

const COLLEGES = [
  "IIT Delhi","IIT Bombay","IIT Madras","NIT Trichy","BITS Pilani","IIT Kharagpur",
  "VIT Vellore","Manipal Institute","DTU Delhi","NSIT Delhi","IIT Hyderabad",
  "IIT Roorkee","Jadavpur University","PSG Tech","Amity University","SRM University",
  "IIIT Hyderabad","NIT Warangal","IIT Guwahati","College of Engineering Pune"
];
const FIRST = ["Arjun","Priya","Rohan","Sneha","Vikram","Ananya","Karan","Divya","Rahul","Meera","Aditya","Pooja","Siddharth","Ishaan","Neha","Amit","Kavya","Varun","Shreya","Tarun","Nisha","Ayush","Riya","Harsh","Sunita","Dev","Lakshmi","Nikhil","Ankita","Yash","Swati","Rajesh","Preeti","Vivek","Deepa","Manish","Simran","Gaurav","Komal","Abhishek"];
const LAST = ["Sharma","Patel","Singh","Kumar","Gupta","Joshi","Mishra","Yadav","Reddy","Nair","Iyer","Verma","Mehta","Shah","Khanna","Agarwal","Bose","Roy","Das","Pillai","Naidu","Sinha","Tiwari","Chauhan","Banerjee","Chatterjee","Desai","Jain","Kapoor","Malhotra"];

function rng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296; };
}

function genCandidates() {
  const r = rng(42);
  return Array.from({ length: 100 }, (_, i) => {
    const name = `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
    const college = COLLEGES[Math.floor(r() * COLLEGES.length)];
    const as = Math.round(30 + r() * 70);
    const vs = Math.round(30 + r() * 70);
    const ats = Math.round(30 + r() * 70);
    const gs = Math.round(30 + r() * 70);
    const cs = Math.round(30 + r() * 70);
    const priority = calcPriority(as, vs, ats, gs, cs);
    return { id: i + 1, name, college, assignment_score: as, video_score: vs, ats_score: ats, github_score: gs, communication_score: cs, priority, status: "pending", shortlisted: false, reviewed: false };
  });
}

function calcPriority(as, vs, ats, gs, cs) {
  return Math.round(as * 0.30 + vs * 0.25 + ats * 0.20 + gs * 0.15 + cs * 0.10);
}

function priorityLabel(score) {
  if (score >= 75) return "P0";
  if (score >= 60) return "P1";
  if (score >= 45) return "P2";
  return "P3";
}

const PColors = { P0: "#22c55e", P1: "#eab308", P2: "#f97316", P3: "#ef4444" };
const PBg = { P0: "rgba(34,197,94,0.12)", P1: "rgba(234,179,8,0.12)", P2: "rgba(249,115,22,0.12)", P3: "rgba(239,68,68,0.12)" };

const ScoreBar = ({ value, color = "#6366f1" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s" }} />
    </div>
    <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 28, textAlign: "right" }}>{value}</span>
  </div>
);

const PBadge = ({ label, large }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: large ? "4px 12px" : "2px 8px",
    fontSize: large ? 13 : 11, fontWeight: 600, borderRadius: 6,
    color: PColors[label], background: PBg[label],
    border: `1px solid ${PColors[label]}30`,
    letterSpacing: "0.03em"
  }}>{label}</span>
);

const CRITERIA = [
  { key: "ui_quality", label: "UI Quality" },
  { key: "component_structure", label: "Component Structure" },
  { key: "state_handling", label: "State Handling" },
  { key: "edge_cases", label: "Edge Case Handling" },
  { key: "responsiveness", label: "Responsiveness" },
  { key: "accessibility", label: "Accessibility" },
];
const VIDEO_CRITERIA = [
  { key: "clarity", label: "Clarity" },
  { key: "confidence", label: "Confidence" },
  { key: "architecture", label: "Architecture Explanation" },
  { key: "tradeoffs", label: "Tradeoff Reasoning" },
  { key: "communication", label: "Communication" },
];

export default function App() {
  const [candidates, setCandidates] = useState(genCandidates);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ asMin: 0, asMax: 100, vsMin: 0, vsMax: 100, atsMin: 0, atsMax: 100, status: "all" });
  const [sortBy, setSortBy] = useState("priority");
  const [sortDir, setSortDir] = useState("desc");
  const [selected, setSelected] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [tab, setTab] = useState("overview");
  const [ratings, setRatings] = useState({});
  const [videoRatings, setVideoRatings] = useState({});
  const [notes, setNotes] = useState({});
  const [noteInput, setNoteInput] = useState("");
  const [timestampInput, setTimestampInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    let c = candidates.filter(x =>
      x.name.toLowerCase().includes(search.toLowerCase()) &&
      x.assignment_score >= filters.asMin && x.assignment_score <= filters.asMax &&
      x.video_score >= filters.vsMin && x.video_score <= filters.vsMax &&
      x.ats_score >= filters.atsMin && x.ats_score <= filters.atsMax &&
      (filters.status === "all" || x.status === filters.status)
    );
    c.sort((a, b) => {
      let va, vb;
      if (sortBy === "priority") { va = a.priority; vb = b.priority; }
      else if (sortBy === "assignment") { va = a.assignment_score; vb = b.assignment_score; }
      else if (sortBy === "video") { va = a.video_score; vb = b.video_score; }
      else if (sortBy === "ats") { va = a.ats_score; vb = b.ats_score; }
      else { va = a.name; vb = b.name; }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return c;
  }, [candidates, search, filters, sortBy, sortDir]);

  const stats = useMemo(() => ({
    total: candidates.length,
    reviewed: candidates.filter(x => x.reviewed).length,
    shortlisted: candidates.filter(x => x.shortlisted).length,
    pending: candidates.filter(x => !x.reviewed).length,
  }), [candidates]);

  const updateCandidate = useCallback((id, patch) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...patch };
      updated.priority = calcPriority(updated.assignment_score, updated.video_score, updated.ats_score, updated.github_score, updated.communication_score);
      return updated;
    }));
    if (selected?.id === id) setSelected(prev => {
      const updated = { ...prev, ...patch };
      updated.priority = calcPriority(updated.assignment_score, updated.video_score, updated.ats_score, updated.github_score, updated.communication_score);
      return updated;
    });
  }, [selected]);

  const openCandidate = (c) => { setSelected(c); setTab("overview"); setSidebarOpen(true); };
  const closeDetail = () => { setSidebarOpen(false); setTimeout(() => setSelected(null), 200); };

  const toggleCompare = (id) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const compareList = useMemo(() => candidates.filter(c => compareIds.includes(c.id)), [candidates, compareIds]);

  const setRating = (cid, key, val) => setRatings(prev => ({ ...prev, [cid]: { ...(prev[cid] || {}), [key]: val } }));
  const setVRating = (cid, key, val) => setVideoRatings(prev => ({ ...prev, [cid]: { ...(prev[cid] || {}), [key]: val } }));

  const addNote = (cid) => {
    if (!noteInput.trim()) return;
    const entry = timestampInput ? `${timestampInput} – ${noteInput}` : noteInput;
    setNotes(prev => ({ ...prev, [cid]: [...(prev[cid] || []), entry] }));
    setNoteInput(""); setTimestampInput("");
  };

  const markReviewed = (id) => { updateCandidate(id, { reviewed: true, status: "reviewed" }); };
  const toggleShortlist = (id, val) => { updateCandidate(id, { shortlisted: val }); };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#e2e8f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #6366f1; cursor: pointer; }
        input[type=text], input[type=search], select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; transition: border-color 0.2s; }
        input[type=text]:focus, input[type=search]:focus, select:focus { border-color: #6366f1; }
        select option { background: #1e293b; }
        .row-hover:hover { background: rgba(255,255,255,0.04) !important; cursor: pointer; }
        .tab-btn { background: none; border: none; color: #64748b; padding: 8px 16px; cursor: pointer; font-size: 13px; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: #6366f1; border-bottom-color: #6366f1; }
        .tab-btn:hover { color: #e2e8f0; }
        .action-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
        .action-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .action-btn.active { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #818cf8; }
        .primary-btn { background: #6366f1; border: none; color: white; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 500; transition: background 0.2s; }
        .primary-btn:hover { background: #5254cc; }
        .score-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; border-radius: 6px; padding: 3px 8px; width: 56px; font-size: 12px; font-family: 'Space Mono', monospace; }
        .drawer { position: fixed; top: 0; right: 0; height: 100vh; width: min(480px, 100vw); background: #111827; border-left: 1px solid rgba(255,255,255,0.08); z-index: 50; overflow-y: auto; transition: transform 0.25s ease; transform: translateX(100%); }
        .drawer.open { transform: translateX(0); }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        .compare-panel { position: fixed; bottom: 0; left: 0; right: 0; background: #111827; border-top: 1px solid rgba(255,255,255,0.1); z-index: 30; padding: 0; }
      `}</style>

      {/* Header */}
      <header style={{ background: "#0d1426", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>TalentOS</div>
            <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.05em" }}>HIRING INTELLIGENCE</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="action-btn" onClick={() => setCompareMode(m => !m)} style={{ borderColor: compareMode ? "#6366f1" : undefined, color: compareMode ? "#818cf8" : undefined }}>
            ⊞ Compare {compareIds.length > 0 ? `(${compareIds.length})` : ""}
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ padding: "20px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
        {[
          { label: "Total Candidates", value: stats.total, color: "#6366f1", icon: "👥" },
          { label: "Reviewed", value: stats.reviewed, color: "#22c55e", icon: "✓" },
          { label: "Shortlisted", value: stats.shortlisted, color: "#eab308", icon: "★" },
          { label: "Pending Review", value: stats.pending, color: "#f97316", icon: "⏳" },
        ].map(s => (
          <div key={s.label} style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Space Mono',monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ padding: "16px 24px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input type="search" placeholder="🔍 Search candidates..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="priority">Sort: Priority</option>
          <option value="assignment">Sort: Assignment</option>
          <option value="video">Sort: Video</option>
          <option value="ats">Sort: ATS</option>
          <option value="name">Sort: Name</option>
        </select>
        <button className="action-btn" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>{sortDir === "desc" ? "↓" : "↑"}</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}>
          <span>Assignment: {filters.asMin}–{filters.asMax}</span>
          <input type="range" min={0} max={100} value={filters.asMin} onChange={e => setFilters(f => ({ ...f, asMin: +e.target.value }))} style={{ width: 60 }} />
          <input type="range" min={0} max={100} value={filters.asMax} onChange={e => setFilters(f => ({ ...f, asMax: +e.target.value }))} style={{ width: 60 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}>
          <span>Video: {filters.vsMin}–{filters.vsMax}</span>
          <input type="range" min={0} max={100} value={filters.vsMin} onChange={e => setFilters(f => ({ ...f, vsMin: +e.target.value }))} style={{ width: 60 }} />
          <input type="range" min={0} max={100} value={filters.vsMax} onChange={e => setFilters(f => ({ ...f, vsMax: +e.target.value }))} style={{ width: 60 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}>
          <span>ATS: {filters.atsMin}–{filters.atsMax}</span>
          <input type="range" min={0} max={100} value={filters.atsMin} onChange={e => setFilters(f => ({ ...f, atsMin: +e.target.value }))} style={{ width: 60 }} />
          <input type="range" min={0} max={100} value={filters.atsMax} onChange={e => setFilters(f => ({ ...f, atsMax: +e.target.value }))} style={{ width: 60 }} />
        </div>
        <span style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>{filtered.length} results</span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 24px 24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {compareMode && <th style={{ width: 36, padding: "10px 8px", color: "#475569", fontSize: 11 }}></th>}
              <th style={{ textAlign: "left", padding: "10px 12px", color: "#475569", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Candidate</th>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "#475569", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>College</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "#475569", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Assignment</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "#475569", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Video</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "#475569", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>ATS</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "#475569", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>GitHub</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "#475569", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Priority</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "#475569", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "#475569", fontWeight: 500, fontSize: 11 }}>⋯</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const pl = priorityLabel(c.priority);
              const isComparing = compareIds.includes(c.id);
              return (
                <tr key={c.id} className="row-hover"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: c.shortlisted ? "rgba(234,179,8,0.04)" : "transparent" }}
                  onClick={() => openCandidate(c)}>
                  {compareMode && (
                    <td style={{ padding: "10px 8px", textAlign: "center" }} onClick={e => { e.stopPropagation(); toggleCompare(c.id); }}>
                      <div style={{ width: 18, height: 18, border: `2px solid ${isComparing ? "#6366f1" : "rgba(255,255,255,0.15)"}`, borderRadius: 4, background: isComparing ? "#6366f1" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}>
                        {isComparing && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
                      </div>
                    </td>
                  )}
                  <td style={{ padding: "12px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: `hsl(${c.id * 37 % 360},40%,25%)`, border: `1px solid hsl(${c.id * 37 % 360},60%,40%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: `hsl(${c.id * 37 % 360},60%,75%)`, flexShrink: 0 }}>
                        {c.name.split(" ").map(x => x[0]).join("")}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: "#e2e8f0" }}>{c.name}</div>
                        {c.shortlisted && <div style={{ fontSize: 10, color: "#eab308" }}>★ Shortlisted</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px", color: "#64748b", fontSize: 12 }}>{c.college}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: c.assignment_score >= 70 ? "#22c55e" : c.assignment_score >= 50 ? "#eab308" : "#ef4444" }}>{c.assignment_score}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: c.video_score >= 70 ? "#22c55e" : c.video_score >= 50 ? "#eab308" : "#ef4444" }}>{c.video_score}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#94a3b8" }}>{c.ats_score}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#94a3b8" }}>{c.github_score}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <PBadge label={pl} />
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 2, fontFamily: "'Space Mono',monospace" }}>{c.priority}</div>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: c.reviewed ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.12)", color: c.reviewed ? "#22c55e" : "#64748b" }}>
                      {c.reviewed ? "Reviewed" : "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button className="action-btn" onClick={e => { e.stopPropagation(); toggleShortlist(c.id, !c.shortlisted); }} style={{ fontSize: 14, padding: "4px 8px", color: c.shortlisted ? "#eab308" : "#475569" }}>★</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>No candidates match your filters</div>
        )}
      </div>

      {/* Compare Panel */}
      {compareMode && compareIds.length >= 2 && (
        <div className="compare-panel">
          <div style={{ padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 48 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Comparing {compareIds.length} candidates</span>
            <button className="action-btn" onClick={() => setCompareIds([])}>Clear</button>
          </div>
          <div style={{ padding: "16px 24px", overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13, minWidth: "100%" }}>
              <thead>
                <tr>
                  <td style={{ padding: "6px 12px", color: "#475569", fontSize: 11, width: 140 }}>Metric</td>
                  {compareList.map(c => (
                    <td key={c.id} style={{ padding: "6px 12px", fontWeight: 500, minWidth: 140 }}>{c.name}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Assignment", key: "assignment_score" },
                  { label: "Video", key: "video_score" },
                  { label: "ATS", key: "ats_score" },
                  { label: "GitHub", key: "github_score" },
                  { label: "Communication", key: "communication_score" },
                  { label: "Priority Score", key: "priority" },
                ].map(row => {
                  const vals = compareList.map(c => c[row.key]);
                  const max = Math.max(...vals);
                  return (
                    <tr key={row.key} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "8px 12px", color: "#64748b", fontSize: 12 }}>{row.label}</td>
                      {compareList.map(c => (
                        <td key={c.id} style={{ padding: "8px 12px" }}>
                          <span style={{ fontFamily: "'Space Mono',monospace", color: c[row.key] === max ? "#22c55e" : "#94a3b8" }}>{c[row.key]}</span>
                          {row.key === "priority" && <PBadge label={priorityLabel(c[row.key])} />}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overlay */}
      {sidebarOpen && <div className="overlay" onClick={closeDetail} />}

      {/* Detail Drawer */}
      <div className={`drawer ${sidebarOpen ? "open" : ""}`}>
        {selected && (
          <>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#111827", zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `hsl(${selected.id * 37 % 360},40%,25%)`, border: `1px solid hsl(${selected.id * 37 % 360},60%,40%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: `hsl(${selected.id * 37 % 360},60%,75%)` }}>
                  {selected.name.split(" ").map(x => x[0]).join("")}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{selected.college}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <PBadge label={priorityLabel(selected.priority)} large />
                <button className="action-btn" onClick={closeDetail} style={{ fontSize: 16, padding: "4px 10px" }}>×</button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 20px" }}>
              {["overview", "assignment", "video"].map(t => (
                <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t === "overview" ? "Overview" : t === "assignment" ? "Assignment Eval" : "Video Eval"}
                </button>
              ))}
            </div>

            <div style={{ padding: "20px" }}>
              {tab === "overview" && (
                <div>
                  {/* Priority meter */}
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Priority Score</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: PColors[priorityLabel(selected.priority)] }}>{selected.priority}</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
                      <div style={{ width: `${selected.priority}%`, height: "100%", background: `linear-gradient(90deg, ${PColors[priorityLabel(selected.priority)]}80, ${PColors[priorityLabel(selected.priority)]})`, borderRadius: 3, transition: "width 0.4s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#475569" }}>
                      <span>P3 Reject</span><span>P2 Later</span><span>P1 Shortlist</span><span>P0 Interview</span>
                    </div>
                  </div>

                  {/* Scores */}
                  {[
                    { label: "Assignment Score", key: "assignment_score", color: "#6366f1", weight: "30%" },
                    { label: "Video Score", key: "video_score", color: "#8b5cf6", weight: "25%" },
                    { label: "ATS Score", key: "ats_score", color: "#06b6d4", weight: "20%" },
                    { label: "GitHub Score", key: "github_score", color: "#10b981", weight: "15%" },
                    { label: "Communication Score", key: "communication_score", color: "#f59e0b", weight: "10%" },
                  ].map(s => (
                    <div key={s.key} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{s.label} <span style={{ color: "#475569", fontSize: 11 }}>({s.weight})</span></span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input className="score-input" type="number" min={0} max={100}
                            value={candidates.find(c => c.id === selected.id)?.[s.key] ?? selected[s.key]}
                            onChange={e => updateCandidate(selected.id, { [s.key]: +e.target.value })} />
                        </div>
                      </div>
                      <ScoreBar value={candidates.find(c => c.id === selected.id)?.[s.key] ?? selected[s.key]} color={s.color} />
                    </div>
                  ))}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                    <button className="primary-btn" onClick={() => markReviewed(selected.id)} style={{ flex: 1 }}>
                      {selected.reviewed ? "✓ Reviewed" : "Mark Reviewed"}
                    </button>
                    <button className="action-btn" style={{ flex: 1, color: selected.shortlisted ? "#eab308" : undefined, borderColor: selected.shortlisted ? "#eab308" : undefined }}
                      onClick={() => toggleShortlist(selected.id, !selected.shortlisted)}>
                      {selected.shortlisted ? "★ Shortlisted" : "☆ Shortlist"}
                    </button>
                  </div>
                </div>
              )}

              {tab === "assignment" && (
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Rate the candidate's assignment submission across key dimensions.</div>
                  {CRITERIA.map(c => {
                    const val = ratings[selected.id]?.[c.key] ?? 3;
                    return (
                      <div key={c.key} style={{ marginBottom: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 13, color: "#e2e8f0" }}>{c.label}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[1,2,3,4,5].map(n => (
                              <button key={n} onClick={() => setRating(selected.id, c.key, n)}
                                style={{ width: 28, height: 28, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                                  background: n <= val ? "#6366f1" : "rgba(255,255,255,0.07)", color: n <= val ? "white" : "#475569" }}>
                                {n}
                              </button>
                            ))}
                            <span style={{ marginLeft: 6, fontSize: 12, color: "#64748b", alignSelf: "center" }}>/5</span>
                          </div>
                        </div>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                          <div style={{ width: `${val * 20}%`, height: "100%", background: "#6366f1", borderRadius: 2, transition: "width 0.2s" }} />
                        </div>
                      </div>
                    );
                  })}
                  {ratings[selected.id] && (
                    <div style={{ marginTop: 12, padding: 12, background: "rgba(99,102,241,0.08)", borderRadius: 8, border: "1px solid rgba(99,102,241,0.2)" }}>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Average Assignment Rating</div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, color: "#818cf8" }}>
                        {(Object.values(ratings[selected.id]).reduce((a, b) => a + b, 0) / Object.values(ratings[selected.id]).length).toFixed(1)}/5
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "video" && (
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Evaluate the candidate's video explanation and communication skills.</div>
                  {VIDEO_CRITERIA.map(c => {
                    const val = videoRatings[selected.id]?.[c.key] ?? 3;
                    return (
                      <div key={c.key} style={{ marginBottom: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 13, color: "#e2e8f0" }}>{c.label}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[1,2,3,4,5].map(n => (
                              <button key={n} onClick={() => setVRating(selected.id, c.key, n)}
                                style={{ width: 28, height: 28, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                                  background: n <= val ? "#8b5cf6" : "rgba(255,255,255,0.07)", color: n <= val ? "white" : "#475569" }}>
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                          <div style={{ width: `${val * 20}%`, height: "100%", background: "#8b5cf6", borderRadius: 2, transition: "width 0.2s" }} />
                        </div>
                      </div>
                    );
                  })}

                  {/* Timestamp notes */}
                  <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Timestamp Notes</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <input type="text" placeholder="mm:ss" value={timestampInput} onChange={e => setTimestampInput(e.target.value)} style={{ width: 70 }} />
                      <input type="text" placeholder="Add a note..." value={noteInput} onChange={e => setNoteInput(e.target.value)} style={{ flex: 1 }}
                        onKeyDown={e => e.key === "Enter" && addNote(selected.id)} />
                      <button className="primary-btn" onClick={() => addNote(selected.id)}>Add</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {(notes[selected.id] || []).map((n, i) => (
                        <div key={i} style={{ fontSize: 12, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 6, color: "#94a3b8", borderLeft: "2px solid #8b5cf6" }}>
                          {n}
                        </div>
                      ))}
                      {(!notes[selected.id] || !notes[selected.id].length) && (
                        <div style={{ fontSize: 12, color: "#334155", textAlign: "center", padding: "12px 0" }}>No notes yet</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

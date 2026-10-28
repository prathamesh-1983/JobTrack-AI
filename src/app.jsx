import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BriefcaseBusiness, CalendarDays,
  Check, ChevronDown, CircleHelp, ClipboardList, Clock3, ExternalLink,
  FileDown, Filter, LayoutDashboard, Lightbulb, Link2, Plus, Search,
  Settings2, Sparkles, Target, Trash2, TrendingUp, X, Pencil, Menu
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { emptyApplication, matchScore, sampleApplications } from "./data";
import { isAppwriteConfigured, tablesDB, ID, Query, databaseId, tableId } from "./appwrite";

const statuses = ["Applied", "Shortlisted", "Interview", "Offer", "Rejected"];
const statusClass = s => s.toLowerCase().replaceAll(" ", "-");
const prettyDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

function App() {
  const [apps, setApps] = useState(sampleApplications);
  const [mode, setMode] = useState(isAppwriteConfigured ? "loading" : "demo");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [view, setView] = useState("Overview");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyApplication);
  const [mobileNav, setMobileNav] = useState(false);
  const [resumeText, setResumeText] = useState("Excel, Python, Power BI, data cleaning, reporting, communication");
  const [jobText, setJobText] = useState("Excel, SQL, Power BI, reporting, data quality, Python");
  const [aiOpen, setAiOpen] = useState(false);

  async function loadRows() {
    if (!isAppwriteConfigured) { setMode("demo"); return; }
    try {
      setMode("loading");
      const result = await tablesDB.listRows({ databaseId, tableId, queries: [Query.orderDesc("$createdAt"), Query.limit(100)] });
      setApps(result.rows || []);
      setMode("live");
      setNotice("Connected to Appwrite TablesDB.");
    } catch (error) {
      setMode("error");
      setNotice(`Appwrite connection failed: ${error.message}. Check your IDs, endpoint, and table permissions.`);
    }
  }

  useEffect(() => { loadRows(); }, []);

  const visibleApps = useMemo(() => apps.filter(a => {
    const q = search.toLowerCase();
    const matches = [a.company, a.role, a.location, a.source].some(v => (v || "").toLowerCase().includes(q));
    return matches && (filter === "All statuses" || a.status === filter);
  }), [apps, search, filter]);

  const counts = useMemo(() => ({
    total: apps.length,
    interviews: apps.filter(a => ["Interview", "Shortlisted"].includes(a.status)).length,
    offers: apps.filter(a => a.status === "Offer").length,
    rejected: apps.filter(a => a.status === "Rejected").length,
    responseRate: apps.length ? Math.round((apps.filter(a => ["Interview", "Shortlisted", "Offer", "Rejected"].includes(a.status)).length / apps.length) * 100) : 0
  }), [apps]);

  const chartData = useMemo(() => statuses.map(status => ({
    status, applications: apps.filter(a => a.status === status).length
  })), [apps]);

  const upcoming = useMemo(() => apps.filter(a => a.interviewDate && a.interviewDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.interviewDate.localeCompare(b.interviewDate)).slice(0, 4), [apps]);

  function openNew() { setEditing(null); setForm({ ...emptyApplication }); setModal(true); }
  function openEdit(app) { setEditing(app.$id); setForm({ ...emptyApplication, ...app }); setModal(true); }
  function updateField(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

  async function saveApplication(e) {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.company.trim() || !payload.role.trim()) { setNotice("Company and role are required."); return; }
    try {
      if (mode === "live") {
        if (editing) {
          const updated = await tablesDB.updateRow({ databaseId, tableId, rowId: editing, data: payload });
          setApps(prev => prev.map(a => a.$id === editing ? updated : a));
        } else {
          const created = await tablesDB.createRow({ databaseId, tableId, rowId: ID.unique(), data: payload });
          setApps(prev => [created, ...prev]);
        }
      } else {
        if (editing) setApps(prev => prev.map(a => a.$id === editing ? { ...payload, $id: editing } : a));
        else setApps(prev => [{ ...payload, $id: `demo-${Date.now()}` }, ...prev]);
      }
      setModal(false); setNotice(mode === "live" ? "Application saved to Appwrite." : "Saved in demo mode. Configure Appwrite to persist your records.");
    } catch (error) { setNotice(`Could not save: ${error.message}`); }
  }

  async function deleteApplication(app) {
    if (!window.confirm(`Delete the application for ${app.company}?`)) return;
    try {
      if (mode === "live") await tablesDB.deleteRow({ databaseId, tableId, rowId: app.$id });
      setApps(prev => prev.filter(a => a.$id !== app.$id));
      setNotice(mode === "live" ? "Application deleted from Appwrite." : "Application removed from this demo session.");
    } catch (error) { setNotice(`Could not delete: ${error.message}`); }
  }

  function exportCsv() {
    const cols = ["company","role","location","status","jobType","salary","appliedDate","interviewDate","source","jobUrl","notes"];
    const escape = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [cols.join(","), ...visibleApps.map(a => cols.map(k => escape(a[k])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "jobtrack-applications.csv"; link.click(); URL.revokeObjectURL(url);
  }

  const navItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Applications", icon: ClipboardList },
    { name: "Interview planner", icon: CalendarDays },
    { name: "Career insights", icon: Sparkles }
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><BriefcaseBusiness size={21}/></div><span>jobtrack<span className="brand-ai">.ai</span></span></div>
      <div className="workspace"><div className="workspace-avatar">J</div><div><strong>My job search</strong><small>Personal workspace</small></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.name} className={`nav-item ${view === item.name ? "active" : ""}`} onClick={() => { setView(item.name); setMobileNav(false); }}><item.icon size={18}/><span>{item.name}</span>{item.name === "Applications" && <span className="nav-count">{apps.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="tip-card"><div className="tip-icon"><Lightbulb size={17}/></div><strong>Small steps, big career moves.</strong><p>Keep your pipeline updated and follow up consistently.</p><button onClick={() => setAiOpen(true)}>Explore career insights <span>↗</span></button></div>
        <div className="profile"><div className="profile-avatar">JD</div><div><strong>Job Seeker</strong><small>Personal account</small></div><Settings2 size={17}/></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" aria-label="Open menu" onClick={() => setMobileNav(!mobileNav)}><Menu size={20}/></button>
        <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{view}</strong></div>
        <div className="top-actions"><span className={`connection ${mode}`}><i/>{mode === "live" ? "Appwrite connected" : mode === "loading" ? "Connecting…" : mode === "error" ? "Connection issue" : "Demo mode"}</span><button className="avatar-btn" title="Profile">JD</button></div>
      </header>

      <div className="page-content">
        {notice && <div className={`notice ${mode === "error" ? "notice-error" : ""}`}><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={15}/></button></div>}
        {mode === "demo" && <div className="demo-banner"><Sparkles size={16}/><span><strong>Preview mode</strong> — sample records are shown. Connect your Appwrite TablesDB to persist your own data.</span><button onClick={() => setNotice("Create a .env file using .env.example, then configure your Appwrite project, database, table, and permissions. See README.md.")}>Setup guide</button></div>}

        {view === "Overview" && <>
          <div className="page-heading"><div><div className="eyebrow">MONDAY MOTIVATION, EVERY DAY <span>✦</span></div><h1>Your career, <em>in motion.</em></h1><p>Track every opportunity. Make your next move with confidence.</p></div><button className="primary-btn" onClick={openNew}><Plus size={17}/> Add application</button></div>
          <div className="metric-grid">
            <Metric title="Total applications" value={counts.total} icon={BriefcaseBusiness} color="pink" trend="Your pipeline at a glance" />
            <Metric title="Interviews & shortlisted" value={counts.interviews} icon={CalendarDays} color="purple" trend="Opportunities progressing" />
            <Metric title="Offers received" value={counts.offers} icon={Target} color="green" trend="Celebrate every win" />
            <Metric title="Response rate" value={`${counts.responseRate}%`} icon={Activity} color="orange" trend="Excludes applications with no outcome" />
          </div>
          <div className="dashboard-grid">
            <section className="panel chart-panel"><div className="panel-heading"><div><h2>Application pipeline</h2><p>See where your applications stand</p></div><span className="period-pill">All time <ChevronDown size={13}/></span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 12, right: 10, left: -22, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#292936"/><XAxis dataKey="status" tick={{ fill: "#9696a8", fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: "#77778b", fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background: "#1b1b27", border: "1px solid #353544", borderRadius: 12, color: "#f5f5fa" }} cursor={{ fill: "#ffffff08" }}/><Bar dataKey="applications" fill="#f54b82" radius={[6,6,0,0]} maxBarSize={38}/></BarChart></ResponsiveContainer></div><div className="chart-footer"><span><i className="legend-dot"/> Applications by current status</span><span>{counts.total} records</span></div></section>
            <section className="panel interviews-panel"><div className="panel-heading"><div><h2>Upcoming interviews</h2><p>Get ready for your next conversation</p></div><button className="text-btn" onClick={() => setView("Interview planner")}>View all <ExternalLink size={13}/></button></div>
              {upcoming.length ? <div className="interview-list">{upcoming.map(a => <div className="interview-item" key={a.$id}><div className="date-tile"><strong>{new Date(`${a.interviewDate}T00:00:00`).getDate()}</strong><span>{new Date(`${a.interviewDate}T00:00:00`).toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</span></div><div className="interview-info"><strong>{a.role}</strong><span>{a.company}</span><small><Clock3 size={12}/> Interview date</small></div><button className="small-icon" onClick={() => openEdit(a)} aria-label="Edit interview"><Pencil size={14}/></button></div>)}</div> : <div className="empty-state"><CalendarDays size={27}/><strong>No interviews scheduled</strong><span>Add an interview date to see it here.</span></div>}
              <button className="secondary-btn full-btn" onClick={openNew}><Plus size={15}/> Plan an interview</button>
            </section>
          </div>
          <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent applications</h2><p>Your latest career moves</p></div><button className="text-btn" onClick={() => setView("Applications")}>View applications <ExternalLink size={13}/></button></div><ApplicationTable apps={visibleApps.slice(0,5)} onEdit={openEdit} onDelete={deleteApplication}/></section>
          <div className="bottom-cta"><div className="cta-icon"><Sparkles size={20}/></div><div><strong>Make every application count.</strong><p>Use Career Insights to review your skill match and get focused interview prep ideas.</p></div><button onClick={() => {setAiOpen(true);setView("Career insights");}}>Explore insights <ArrowUpRight size={16}/></button></div>
        </>}

        {view === "Applications" && <>
          <div className="page-heading"><div><div className="eyebrow">YOUR OPPORTUNITIES</div><h1>Application <em>tracker.</em></h1><p>One organized place for every role you’re pursuing.</p></div><button className="primary-btn" onClick={openNew}><Plus size={17}/> Add application</button></div>
          <section className="panel applications-panel"><div className="table-toolbar"><div className="search-box"><Search size={16}/><input placeholder="Search company, role, location…" value={search} onChange={e=>setSearch(e.target.value)}/>{search && <button onClick={()=>setSearch("")}><X size={14}/></button>}</div><div className="toolbar-right"><div className="filter-select"><Filter size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div><button className="secondary-btn" onClick={exportCsv}><FileDown size={15}/> Export CSV</button></div></div><ApplicationTable apps={visibleApps} onEdit={openEdit} onDelete={deleteApplication} showActions/></section>
        </>}

        {view === "Interview planner" && <>
          <div className="page-heading"><div><div className="eyebrow">BE READY FOR WHAT’S NEXT</div><h1>Interview <em>planner.</em></h1><p>Keep upcoming interviews and preparation notes in one place.</p></div><button className="primary-btn" onClick={openNew}><Plus size={17}/> Add interview</button></div>
          <section className="panel interview-page">{upcoming.length ? upcoming.map(a=><div className="planner-row" key={a.$id}><div className="date-tile large"><strong>{new Date(`${a.interviewDate}T00:00:00`).getDate()}</strong><span>{new Date(`${a.interviewDate}T00:00:00`).toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</span></div><div className="planner-details"><h3>{a.role}</h3><p>{a.company} · {a.location || "Location not added"}</p><div className="notes-preview">{a.notes || "No preparation notes yet."}</div></div><button className="secondary-btn" onClick={()=>openEdit(a)}><Pencil size={14}/> Edit details</button></div>) : <div className="empty-state roomy"><CalendarDays size={34}/><strong>Your next opportunity starts here.</strong><span>Add an application and set its interview date to plan ahead.</span><button className="primary-btn" onClick={openNew}><Plus size={16}/> Add an application</button></div>}</section>
        </>}

        {view === "Career insights" && <>
          <div className="page-heading"><div><div className="eyebrow">A LITTLE MORE CLARITY</div><h1>Career <em>insights.</em></h1><p>Use transparent skill matching to identify what to prepare next.</p></div><div className="insight-tag"><Sparkles size={15}/> Skill Match Lab</div></div>
          <div className="insights-grid"><section className="panel insight-input"><div className="panel-heading"><div><h2>Compare your skills</h2><p>Paste resume skills and the job description.</p></div><Sparkles size={18} color="#f54b82"/></div><label>Resume skills or experience<textarea value={resumeText} onChange={e=>setResumeText(e.target.value)} rows={5}/></label><label>Target job description<textarea value={jobText} onChange={e=>setJobText(e.target.value)} rows={5}/></label><button className="primary-btn" onClick={()=>setAiOpen(true)}><Sparkles size={16}/> Analyze skill match</button><p className="disclaimer">This is a local keyword-based estimate, not an AI model or a hiring prediction. No text is sent to an external service.</p></section>
          <section className="panel insight-results"><div className="panel-heading"><div><h2>Your skill snapshot</h2><p>Based on the text in the left panel</p></div><Target size={18} color="#f54b82"/></div><SkillSnapshot resumeText={resumeText} jobText={jobText}/></section></div>
          <section className="panel recommendations"><div className="panel-heading"><div><h2>Make your next move</h2><p>Small, practical actions to improve your search</p></div><Lightbulb size={18} color="#f4b860"/></div><div className="recommendation-grid"><Recommendation icon={ClipboardList} title="Keep your pipeline current" body="Update every application after a recruiter reply, interview, or decision."/><Recommendation icon={Target} title="Tailor evidence, not just keywords" body="Prepare one honest project or work example for each important job requirement."/><Recommendation icon={TrendingUp} title="Measure what works" body="Review which roles and sources lead to replies, then focus your effort there."/></div></section>
        </>}
      </div>
      <footer className="footer"><span>© 2026 JobTrack AI</span><span>Built for a more organized job search <span className="footer-heart">♥</span></span><button onClick={()=>setNotice("JobTrack AI stores your application data in your configured Appwrite table when connected. Demo mode uses sample data in memory only.")}><CircleHelp size={14}/> About data</button></footer>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false);}}><form className="application-modal" onSubmit={saveApplication}><div className="modal-header"><div><div className="eyebrow">{editing ? "UPDATE YOUR PIPELINE" : "A NEW OPPORTUNITY"}</div><h2>{editing ? "Edit application" : "Add application"}</h2><p>Keep the details that help you take the next step.</p></div><button type="button" className="icon-btn" onClick={()=>setModal(false)}><X size={19}/></button></div><div className="form-grid">
      <label>Company name *<input name="company" value={form.company} onChange={updateField} required placeholder="e.g. Acme Analytics"/></label>
      <label>Job title *<input name="role" value={form.role} onChange={updateField} required placeholder="e.g. MIS Executive"/></label>
      <label>Location<input name="location" value={form.location} onChange={updateField} placeholder="e.g. Airoli, Hybrid"/></label>
      <label>Status<select name="status" value={form.status} onChange={updateField}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>
      <label>Job type<select name="jobType" value={form.jobType} onChange={updateField}><option>Full-time</option><option>Internship</option><option>Contract</option><option>Part-time</option></select></label>
      <label>Salary / range<input name="salary" value={form.salary} onChange={updateField} placeholder="e.g. ₹3–4 LPA"/></label>
      <label>Applied date<input type="date" name="appliedDate" value={form.appliedDate} onChange={updateField}/></label>
      <label>Interview date<input type="date" name="interviewDate" value={form.interviewDate} onChange={updateField}/></label>
      <label>Application source<select name="source" value={form.source} onChange={updateField}><option>LinkedIn</option><option>Naukri</option><option>Indeed</option><option>Company website</option><option>Referral</option><option>Recruiter</option><option>Other</option></select></label>
      <label>Job posting URL<input type="url" name="jobUrl" value={form.jobUrl} onChange={updateField} placeholder="https://…"/></label>
      <label className="span-two">Job description / required skills<textarea name="description" value={form.description} onChange={updateField} rows={3} placeholder="Paste key responsibilities and skills…"/></label>
      <label className="span-two">Notes and follow-up plan<textarea name="notes" value={form.notes} onChange={updateField} rows={3} placeholder="Recruiter details, interview prep, next follow-up…"/></label>
    </div><div className="modal-footer"><span>* Required fields</span><button type="button" className="secondary-btn" onClick={()=>setModal(false)}>Cancel</button><button className="primary-btn" type="submit"><Check size={16}/>{editing ? "Save changes" : "Save application"}</button></div></form></div>}

    {aiOpen && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setAiOpen(false);}}><div className="insight-modal"><div className="modal-header"><div><div className="eyebrow">CAREER INSIGHTS</div><h2><Sparkles size={22} color="#f54b82"/> Skill match analysis</h2><p>Keyword comparison based on the text you provided.</p></div><button className="icon-btn" onClick={()=>setAiOpen(false)}><X size={19}/></button></div><SkillSnapshot resumeText={resumeText} jobText={jobText}/><div className="insight-callout"><Lightbulb size={18}/><span>Use missing keywords as a learning checklist only when they accurately reflect your experience. Never add a skill to your resume just because a job description asks for it.</span></div><button className="primary-btn full-btn" onClick={()=>{setAiOpen(false);setView("Career insights");}}>Continue to Career Insights</button></div></div>}
  </div>;
}

function Metric({ title, value, icon: Icon, color, trend }) {
  return <div className="metric-card"><div className="metric-top"><span>{title}</span><div className={`metric-icon ${color}`}><Icon size={18}/></div></div><div className="metric-value">{value}</div><div className="metric-foot"><span className={`metric-spark ${color}`}><ArrowUpRight size={13}/></span><span>{trend}</span></div></div>;
}

function ApplicationTable({ apps, onEdit, onDelete, showActions = false }) {
  if (!apps.length) return <div className="empty-state roomy"><ClipboardList size={30}/><strong>No applications match your search.</strong><span>Try another keyword or add a new application.</span></div>;
  return <div className="table-scroll"><table><thead><tr><th>COMPANY / ROLE</th><th>LOCATION</th><th>APPLIED ON</th><th>STATUS</th><th>SOURCE</th>{showActions && <th>ACTIONS</th>}</tr></thead><tbody>{apps.map(a=><tr key={a.$id}><td><div className="company-cell"><div className="company-avatar">{(a.company || "?").slice(0,1).toUpperCase()}</div><div><strong>{a.company}</strong><span>{a.role}</span></div></div></td><td>{a.location || "—"}</td><td>{prettyDate(a.appliedDate)}</td><td><span className={`status-pill ${statusClass(a.status)}`}><i/>{a.status}</span></td><td>{a.source || "—"}</td>{showActions && <td><div className="row-actions">{a.jobUrl && <a className="small-icon" href={a.jobUrl} target="_blank" rel="noreferrer" title="Open job link"><Link2 size={14}/></a>}<button className="small-icon" onClick={()=>onEdit(a)} title="Edit"><Pencil size={14}/></button><button className="small-icon danger" onClick={()=>onDelete(a)} title="Delete"><Trash2 size={14}/></button></div></td>}</tr>)}</tbody></table></div>;
}

function SkillSnapshot({ resumeText, jobText }) {
  const resume = matchScore(resumeText);
  const jobSkills = ["excel","sql","power bi","python","reporting","data cleaning","dax","communication","data quality","pivot tables"];
  const job = jobText.toLowerCase();
  const required = jobSkills.filter(s=>job.includes(s));
  const matched = required.filter(s=>resumeText.toLowerCase().includes(s));
  const missing = required.filter(s=>!resumeText.toLowerCase().includes(s));
  const score = required.length ? Math.round(matched.length / required.length * 100) : 0;
  return <div className="skill-snapshot"><div className="score-row"><div className="score-ring" style={{"--score":`${score}%`}}><div><strong>{score}%</strong><span>match</span></div></div><div><strong>{score >= 75 ? "Strong starting match" : score >= 45 ? "Some relevant skills" : "Room to build alignment"}</strong><p>{matched.length} of {required.length} tracked skills found in your resume text.</p></div></div><div className="skill-columns"><div><h3><Check size={14}/> Matched keywords</h3><div className="skill-tags">{matched.length ? matched.map(s=><span className="skill-tag matched" key={s}>{s}</span>) : <span className="muted-small">No tracked matches yet</span>}</div></div><div><h3><Target size={14}/> Potential gaps</h3><div className="skill-tags">{missing.length ? missing.map(s=><span className="skill-tag missing" key={s}>{s}</span>) : <span className="muted-small">No tracked gaps</span>}</div></div></div><p className="disclaimer">This heuristic checks a fixed list of common data-role keywords. It does not assess proficiency, context, or hiring likelihood.</p></div>;
}

function Recommendation({ icon: Icon, title, body }) { return <div className="recommendation"><div className="recommendation-icon"><Icon size={18}/></div><strong>{title}</strong><p>{body}</p></div>; }

export default App;

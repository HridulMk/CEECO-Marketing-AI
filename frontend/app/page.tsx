"use client";

import { useEffect, useState } from "react";
import {
  Activity, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown,
  CircleHelp, ClipboardCheck, Download, FileText, Globe2, LayoutDashboard,
  Menu, MessageSquare, Megaphone, Plus, Search, Settings, Sparkles, Target,
  Users, WandSparkles, X
} from "lucide-react";

type Lead = { id: number; name: string; email: string; location: string; interest: string; source: string; status: string; score: number };
const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Lead CRM", icon: Users },
  { label: "AI Marketing Studio", icon: WandSparkles },
  { label: "Campaigns", icon: Megaphone },
  { label: "Tasks & Follow-ups", icon: ClipboardCheck },
  { label: "Analytics", icon: Activity },
];
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

export default function Home() {
  const [page, setPage] = useState("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showLead, setShowLead] = useState(false);
  const [toast, setToast] = useState("");
  const [connected, setConnected] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [brief, setBrief] = useState({ goal: "Generate student enquiries", audience: "Students exploring international education", channel: "Instagram Reel", language: "English + Malayalam", location: "Kanhangad", tone: "Friendly and informative" });
  const [form, setForm] = useState({ name: "", email: "", location: "Kanhangad", interest: "", source: "Website" });

  useEffect(() => {
    const token = window.localStorage.getItem("ceeco_access_token");
    if (token) setAuthToken(token);
    const saved = window.localStorage.getItem("ceeco_leads");
    if (saved) { try { setLeads(JSON.parse(saved) as Lead[]); } catch { /* Ignore invalid local cache. */ } }
  }, []);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }
  function persistLeads(next: Lead[]) {
    setLeads(next);
    window.localStorage.setItem("ceeco_leads", JSON.stringify(next));
  }
  const filtered = leads.filter((l) => [l.name, l.email, l.location, l.interest, l.source, l.status].join(" ").toLowerCase().includes(search.toLowerCase()));

  function addLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = [{ ...form, id: Date.now(), status: "New lead", score: 50 }, ...leads];
    persistLeads(next);
    setForm({ name: "", email: "", location: "Kanhangad", interest: "", source: "Website" });
    setShowLead(false);
    notify("Lead saved in this browser. Connect the API for shared team records.");
  }

  function exportLeads() {
    const csv = ["Name,Email,Location,Interest,Source,Status,Score", ...leads.map((l) => [l.name,l.email,l.location,l.interest,l.source,l.status,l.score].map((v) => `"${String(v).replaceAll('"','""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "ceeco-leads.csv"; a.click(); URL.revokeObjectURL(url);
  }

  async function testApi() {
    try {
      const r = await fetch(`${apiBase}/health/`);
      setConnected(r.ok);
      notify(r.ok ? "API health check succeeded." : "API responded with an error.");
    } catch {
      setConnected(false);
      notify("API is not reachable yet. Check the backend URL and deployment.");
    }
  }

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true);
    try {
      const r = await fetch(`${apiBase}/token/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await r.json();
      if (!r.ok || !data.access) throw new Error(data.detail || "Sign in failed");
      window.localStorage.setItem("ceeco_access_token", data.access);
      setAuthToken(data.access); setPassword(""); notify("Signed in.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Unable to sign in. Check API URL and credentials.");
    } finally { setBusy(false); }
  }

  async function generateDraft(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setDraft("");
    try {
      if (!authToken) throw new Error("Sign in first in Settings to use the AI API.");
      const r = await fetch(`${apiBase}/ai/generate/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify(brief) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "AI generation failed");
      setDraft(data.content || "No draft returned.");
      notify("AI draft generated. Review it before publishing.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "AI service is unavailable.");
    } finally { setBusy(false); }
  }

  const pageTitle = page === "Overview" ? "Good evening, marketing team" : page;
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark">C</div><div><div className="brand-title">CEECO <span>AI</span></div><div className="brand-sub">MARKETING COMMAND CENTRE</div></div></div>
        <div className="nav-label">WORKSPACE</div>
        <nav>{navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setPage(label); setMobileNav(false); }} className={`nav-item ${page === label ? "active" : ""}`}><Icon size={17}/><span>{label}</span>{label === "Lead CRM" && leads.length > 0 && <span className="nav-count">{leads.length}</span>}</button>)}</nav>
        <div className="nav-label manage-label">MANAGE</div>
        <button className={`nav-item ${page === "Settings" ? "active" : ""}`} onClick={() => { setPage("Settings"); setMobileNav(false); }}><Settings size={17}/><span>Settings</span></button>
        <button className="nav-item" onClick={() => notify("For team access, configure production authentication and roles before onboarding colleagues.")}><CircleHelp size={17}/><span>Help & support</span></button>
        <div className="sidebar-foot"><span className={`status-dot ${connected ? "green" : ""}`}/><b>{connected ? "API connected" : "API not verified"}</b><p>Lead smarter. Grow together.</p><small>CEECO International · Internal workspace</small></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="heading-wrap"><button className="icon-button menu-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation"><Menu size={18}/></button><div><div className="eyebrow">CEECO INTERNATIONAL / WORKSPACE</div><h1>{page === "Overview" ? "Overview" : page}</h1></div></div>
          <div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => notify("No notifications in this starter yet.")}><Bell size={17}/></button><div className="user-pill"><div className="avatar">MK</div><div><b>Marketing Team</b><small>Team workspace</small></div><ChevronDown size={14}/></div></div>
        </header>

        <section className="page-content">
          {toast && <div className="toast" role="status">{toast}</div>}
          {page === "Overview" && <>
            <div className="welcome-row"><div><h2>{pageTitle} <span>✦</span></h2><p>Plan campaigns, organize enquiries and turn helpful content into conversations.</p></div><div className="button-row"><button className="button" onClick={exportLeads}><Download size={15}/> Export leads</button><button className="button primary" onClick={() => setShowLead(true)}><Plus size={15}/> Add new lead</button></div></div>
            <div className="notice"><strong>Starter workspace:</strong> metrics and records are empty until you enter data. Leads added here are stored in this browser only; connect the Django API before using it as a shared team CRM.</div>
            <div className="stat-grid">{[{label:"Leads in this browser",value:String(leads.length),icon:Users},{label:"Qualified leads",value:String(leads.filter(l => l.status === "Qualified").length),icon:Target},{label:"Active campaigns",value:"—",icon:Megaphone},{label:"Conversion rate",value:"—",icon:ArrowUpRight}].map(({label,value,icon:Icon}) => <div className="stat-card" key={label}><div className="stat-label">{label}<span className="stat-icon"><Icon size={17}/></span></div><div className="stat-value">{value}</div><div className="stat-caption">No production analytics connected</div></div>)}</div>
            <div className="two-col">
              <div className="panel"><div className="panel-header"><div><h3>Lead pipeline</h3><p>Browser-local records only</p></div><button className="text-button" onClick={() => setPage("Lead CRM")}>Open CRM <ArrowUpRight size={14}/></button></div>
                {leads.length === 0 ? <div className="empty-state"><Users size={25}/><b>No leads yet</b><span>Add a test lead or connect the API to load team records.</span><button className="button primary" onClick={() => setShowLead(true)}>Add a lead</button></div> : <div className="mini-leads">{leads.slice(0,5).map(l => <div className="mini-lead" key={l.id}><div className="lead-avatar">{l.name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase()}</div><div className="mini-lead-info"><b>{l.name}</b><span>{l.location} · {l.interest || "Enquiry"}</span></div><span className={`pill ${l.status === "Qualified" ? "success" : "neutral"}`}>{l.status}</span></div>)}</div>}
              </div>
              <div className="panel"><div className="panel-header"><div><h3>Quick actions</h3><p>Pick up where your team left off</p></div><Sparkles size={18} className="purple"/></div>
                {[{title:"Draft a new campaign",description:"Create channel-ready marketing copy",action:() => setPage("AI Marketing Studio"),icon:WandSparkles},{title:"Review follow-ups",description:"Keep enquiry conversations moving",action:() => setPage("Tasks & Follow-ups"),icon:CalendarDays},{title:"Export lead list",description:"Download your local lead records",action:exportLeads,icon:Download}].map(({title,description,action,icon:Icon}) => <button className="quick-action" key={title} onClick={action}><span className="quick-icon"><Icon size={17}/></span><span><b>{title}</b><small>{description}</small></span><ArrowUpRight size={15}/></button>)}
              </div>
            </div>
          </>}

          {page === "Lead CRM" && <><div className="section-heading"><div><h2>Lead CRM</h2><p>Record and organize enquiries for your branch team.</p></div><div className="button-row"><button className="button" onClick={exportLeads}><Download size={15}/> Export CSV</button><button className="button primary" onClick={() => setShowLead(true)}><Plus size={15}/> Add lead</button></div></div><div className="panel"><div className="search-row"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, location or interest…"/></div>{filtered.length === 0 ? <div className="empty-state"><Users size={25}/><b>No matching leads</b><span>Try another term, or add a record. These are local browser records.</span></div> : <div className="table-scroll"><table><thead><tr><th>CONTACT</th><th>LOCATION</th><th>INTEREST</th><th>SOURCE</th><th>STATUS</th><th>SCORE</th></tr></thead><tbody>{filtered.map(l => <tr key={l.id}><td><b>{l.name}</b><small>{l.email || "No email entered"}</small></td><td>{l.location}</td><td>{l.interest || "—"}</td><td>{l.source}</td><td><span className="pill neutral">{l.status}</span></td><td><b>{l.score}</b></td></tr>)}</tbody></table></div>}</div></>}

          {page === "AI Marketing Studio" && <><div className="section-heading"><div><h2>AI Marketing Studio</h2><p>Create an editable first draft for human review before publishing.</p></div><span className="ai-badge"><Sparkles size={13}/> Server-side AI</span></div><div className="two-col studio-grid"><form className="panel form-panel" onSubmit={generateDraft}><h3>Campaign brief</h3><p>Describe who you're speaking to and what you'd like to achieve.</p><label>Objective<input required value={brief.goal} onChange={e => setBrief({...brief,goal:e.target.value})}/></label><label>Target audience<input required value={brief.audience} onChange={e => setBrief({...brief,audience:e.target.value})}/></label><div className="form-grid"><label>Channel<select value={brief.channel} onChange={e => setBrief({...brief,channel:e.target.value})}>{["Instagram Reel","Instagram carousel","Facebook post","Website landing page","WhatsApp template draft"].map(v => <option key={v}>{v}</option>)}</select></label><label>Language<select value={brief.language} onChange={e => setBrief({...brief,language:e.target.value})}>{["English","Malayalam","English + Malayalam"].map(v => <option key={v}>{v}</option>)}</select></label></div><div className="form-grid"><label>Branch<select value={brief.location} onChange={e => setBrief({...brief,location:e.target.value})}>{["Kanhangad","Mangalore","Sreekandapuram","All branches"].map(v => <option key={v}>{v}</option>)}</select></label><label>Tone<select value={brief.tone} onChange={e => setBrief({...brief,tone:e.target.value})}>{["Friendly and informative","Professional","Student-focused","Parent-focused","Energetic"].map(v => <option key={v}>{v}</option>)}</select></label></div><button className="button primary wide" disabled={busy} type="submit"><Sparkles size={15}/>{busy ? "Generating…" : "Generate AI draft"}</button><p className="form-hint">Requires a valid team access token and a configured backend AI key.</p></form><div className="panel draft-panel"><div className="panel-header"><div><h3>Draft preview</h3><p>Generated content is a draft, not a published post.</p></div><FileText size={18} className="purple"/></div>{draft ? <><textarea className="draft-output" value={draft} onChange={e => setDraft(e.target.value)}/><div className="button-row"><button className="button" onClick={() => {navigator.clipboard.writeText(draft).then(() => notify("Draft copied."));}}>Copy draft</button><button className="button" onClick={() => {const blob = new Blob([draft],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="ceeco-ai-draft.txt";a.click();URL.revokeObjectURL(url);}}>Download</button></div></> : <div className="empty-state"><WandSparkles size={26}/><b>Your next idea starts here</b><span>Complete the brief and generate a draft. Review claims, facts and offers before publishing.</span></div>}</div></div></>}

          {page === "Campaigns" && <><div className="section-heading"><div><h2>Campaigns</h2><p>Organize objectives by channel, branch and schedule.</p></div><span className="pill neutral">API integration pending</span></div><div className="panel empty-state"><Megaphone size={28}/><b>No campaigns loaded</b><span>Connect the authenticated Campaign API to manage persisted campaign records here. This starter intentionally avoids showing invented campaign totals.</span></div></>}

          {page === "Tasks & Follow-ups" && <><div className="section-heading"><div><h2>Tasks & follow-ups</h2><p>Plan lead contact and campaign execution with a clear owner and due date.</p></div><span className="pill neutral">API integration pending</span></div><div className="panel empty-state"><CalendarDays size={28}/><b>No tasks loaded</b><span>Connect the Activity API to load due dates, completions and lead histories.</span></div></>}

          {page === "Analytics" && <><div className="section-heading"><div><h2>Analytics</h2><p>Funnel reporting will appear when records are persisted in the API.</p></div><button className="button" onClick={exportLeads}><Download size={15}/> Export local CSV</button></div><div className="panel empty-state"><Activity size={28}/><b>No production analytics available</b><span>Lead conversion, campaign attribution and contact-rate metrics are intentionally blank until real records and definitions are connected.</span></div></>}

          {page === "Settings" && <><div className="section-heading"><div><h2>Settings</h2><p>Connect the API and sign in with an administrator-created account.</p></div></div><div className="two-col"><div className="panel"><h3>API connection</h3><p className="subtext">Frontend API URL</p><div className="readonly-field">{apiBase}</div><button className="button" onClick={testApi}>Test backend connection</button><div className="connection-status"><span className={`status-dot ${connected ? "green" : ""}`}/>{connected ? "Health check passed" : "Not yet verified"}</div></div><div className="panel"><h3>Team sign in</h3><p className="subtext">Use an account created by your admin in Django.</p>{authToken ? <><div className="notice">Access token is saved in this browser. Token refresh and account invitations are not yet wired into this starter UI.</div><button className="button" onClick={() => {window.localStorage.removeItem("ceeco_access_token");setAuthToken("");notify("Signed out of this browser.");}}>Sign out</button></> : <form onSubmit={signIn} className="form-panel"><label>Username<input autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)}/></label><label>Password<input autoComplete="current-password" type="password" required value={password} onChange={e => setPassword(e.target.value)}/></label><button className="button primary wide" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form>}</div></div><div className="notice settings-notice"><Globe2 size={16}/> AI credentials belong in the backend host's private environment variables. Never put provider API keys in frontend settings or in a NEXT_PUBLIC_* variable.</div></>}
        </section>
      </main>

      {mobileNav && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
      {showLead && <div className="modal-backdrop" role="presentation" onClick={() => setShowLead(false)}><div className="modal panel" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" onClick={e => e.stopPropagation()}><div className="panel-header"><div><h3 id="lead-modal-title">Add a lead</h3><p>Use fictional/test records until a secure shared CRM is enabled.</p></div><button className="icon-button" aria-label="Close modal" onClick={() => setShowLead(false)}><X size={16}/></button></div><form onSubmit={addLead} className="form-panel"><label>Name<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Full name"/></label><label>Email<input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="name@example.com"/></label><div className="form-grid"><label>Branch<select value={form.location} onChange={e => setForm({...form,location:e.target.value})}>{["Kanhangad","Mangalore","Sreekandapuram","Other"].map(v => <option key={v}>{v}</option>)}</select></label><label>Source<select value={form.source} onChange={e => setForm({...form,source:e.target.value})}>{["Website","Instagram","Facebook","WhatsApp","Event","Walk-in","Referral"].map(v => <option key={v}>{v}</option>)}</select></label></div><label>Interest / enquiry<input value={form.interest} onChange={e => setForm({...form,interest:e.target.value})} placeholder="Consultation request, course query…"/></label><div className="modal-actions"><button type="button" className="button" onClick={() => setShowLead(false)}>Cancel</button><button className="button primary" type="submit"><Plus size={15}/> Save local lead</button></div></form></div></div>}
    </div>
  );
}

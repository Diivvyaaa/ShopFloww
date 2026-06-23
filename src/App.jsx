import React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── API Helper ───────────────────────────────────────────────────────────────
let BASE = import.meta.env.VITE_API_URL || "";
if (!BASE.endsWith("/api")) BASE += "/api";
const api = {
  get:    (url)       => fetch(BASE + url, { credentials: "include" }),
  post:   (url, data) => fetch(BASE + url, { method: "POST",   credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  put:    (url, data) => fetch(BASE + url, { method: "PUT",    credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  delete: (url)       => fetch(BASE + url, { method: "DELETE", credentials: "include" }),
};

// ─── Fallback seed products (shown when backend has none / is offline) ────────
const SEED_PRODUCTS = [
  { id:1,  name:"Air Max Pro",   category:"Footwear",    price:129, stock:43,  emoji:"👟", description:"Premium running shoes with advanced cushioning." },
  { id:2,  name:"Canvas Tote",   category:"Bags",        price:49,  stock:120, emoji:"👜", description:"Spacious and stylish everyday carry bag." },
  { id:3,  name:"Silk Scarf",    category:"Accessories", price:89,  stock:18,  emoji:"🧣", description:"Luxurious 100% silk scarf in vibrant patterns." },
  { id:4,  name:"Watch Strap",   category:"Accessories", price:35,  stock:75,  emoji:"⌚", description:"Genuine leather strap, fits most sizes." },
  { id:5,  name:"Leather Belt",  category:"Accessories", price:65,  stock:52,  emoji:"👔", description:"Classic full-grain leather belt with brass buckle." },
  { id:6,  name:"Sunglasses",    category:"Eyewear",     price:112, stock:29,  emoji:"🕶️", description:"UV400 polarized lenses in a timeless frame." },
];

const EMOJI_OPTIONS = ["👟","👜","🧣","⌚","👔","🕶️","👗","👒","💍","🎒","👠","🧤","🧦","💼","🎽","🧢","🪖","💎","🛍️","📦"];

const REVENUE_DATA = [
  { month:"Sep", revenue:42000, orders:820  },
  { month:"Oct", revenue:55000, orders:940  },
  { month:"Nov", revenue:61000, orders:1100 },
  { month:"Dec", revenue:79000, orders:1380 },
  { month:"Jan", revenue:68000, orders:1150 },
  { month:"Feb", revenue:84320, orders:1243 },
];
const CATEGORY_DATA = [
  { name:"Footwear", value:38 }, { name:"Bags", value:22 },
  { name:"Accessories", value:28 }, { name:"Eyewear", value:12 },
];
const PIE_COLORS = ["#f97316","#fb923c","#fdba74","#fed7aa"];

// ─── Themes ───────────────────────────────────────────────────────────────────
const T = {
  dark: {
    root:    { background:"#0f0f11", color:"#e2e2e2" },
    sidebar: { background:"#141416", borderRight:"1px solid #1e1e22" },
    card:    { background:"#18181c", border:"1px solid #1e1e22" },
    navBtn:  { color:"#8b8b9a" },
    heading:"#f0f0f0", text:"#d0d0d8", muted:"#6b6b7e",
    border:"#1e1e22", gridLine:"#1e1e22", badge:"#2a2a2e",
    input:   { background:"#18181c", border:"1px solid #2a2a2e", color:"#d0d0d8" },
    tooltip: { background:"#18181c", border:"1px solid #2a2a2e", color:"#d0d0d8", borderRadius:10, fontSize:12 },
    modal:   { background:"#1a1a1f", border:"1px solid #2a2a2e" },
  },
  light: {
    root:    { background:"#fafafa", color:"#1a1a24" },
    sidebar: { background:"#ffffff", borderRight:"1px solid #e8e8ee" },
    card:    { background:"#ffffff", border:"1px solid #e8e8ee" },
    navBtn:  { color:"#6b6b7e" },
    heading:"#1a1a24", text:"#3a3a4a", muted:"#8b8b9a",
    border:"#e8e8ee", gridLine:"#f0f0f4", badge:"#f5f5f8",
    input:   { background:"#f5f5f8", border:"1px solid #e8e8ee", color:"#3a3a4a" },
    tooltip: { background:"#ffffff", border:"1px solid #e8e8ee", color:"#3a3a4a", borderRadius:10, fontSize:12 },
    modal:   { background:"#ffffff", border:"1px solid #e8e8ee" },
  },
};

// ─── Global Styles ────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;height:100%;overflow:hidden;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#f97316;border-radius:4px;}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.15);}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes popIn{0%{transform:scale(0.85);opacity:0;}100%{transform:scale(1);opacity:1;}}
        @keyframes overlayIn{from{opacity:0;}to{opacity:1;}}
        .nav-btn:hover{background:rgba(249,115,22,0.12)!important;color:#f97316!important;}
        .stat-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(249,115,22,0.18)!important;}
        .row-hover:hover{background:rgba(249,115,22,0.06)!important;}
        .prod-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(249,115,22,0.15)!important;}
        .drag-card{cursor:grab;transition:all 0.2s;}
        .drag-card:hover{transform:scale(1.02);}
        .drag-card.dragging{opacity:0.35;transform:scale(0.96);}
        .drag-card.drag-over{border:2px dashed #f97316!important;transform:scale(1.03);}
        .login-input:focus{border-color:#f97316!important;outline:none;box-shadow:0 0 0 3px rgba(249,115,22,0.15);}
        .demo-btn:hover{border-color:#f97316!important;}
        .emoji-pick:hover{background:rgba(249,115,22,0.15)!important;transform:scale(1.1);}
        input:focus,select:focus,textarea:focus{outline:none;border-color:#f97316!important;box-shadow:0 0 0 2px rgba(249,115,22,0.15);}
      `}</style>
    </>
  );
}

// ─── Reusable ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = { Pending:"#f59e0b", Processing:"#3b82f6", Shipped:"#8b5cf6", Delivered:"#22c55e", Cancelled:"#ef4444" };
  const icons  = { Pending:"🕐", Processing:"⚙️", Shipped:"🚚", Delivered:"✅", Cancelled:"❌" };
  return (
    <span style={{ background:`${colors[status]||"#888"}22`, color:colors[status]||"#888", borderRadius:20, padding:"4px 11px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
      {icons[status]} {status}
    </span>
  );
}

function Toast({ msg, color="#22c55e" }) {
  return (
    <div style={{ position:"fixed", top:24, right:24, background:color, color:"#fff", padding:"13px 22px", borderRadius:14, fontSize:13, fontWeight:600, zIndex:99999, boxShadow:`0 8px 32px ${color}55`, animation:"slideIn 0.3s ease", maxWidth:340 }}>
      {msg}
    </div>
  );
}

function Spinner() {
  return <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.6s linear infinite" }}/>;
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// LOGIN  (replace the entire LoginPage function in App.jsx with this)
// ══════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState("login");   // "login" | "signup"
  const [role, setRole]         = useState(null);       // null | "admin" | "customer"
  const [success, setSuccess] = useState("");
  // login fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  // signup extra field
  const [name, setName]         = useState("");

  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Reset form when switching modes
  const switchMode = (m) => { setMode(m); setError(""); setEmail(""); setPassword(""); setName(""); };

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (!res.ok) { const e = await res.json().catch(()=>({})); setError(e.error||"Invalid credentials."); setLoading(false); return; }
      onLogin(await res.json());
    } catch { setError("Cannot connect to server. Is the backend running?"); setLoading(false); }
  };
const handleSignup = async () => {
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      if (!res.ok) { const e = await res.json().catch(()=>({})); setError(e.error||"Registration failed."); setLoading(false); return; }
      // Account created — prompt user to sign in
      switchMode("login");
      setError("");
      setSuccess("Account created! Please sign in.");
      setLoading(false);
    } catch { setError("Cannot connect to server. Is the backend running?"); setLoading(false); }
  };

  // ── Step 1: Choose role ────────────────────────────────────────────────────
  if (!role) return (
    <div style={{ width:"100vw", height:"100vh", background:"#0f0f11", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(249,115,22,0.08),transparent 70%)", top:-100, right:-100, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(249,115,22,0.05),transparent 70%)", bottom:-80, left:-80, pointerEvents:"none" }}/>
      <div style={{ width:"100%", maxWidth:440, padding:48, background:"#141416", borderRadius:24, border:"1px solid #1e1e22", boxShadow:"0 32px 80px rgba(0,0,0,0.5)", animation:"fadeUp 0.5s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:36 }}>
          <div style={{ width:42, height:42, background:"linear-gradient(135deg,#f97316,#ea580c)", borderRadius:12, display:"grid", placeItems:"center", fontSize:20 }}>🛍️</div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"#f97316" }}>ShopFlow</span>
        </div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#f0f0f0", marginBottom:8 }}>Welcome</h2>
        <p style={{ color:"#6b6b7e", fontSize:14, marginBottom:36 }}>How would you like to continue?</p>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <button className="demo-btn" onClick={()=>setRole("admin")}
            style={{ background:"rgba(249,115,22,0.08)", border:"1px solid rgba(249,115,22,0.3)", borderRadius:14, padding:"18px 20px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>
            <div style={{ fontSize:22, marginBottom:6 }}>👑</div>
            <div style={{ fontWeight:700, fontSize:15, color:"#f0f0f0", marginBottom:3 }}>Admin</div>
            <div style={{ fontSize:12, color:"#6b6b7e" }}>Manage orders, products and analytics</div>
          </button>
          <button className="demo-btn" onClick={()=>setRole("customer")}
            style={{ background:"rgba(96,165,250,0.06)", border:"1px solid rgba(96,165,250,0.2)", borderRadius:14, padding:"18px 20px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>
            <div style={{ fontSize:22, marginBottom:6 }}>👤</div>
            <div style={{ fontWeight:700, fontSize:15, color:"#f0f0f0", marginBottom:3 }}>Customer</div>
            <div style={{ fontSize:12, color:"#6b6b7e" }}>Shop, manage cart and track orders</div>
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 2: Login / Signup form ────────────────────────────────────────────
  const isAdmin    = role === "admin";
  const isSignup   = mode === "signup" && !isAdmin;
  const accentColor = isAdmin ? "#f97316" : "#60a5fa";

  return (
    <div style={{ width:"100vw", height:"100vh", background:"#0f0f11", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:`radial-gradient(circle,${isAdmin?"rgba(249,115,22,0.08)":"rgba(96,165,250,0.06)"},transparent 70%)`, top:-100, right:-100, pointerEvents:"none" }}/>
      <div style={{ width:"100%", maxWidth:440, padding:48, background:"#141416", borderRadius:24, border:"1px solid #1e1e22", boxShadow:"0 32px 80px rgba(0,0,0,0.5)", animation:"fadeUp 0.5s ease" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <button onClick={()=>{ setRole(null); setError(""); }} style={{ background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, padding:"6px 10px", color:"#6b6b7e", cursor:"pointer", fontSize:13 }}>← Back</button>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
            <div style={{ width:34, height:34, background:"linear-gradient(135deg,#f97316,#ea580c)", borderRadius:10, display:"grid", placeItems:"center", fontSize:16 }}>🛍️</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"#f97316" }}>ShopFlow</span>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`${accentColor}15`, border:`1px solid ${accentColor}30`, borderRadius:20, padding:"5px 12px", marginBottom:20 }}>
          <span style={{ fontSize:13 }}>{isAdmin?"👑":"👤"}</span>
          <span style={{ fontSize:12, fontWeight:700, color:accentColor, textTransform:"uppercase", letterSpacing:1 }}>{isAdmin?"Admin":"Customer"}</span>
        </div>

        {/* Login / Signup toggle — only for customers */}
        {!isAdmin && (
          <div style={{ display:"flex", background:"#1a1a1f", borderRadius:10, padding:4, marginBottom:28, border:"1px solid #2a2a2e" }}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>switchMode(m)}
                style={{ flex:1, padding:"9px", border:"none", borderRadius:8, background:mode===m?"#f97316":"transparent", color:mode===m?"#fff":"#6b6b7e", fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s", textTransform:"capitalize" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {!isAdmin && mode === "login" && <p style={{ color:"#6b6b7e", fontSize:14, marginBottom:24 }}>Welcome back! Sign in to continue.</p>}
        {!isAdmin && mode === "signup" && <p style={{ color:"#6b6b7e", fontSize:14, marginBottom:24 }}>Create a new account to start shopping.</p>}
        {isAdmin && <p style={{ color:"#6b6b7e", fontSize:14, marginBottom:24 }}>Sign in to your admin account.</p>}

        {/* Name field — signup only */}
        {isSignup && (
          <>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#8b8b9a", marginBottom:8 }}>Full Name</label>
            <input className="login-input" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" onKeyDown={e=>e.key==="Enter"&&handleSignup()}
              style={{ width:"100%", padding:"12px 16px", background:"#18181c", border:"1px solid #2a2a2e", borderRadius:10, color:"#f0f0f0", fontSize:14, marginBottom:16, transition:"all 0.2s" }}/>
          </>
        )}

        {/* Email */}
        <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#8b8b9a", marginBottom:8 }}>Email</label>
        <input className="login-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e=>e.key==="Enter"&&(isSignup?handleSignup():handleLogin())}
          style={{ width:"100%", padding:"12px 16px", background:"#18181c", border:"1px solid #2a2a2e", borderRadius:10, color:"#f0f0f0", fontSize:14, marginBottom:16, transition:"all 0.2s" }}/>

        {/* Password */}
        <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#8b8b9a", marginBottom:8 }}>Password</label>
        <div style={{ position:"relative", marginBottom:24 }}>
          <input className="login-input" type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&(isSignup?handleSignup():handleLogin())}
            style={{ width:"100%", padding:"12px 48px 12px 16px", background:"#18181c", border:"1px solid #2a2a2e", borderRadius:10, color:"#f0f0f0", fontSize:14, transition:"all 0.2s" }}/>
          <button onClick={()=>setShowPass(s=>!s)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#6b6b7e", fontSize:16 }}>{showPass?"🙈":"👁️"}</button>
        </div>

{success && <div style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#22c55e", fontSize:13 }}>✅ {success}</div>}
{error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#ef4444", fontSize:13 }}>⚠️ {error}</div>}
        {/* Submit button */}
        <button onClick={isSignup ? handleSignup : handleLogin} disabled={loading}
          style={{ width:"100%", padding:13, background:loading?"#7c3d12":`linear-gradient(135deg,${accentColor},${isAdmin?"#ea580c":"#3b82f6"})`, border:"none", borderRadius:10, color:"#fff", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", marginBottom:isAdmin?28:0, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {loading ? <><Spinner/> {isSignup?"Creating account…":"Signing in…"}</> : isSignup ? "Create Account →" : "Sign In →"}
        </button>

      
        {isAdmin && (
          <div style={{ borderTop:"1px solid #1e1e22", paddingTop:24 }}>
            <p style={{ color:"#6b6b7e", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Quick Fill</p>
            <button className="demo-btn" onClick={()=>{ setEmail("admin@shopflow.com"); setPassword("admin123"); }}
              style={{ width:"100%", background:"#18181c", border:"1px solid #2a2a2e", borderRadius:8, padding:"9px 14px", color:"#d0d0d8", fontSize:13, cursor:"pointer", textAlign:"left", transition:"border-color 0.2s" }}>
              👑 Admin — <span style={{ color:"#6b6b7e" }}>admin@shopflow.com</span>
            </button>
          </div>
        )}

     
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED LAYOUT
// ══════════════════════════════════════════════════════════════════════════════
function AppLayout({ user, onLogout, dark, setDark, navItems, activeTab, setTab, children }) {
  const th = dark ? T.dark : T.light;
  return (
    <div style={{ ...th.root, fontFamily:"'DM Sans',sans-serif", width:"100vw", height:"100vh", display:"flex", overflow:"hidden", position:"fixed", top:0, left:0 }}>
      <aside style={{ ...th.sidebar, width:224, minWidth:224, height:"100vh", display:"flex", flexDirection:"column", padding:"28px 16px", gap:6, overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingLeft:8 }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,#f97316,#ea580c)", borderRadius:10, display:"grid", placeItems:"center", fontSize:16, flexShrink:0 }}>🛍️</div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"#f97316" }}>ShopFlow</span>
        </div>
        <div style={{ marginBottom:16, paddingLeft:4 }}>
          <div style={{ background:user.role==="admin"?"rgba(249,115,22,0.1)":"rgba(96,165,250,0.1)", border:`1px solid ${user.role==="admin"?"rgba(249,115,22,0.25)":"rgba(96,165,250,0.25)"}`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:11, color:user.role==="admin"?"#f97316":"#60a5fa", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>{user.role==="admin"?"👑 Admin":"👤 Customer"}</div>
            <div style={{ fontSize:13, color:th.heading, fontWeight:600 }}>{user.name}</div>
            <div style={{ fontSize:11, color:th.muted }}>{user.email}</div>
          </div>
        </div>
        {navItems.map(({ key, icon, label, badge })=>(
          <button key={key} className="nav-btn" onClick={()=>setTab(key)}
            style={{ background:activeTab===key?"rgba(249,115,22,0.15)":"transparent", color:activeTab===key?"#f97316":th.navBtn.color, fontWeight:activeTab===key?600:400, border:"none", borderRadius:10, padding:"11px 14px", display:"flex", alignItems:"center", gap:10, fontSize:14, cursor:"pointer", textAlign:"left", transition:"all 0.2s", width:"100%" }}>
            <span>{icon}</span>{label}
            {badge>0 && <span style={{ marginLeft:"auto", background:"#f97316", color:"#fff", borderRadius:20, fontSize:10, padding:"2px 7px", fontWeight:700 }}>{badge}</span>}
          </button>
        ))}
        <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:8, paddingLeft:4 }}>
          <button onClick={()=>setDark(d=>!d)} style={{ background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.2)", borderRadius:20, padding:"7px 14px", color:"#f97316", fontSize:12, cursor:"pointer", fontWeight:500 }}>{dark?"☀️ Light":"🌙 Dark"}</button>
          <button onClick={onLogout} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:20, padding:"7px 14px", color:"#ef4444", fontSize:12, cursor:"pointer", fontWeight:500 }}>🚪 Sign Out</button>
        </div>
      </aside>
      <main style={{ flex:1, height:"100vh", overflowY:"auto", padding:"32px 36px", minWidth:0 }}>{children}</main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — ADD PRODUCT MODAL
// ══════════════════════════════════════════════════════════════════════════════
function AddProductModal({ th, onClose, onAdd }) {
  const [form, setForm] = useState({ name:"", category:"", price:"", stock:"", description:"", emoji:"📦" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if(!form.name||!form.category||!form.price||!form.stock){ setErr("Please fill in all required fields."); return; }
    setSaving(true);
    const payload = { name:form.name, category:form.category, price:parseFloat(form.price), stock:parseInt(form.stock), description:form.description, emoji:form.emoji };
    try {
      const res = await api.post("/products/admin/add", payload);
      if(res.ok){ const p = await res.json(); onAdd(p); onClose(); }
      else { setErr("Failed to save product. Check backend."); setSaving(false); }
    } catch {
      // Backend offline — add locally with temp id
      onAdd({ ...payload, id: Date.now() });
      onClose();
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"grid", placeItems:"center", zIndex:9000, animation:"overlayIn 0.2s ease" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ ...th.modal, borderRadius:20, padding:36, width:"100%", maxWidth:520, boxShadow:"0 32px 80px rgba(0,0,0,0.5)", animation:"popIn 0.25s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:th.heading }}>Add New Product</h2>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", color:th.muted, fontSize:18, display:"grid", placeItems:"center" }}>✕</button>
        </div>

        {/* Emoji picker */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600, color:th.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Product Icon</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {EMOJI_OPTIONS.map(e=>(
              <button key={e} className="emoji-pick" onClick={()=>set("emoji",e)}
                style={{ fontSize:22, width:42, height:42, borderRadius:10, border:`2px solid ${form.emoji===e?"#f97316":"transparent"}`, background:form.emoji===e?"rgba(249,115,22,0.15)":"rgba(255,255,255,0.04)", cursor:"pointer", transition:"all 0.15s", display:"grid", placeItems:"center" }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          {[
            { key:"name",     label:"Product Name *",  placeholder:"e.g. Air Max Pro",  type:"text" },
            { key:"category", label:"Category *",      placeholder:"e.g. Footwear",     type:"text" },
            { key:"price",    label:"Price ($) *",     placeholder:"e.g. 99",           type:"number" },
            { key:"stock",    label:"Stock Qty *",     placeholder:"e.g. 50",           type:"number" },
          ].map(f=>(
            <div key={f.key}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:th.muted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:7 }}>{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e=>set(f.key,e.target.value)} placeholder={f.placeholder}
                style={{ ...th.input, width:"100%", padding:"10px 14px", borderRadius:10, fontSize:14, border:`1px solid ${th.border}`, transition:"all 0.2s" }}/>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600, color:th.muted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:7 }}>Description</label>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Short product description…" rows={3}
            style={{ ...th.input, width:"100%", padding:"10px 14px", borderRadius:10, fontSize:14, resize:"vertical", border:`1px solid ${th.border}`, transition:"all 0.2s" }}/>
        </div>

        {err && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#ef4444", fontSize:13 }}>⚠️ {err}</div>}

        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onClose} style={{ flex:1, padding:"11px", background:"transparent", border:`1px solid ${th.border}`, borderRadius:10, color:th.muted, fontSize:14, cursor:"pointer", fontWeight:500 }}>Cancel</button>
          <button onClick={submit} disabled={saving}
            style={{ flex:2, padding:"11px", background:saving?"#7c3d12":"linear-gradient(135deg,#f97316,#ea580c)", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:700, cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {saving?<><Spinner/> Saving…</>:"✅ Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function AdminDashboard({ user, onLogout, dark, setDark }) {
  const [tab, setTab]             = useState("orders");
  const [orders, setOrders]       = useState([]);
  const [products, setProducts]   = useState([]);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [notifs, setNotifs]       = useState([]);
  const [dragItems, setDragItems] = useState([]);
  const [dragOver, setDragOver]   = useState(null);
  const [pulse, setPulse]         = useState(false);
  const [toast, setToast]         = useState(null);
  const th = dark ? T.dark : T.light;

  const showToast = (msg, color="#22c55e") => { setToast({msg,color}); setTimeout(()=>setToast(null),3500); };

  // ── Load products (fallback to SEED_PRODUCTS if backend empty/offline) ──
  const loadProducts = useCallback(()=>{
    api.get("/products").then(r=>r.json()).then(data=>{
      const list = data && data.length > 0 ? data : SEED_PRODUCTS;
      setProducts(list);
      setDragItems(list.map((x,i)=>({...x, pos:i, img:x.emoji||"📦"})));
    }).catch(()=>{
      setProducts(SEED_PRODUCTS);
      setDragItems(SEED_PRODUCTS.map((x,i)=>({...x, pos:i, img:x.emoji||"📦"})));
    });
  },[]);

  // ── Poll orders every 4s ──
  const loadOrders = useCallback(()=>{
    api.get("/orders/admin/all").then(r=>r.json()).then(fresh=>{
      setOrders(prev=>{
        const prevIds = new Set(prev.map(o=>o.id));
        const brandNew = fresh.filter(o=>!prevIds.has(o.id));
        if(brandNew.length>0){
          setNewOrderIds(s=>{ const n=new Set(s); brandNew.forEach(o=>n.add(o.id)); return n; });
          setPulse(true); setTimeout(()=>setPulse(false),700);
          brandNew.forEach(o=>{
            const notif = { icon:"🛒", msg:`New order from ${o.customerName||"a customer"} — ${o.product} ($${o.total})`, type:"order", id:Date.now()+Math.random(), ts:new Date().toLocaleTimeString() };
            setNotifs(p=>[notif,...p].slice(0,12));
          });
          showToast(`🛒 ${brandNew.length} new order${brandNew.length>1?"s":""} received!`,"#f97316");
          setTimeout(()=>setNewOrderIds(new Set()),5000);
        }
        return fresh;
      });
    }).catch(()=>{});
  },[]);

  useEffect(()=>{ loadProducts(); },[loadProducts]);
  useEffect(()=>{ loadOrders(); const iv=setInterval(loadOrders,4000); return()=>clearInterval(iv); },[loadOrders]);

  // drag handlers
  const handleDragStart = (id)=>setDragItems(p=>p.map(x=>({...x,dragging:x.id===id})));
  const handleDragEnter = (id)=>setDragOver(id);
  const handleDrop = (tid)=>{
    setDragItems(prev=>{
      const src=prev.find(x=>x.dragging), tgt=prev.find(x=>x.id===tid);
      if(!src||!tgt||src.id===tgt.id) return prev.map(x=>({...x,dragging:false}));
      const sp=src.pos, tp=tgt.pos;
      return prev.map(x=>{ if(x.id===src.id)return{...x,pos:tp,dragging:false}; if(x.id===tgt.id)return{...x,pos:sp}; return{...x,dragging:false}; });
    });
    setDragOver(null);
  };

  const handleAddProduct = (p) => {
    setProducts(prev=>[...prev, p]);
    setDragItems(prev=>[...prev, {...p, pos:prev.length, img:p.emoji||"📦"}]);
    showToast(`✅ "${p.name}" added to catalog!`);
  };

  const orderBadge = newOrderIds.size;
  const navItems = [
    {key:"orders",    icon:"📦", label:"Orders",    badge:orderBadge},
    {key:"dashboard", icon:"⬛", label:"Dashboard"},
    {key:"products",  icon:"🗂️", label:"Products"},
    {key:"analytics", icon:"📊", label:"Analytics"},
    {key:"live",      icon:"🔴", label:"Live Feed",  badge:notifs.length},
  ];

  return (
    <AppLayout user={user} onLogout={onLogout} dark={dark} setDark={setDark} navItems={navItems} activeTab={tab} setTab={setTab}>
      {toast && <Toast msg={toast.msg} color={toast.color}/>}
      {tab==="orders"    && <AdminOrders    th={th} orders={orders} setOrders={setOrders} newOrderIds={newOrderIds} showToast={showToast}/>}
      {tab==="dashboard" && <AdminHome      th={th} orders={orders} pulse={pulse}/>}
      {tab==="products"  && <AdminProducts  th={th} products={products} setProducts={setProducts} dragItems={dragItems} setDragItems={setDragItems} dragOver={dragOver} handleDragStart={handleDragStart} handleDragEnter={handleDragEnter} handleDrop={handleDrop} onAdd={handleAddProduct} showToast={showToast}/>}
      {tab==="analytics" && <AdminAnalytics th={th}/>}
      {tab==="live"      && <LiveFeed       th={th} notifications={notifs}/>}
    </AppLayout>
  );
}

function AdminHome({ th, orders, pulse }) {
  const revenue   = orders.reduce((s,o)=>s+o.total,0);
  const customers = [...new Set(orders.map(o=>o.customerId))].length;
  const pending   = orders.filter(o=>o.status==="Pending").length;
  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:th.heading,marginBottom:6}}>Dashboard</h1>
      <p style={{color:th.muted,fontSize:14,marginBottom:28}}>Live overview — auto-refreshes every 4 seconds.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
        {[
          {label:"Total Revenue",value:`$${revenue.toLocaleString()}`,icon:"💰",delta:"+12%",c:undefined},
          {label:"Total Orders", value:orders.length,                  icon:"📦",delta:"+5%", c:undefined},
          {label:"Customers",    value:customers||0,                   icon:"👥",delta:"+8%", c:undefined},
          {label:"Pending",      value:pending,                        icon:"🕐",delta:pending>0?"needs action":"all clear",c:pending>0?"#f59e0b":undefined},
        ].map((s,i)=>(
          <div key={i} className="stat-card" style={{...th.card,padding:"20px 22px",borderRadius:16,transition:"all 0.25s",cursor:"default"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{color:th.muted,fontSize:12,fontWeight:500,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
                <div style={{fontSize:28,fontWeight:700,color:s.c||th.heading}}>{s.value}</div>
              </div>
              <span style={{fontSize:26}}>{s.icon}</span>
            </div>
            <div style={{marginTop:10,fontSize:12,color:s.c||"#22c55e",fontWeight:600}}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,marginBottom:28}}>
        <div style={{...th.card,borderRadius:16,padding:"22px 18px"}}>
          <div style={{fontWeight:700,color:th.heading,marginBottom:16,fontSize:15}}>Revenue Over Time</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={th.gridLine}/>
              <XAxis dataKey="month" tick={{fill:th.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:th.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip contentStyle={th.tooltip} formatter={v=>[`$${v.toLocaleString()}`,"Revenue"]}/>
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#rev)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{...th.card,borderRadius:16,padding:"22px 18px"}}>
          <div style={{fontWeight:700,color:th.heading,marginBottom:16,fontSize:15}}>Sales by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                {CATEGORY_DATA.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={th.tooltip} formatter={v=>[`${v}%`]}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11,color:th.muted}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{...th.card,borderRadius:16,padding:"22px 18px"}}>
        <div style={{fontWeight:700,color:th.heading,marginBottom:16,fontSize:15}}>Recent Orders</div>
        <MiniTable th={th} orders={[...orders].sort((a,b)=>b.id-a.id).slice(0,5)}/>
      </div>
    </div>
  );
}

function AdminOrders({ th, orders, setOrders, newOrderIds, showToast }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const statuses = ["All","Pending","Processing","Shipped","Delivered","Cancelled"];
  const sorted   = [...orders].sort((a,b)=>b.id-a.id);
  const filtered = sorted.filter(o=>{
    const ms=(o.customerName||"").toLowerCase().includes(search.toLowerCase())||String(o.id).includes(search)||o.product.toLowerCase().includes(search.toLowerCase());
    return ms&&(filter==="All"||o.status===filter);
  });

  const update = (id, status) => {
    api.put(`/orders/admin/${id}/status`,{status}).then(()=>{
      setOrders(p=>p.map(o=>o.id===id?{...o,status}:o));
      showToast(`✅ Order #${id} updated → ${status}`);
    });
  };

  const pending = orders.filter(o=>o.status==="Pending").length;

  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:th.heading,marginBottom:4}}>Orders</h1>
          <p style={{color:th.muted,fontSize:14}}>Auto-refreshes every 4 s. New customer orders appear instantly.</p>
        </div>
        {pending>0 && (
          <div style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:12,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,animation:"popIn 0.3s ease"}}>
            <span style={{fontSize:20}}>🕐</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#f59e0b"}}>{pending} order{pending>1?"s":""} awaiting confirmation</div>
              <div style={{fontSize:11,color:th.muted}}>Change status below to notify customer</div>
            </div>
          </div>
        )}
      </div>

      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by customer, product or order ID…"
          style={{...th.input,flex:1,minWidth:220,padding:"10px 16px",borderRadius:10,fontSize:14,border:`1px solid ${th.border}`}}/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {statuses.map(s=>(
            <button key={s} onClick={()=>setFilter(s)}
              style={{background:filter===s?"#f97316":th.card.background,color:filter===s?"#fff":th.muted,border:`1px solid ${filter===s?"#f97316":th.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,cursor:"pointer",fontWeight:500}}>
              {s}{s!=="All"&&<span style={{opacity:0.65,marginLeft:4}}>({orders.filter(o=>o.status===s).length})</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{...th.card,borderRadius:16,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${th.border}`}}>
              {["Order ID","Customer","Product","Date","Total","Status","Update Status"].map(h=>(
                <th key={h} style={{padding:"13px 14px",textAlign:"left",color:th.muted,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o,i)=>{
              const isNew=newOrderIds.has(o.id);
              return(
                <tr key={o.id} className="row-hover"
                  style={{borderBottom:`1px solid ${th.border}`,transition:"background 0.2s",background:isNew?"rgba(249,115,22,0.07)":"transparent",animation:`fadeUp 0.3s ease ${i*0.03}s both`}}>
                  <td style={{padding:"13px 14px",fontSize:13,fontWeight:700,color:"#f97316"}}>
                    #{o.id}{isNew&&<span style={{background:"#f97316",color:"#fff",fontSize:9,padding:"2px 6px",borderRadius:20,marginLeft:6,fontWeight:700,animation:"popIn 0.3s ease"}}>NEW</span>}
                  </td>
                  <td style={{padding:"13px 14px",fontSize:13,color:th.text,fontWeight:500}}>{o.customerName||"—"}</td>
                  <td style={{padding:"13px 14px",fontSize:13,color:th.muted}}>{o.product}</td>
                  <td style={{padding:"13px 14px",fontSize:12,color:th.muted}}>{o.date}</td>
                  <td style={{padding:"13px 14px",fontSize:13,fontWeight:700,color:th.heading}}>${o.total}</td>
                  <td style={{padding:"13px 14px"}}><StatusBadge status={o.status}/></td>
                  <td style={{padding:"13px 14px"}}>
                    <select value={o.status} onChange={e=>update(o.id,e.target.value)}
                      style={{...th.input,fontSize:12,padding:"7px 10px",borderRadius:8,cursor:"pointer",border:`1px solid ${th.border}`,fontWeight:500}}>
                      {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{padding:48,textAlign:"center",color:th.muted}}>No orders found.</div>}
      </div>
    </div>
  );
}

function AdminProducts({ th, products, setProducts, dragItems, setDragItems, dragOver, handleDragStart, handleDragEnter, handleDrop, onAdd, showToast }) {
  const [editing, setEditing]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const sorted = dragItems ? [...dragItems].sort((a,b)=>a.pos-b.pos) : [];

  const saveStock = (id, val) => {
    const stock = parseInt(val)||0;
    api.put(`/products/admin/${id}/stock`,{stock}).then(()=>{
      setProducts(p=>p.map(x=>x.id===id?{...x,stock}:x));
      setDragItems(p=>p.map(x=>x.id===id?{...x,stock}:x));
      setEditing(null); showToast("✅ Stock updated!");
    }).catch(()=>{ setProducts(p=>p.map(x=>x.id===id?{...x,stock}:x)); setEditing(null); showToast("✅ Stock updated locally!"); });
  };

  const deleteProduct = (id) => {
    setProducts(p=>p.filter(x=>x.id!==id));
    setDragItems(p=>p.filter(x=>x.id!==id));
    showToast("🗑️ Product removed.");
  };

  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      {showModal && <AddProductModal th={th} onClose={()=>setShowModal(false)} onAdd={onAdd}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:th.heading,marginBottom:4}}>Products</h1>
          <p style={{color:th.muted,fontSize:14}}>Add products here — customers can browse and order them instantly.</p>
        </div>
        <button onClick={()=>setShowModal(true)}
          style={{background:"linear-gradient(135deg,#f97316,#ea580c)",border:"none",borderRadius:12,padding:"11px 22px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 16px rgba(249,115,22,0.3)"}}>
          ＋ Add Product
        </button>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24,background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:"10px 16px",fontSize:13,color:"#f97316"}}>
        ✋ <strong>Drag & Drop</strong> to reorder · Click <strong>Edit Stock</strong> to update quantity · <strong>Add Product</strong> to publish to customer shop
      </div>

      {products.length===0 && (
        <div style={{...th.card,borderRadius:16,padding:60,textAlign:"center",color:th.muted}}>
          <div style={{fontSize:48,marginBottom:16}}>📦</div>
          <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>No products yet</div>
          <div style={{fontSize:13,marginBottom:24}}>Click "Add Product" to publish your first item to the customer shop.</div>
          <button onClick={()=>setShowModal(true)} style={{background:"linear-gradient(135deg,#f97316,#ea580c)",border:"none",borderRadius:12,padding:"12px 28px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>＋ Add First Product</button>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {sorted.map(p=>(
          <div key={p.id} draggable onDragStart={()=>handleDragStart(p.id)} onDragEnter={()=>handleDragEnter(p.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>handleDrop(p.id)}
            className={`drag-card ${p.dragging?"dragging":""} ${dragOver===p.id?"drag-over":""}`}
            style={{...th.card,borderRadius:16,padding:22,border:`1px solid ${th.border}`,position:"relative"}}>
            {/* Delete btn */}
            <button onClick={()=>deleteProduct(p.id)} style={{position:"absolute",top:12,right:12,background:"rgba(239,68,68,0.1)",border:"none",borderRadius:6,padding:"3px 7px",color:"#ef4444",cursor:"pointer",fontSize:11,fontWeight:600}}>✕</button>
            <div style={{fontSize:42,marginBottom:12}}>{p.img||p.emoji||"📦"}</div>
            <div style={{fontWeight:700,fontSize:15,color:th.heading,marginBottom:4}}>{p.name}</div>
            <div style={{fontSize:12,color:th.muted,marginBottom:4}}>{p.category}</div>
            {p.description&&<div style={{fontSize:11,color:th.muted,marginBottom:12,lineHeight:1.5}}>{p.description}</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:18,fontWeight:700,color:"#f97316"}}>${p.price}</span>
              <span style={{fontSize:12,color:p.stock===0?"#ef4444":p.stock<20?"#f59e0b":"#22c55e",fontWeight:600}}>
                {p.stock===0?"❌ Out":p.stock<20?"⚠️":  "✅"} {p.stock} in stock
              </span>
            </div>
            {editing===p.id?(
              <div style={{display:"flex",gap:8}}>
                <input type="number" defaultValue={p.stock} id={`s${p.id}`} style={{...th.input,flex:1,padding:"7px 10px",borderRadius:8,fontSize:13,border:`1px solid ${th.border}`}}/>
                <button onClick={()=>saveStock(p.id,document.getElementById(`s${p.id}`).value)} style={{background:"#f97316",border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:600}}>Save</button>
                <button onClick={()=>setEditing(null)} style={{background:th.badge,border:"none",borderRadius:8,padding:"7px 10px",color:th.muted,fontSize:13,cursor:"pointer"}}>✕</button>
              </div>
            ):(
              <button onClick={()=>setEditing(p.id)} style={{width:"100%",background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.25)",borderRadius:8,padding:8,color:"#f97316",fontSize:13,cursor:"pointer",fontWeight:600}}>✏️ Edit Stock</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAnalytics({ th }) {
  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:th.heading,marginBottom:6}}>Analytics</h1>
      <p style={{color:th.muted,fontSize:14,marginBottom:28}}>Store performance overview.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        <div style={{...th.card,borderRadius:16,padding:22}}>
          <div style={{fontWeight:700,color:th.heading,marginBottom:16}}>Monthly Revenue vs Orders</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REVENUE_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={th.gridLine}/>
              <XAxis dataKey="month" tick={{fill:th.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="left" tick={{fill:th.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <YAxis yAxisId="right" orientation="right" tick={{fill:th.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={th.tooltip}/>
              <Bar yAxisId="left" dataKey="revenue" fill="#f97316" radius={[6,6,0,0]}/>
              <Bar yAxisId="right" dataKey="orders" fill="#fb923c" radius={[6,6,0,0]} opacity={0.7}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{...th.card,borderRadius:16,padding:22}}>
          <div style={{fontWeight:700,color:th.heading,marginBottom:16}}>Category Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({name,value})=>`${name} ${value}%`} labelLine={false}>
                {CATEGORY_DATA.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={th.tooltip}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{...th.card,borderRadius:16,padding:22}}>
        <div style={{fontWeight:700,color:th.heading,marginBottom:16}}>Revenue Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={REVENUE_DATA}>
            <defs><linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={th.gridLine}/>
            <XAxis dataKey="month" tick={{fill:th.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:th.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
            <Tooltip contentStyle={th.tooltip} formatter={v=>[`$${v.toLocaleString()}`,"Revenue"]}/>
            <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fill="url(#rev2)" dot={{fill:"#f97316",r:4}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function CustomerDashboard({ user, onLogout, dark, setDark }) {
  const [tab, setTab]               = useState("shop");
  const [orders, setOrders]         = useState([]);
  const [products, setProducts]     = useState([]);
  // ── Cart is LOCAL state only — no backend dependency for display ──
  const [cart, setCart]             = useState([]);
  const [checkoutCart, setCheckoutCart] = useState(null); // cart snapshot for checkout
  const [updatedIds, setUpdatedIds] = useState(new Set());
  const [toast, setToast]           = useState(null);
  const th = dark ? T.dark : T.light;

  const showToast = (msg, color="#22c55e") => { setToast({msg,color}); setTimeout(()=>setToast(null),3500); };

  const loadProducts = useCallback(()=>{
    api.get("/products").then(r=>r.json()).then(data=>{
      setProducts(data && data.length>0 ? data : SEED_PRODUCTS);
    }).catch(()=>setProducts(SEED_PRODUCTS));
  },[]);

  const loadOrders = useCallback(()=>{
    api.get("/orders/my").then(r=>r.json()).then(fresh=>{
      setOrders(prev=>{
        const localOnly = prev.filter(o=>o._local);
        const changed = fresh.filter(fo=>{ const old=prev.find(po=>String(po.id)===String(fo.id)); return old&&old.status!==fo.status; });
        if(changed.length>0){
          setUpdatedIds(s=>{ const n=new Set(s); changed.forEach(o=>n.add(o.id)); return n; });
          changed.forEach(o=>{
            const msgs = { Processing:"⚙️ Your order is being packed!", Shipped:"🚚 Your order has been shipped!", Delivered:"✅ Your order has been delivered!", Cancelled:"❌ Your order was cancelled." };
            showToast(msgs[o.status]||`Order updated to ${o.status}`, o.status==="Delivered"?"#22c55e":o.status==="Cancelled"?"#ef4444":"#f97316");
          });
          setTimeout(()=>setUpdatedIds(new Set()),6000);
        }
        const freshIds = new Set(fresh.map(o=>String(o.id)));
        const stillLocal = localOnly.filter(o=>!freshIds.has(String(o.id)));
        return [...fresh, ...stillLocal];
      });
    }).catch(()=>{});
  },[]);

  useEffect(()=>{ loadProducts(); loadOrders(); },[]);
  useEffect(()=>{ const iv=setInterval(loadOrders,5000); return()=>clearInterval(iv); },[loadOrders]);
  useEffect(()=>{ const iv=setInterval(loadProducts,10000); return()=>clearInterval(iv); },[loadProducts]);

  // ── Cart operations — pure local state, always works ──
  const addToCart = (product) => {
    setCart(prev=>{
      const ex = prev.find(c=>c.pid===product.id);
      if(ex) return prev.map(c=>c.pid===product.id ? {...c, qty:c.qty+1} : c);
      return [...prev, { uid:Date.now()+Math.random(), pid:product.id, name:product.name, price:product.price, emoji:product.emoji||"📦", qty:1 }];
    });
    showToast(`🛒 ${product.name} added to cart!`,"#f97316");
  };

  const updateQty = (uid, qty) => {
    if(qty<1) setCart(prev=>prev.filter(c=>c.uid!==uid));
    else setCart(prev=>prev.map(c=>c.uid===uid?{...c,qty}:c));
  };

  const removeFromCart = (uid) => setCart(prev=>prev.filter(c=>c.uid!==uid));

  // Go to checkout — pass cart snapshot
  const goCheckout = () => { setCheckoutCart([...cart]); setTab("checkout"); };

  const placeOrder = async (paymentMethod, address, itemsOverride) => {
    const items = itemsOverride || checkoutCart || cart;
    if(!items || items.length === 0) { console.error("placeOrder: no items!"); return; }

    // Build local orders immediately so customer sees them right away
    const now = new Date().toISOString().slice(0,10);
    const localOrders = items.map(item => ({
      id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2),
      product: item.name,
      total: item.price * item.qty,
      status: "Pending",
      date: now,
      customerName: user.name,
      _local: true,
    }));

    // Show immediately in My Orders — no waiting for backend
    setOrders(prev => [...localOrders, ...prev]);
    setCart([]);
    setCheckoutCart(null);
    setTab("orders");
    showToast("🎉 Order placed! Admin will confirm soon.", "#22c55e");

    // Sync to backend — replace local placeholder entries with real DB records
    const saved = [];
    for(const item of items){
      try {
        const res = await api.post("/orders", { product: item.name, total: item.price * item.qty });
        if(res.ok){
          const o = await res.json();
          saved.push(o);
        } else {
          const errText = await res.text().catch(()=>"");
          console.error("❌ Order POST failed:", res.status, errText);
        }
      } catch(err) {
        console.error("❌ Order POST network error:", err);
      }
    }
    if(saved.length > 0){
      // Replace all local placeholder orders with the real saved ones
      setOrders(prev => [...saved, ...prev.filter(o => !o._local)]);
    }
  };

  const cartQty   = cart.reduce((s,c)=>s+c.qty,0);
  const cartTotal = cart.reduce((s,c)=>s+c.price*c.qty,0);
  const updCount  = updatedIds.size;

  const navItems = [
    {key:"shop",     icon:"🛍️", label:"Shop"},
    {key:"cart",     icon:"🛒", label:"Cart",      badge:cartQty},
    {key:"orders",   icon:"📦", label:"My Orders", badge:updCount},
  ];

  return (
    <AppLayout user={user} onLogout={onLogout} dark={dark} setDark={setDark} navItems={navItems} activeTab={tab==="checkout"?"cart":tab} setTab={t=>{ setTab(t); if(t!=="checkout") setCheckoutCart(null); }}>
      {toast && <Toast msg={toast.msg} color={toast.color}/>}
      {tab==="shop"     && <CustomerShop     th={th} products={products} addToCart={addToCart} cart={cart} goCheckout={goCheckout}/>}
      {tab==="cart"     && <CustomerCart     th={th} cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} cartTotal={cartTotal} goCheckout={goCheckout}/>}
      {tab==="checkout" && <CustomerCheckout th={th} cart={checkoutCart||cart} cartTotal={cartTotal} placeOrder={placeOrder} onBack={()=>setTab("cart")} user={user}/>}
      {tab==="orders"   && <CustomerOrders   th={th} orders={orders} updatedIds={updatedIds}/>}
    </AppLayout>
  );
}

// ── Shop ──────────────────────────────────────────────────────────────────────
function CustomerShop({ th, products, addToCart, cart, goCheckout }) {
  const [added, setAdded]       = useState(null);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", ...new Set(products.map(p=>p.category).filter(Boolean))];
  const inCart  = (id) => cart.find(c=>c.pid===id);
  const handle  = (p) => { addToCart(p); setAdded(p.id); setTimeout(()=>setAdded(null),1400); };
  const filtered = products.filter(p=> p.name.toLowerCase().includes(search.toLowerCase()) && (category==="All"||p.category===category));

  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:th.heading,marginBottom:6}}>Shop</h1>
      <p style={{color:th.muted,fontSize:14,marginBottom:20}}>Browse products and add them to your cart.</p>

      <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"
          style={{...th.input,flex:1,minWidth:200,padding:"10px 16px",borderRadius:10,fontSize:14,border:`1px solid ${th.border}`}}/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {categories.map(c=>(
            <button key={c} onClick={()=>setCategory(c)}
              style={{background:category===c?"#f97316":th.card.background,color:category===c?"#fff":th.muted,border:`1px solid ${category===c?"#f97316":th.border}`,borderRadius:8,padding:"8px 14px",fontSize:13,cursor:"pointer",fontWeight:500}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length===0 && (
        <div style={{...th.card,borderRadius:16,padding:60,textAlign:"center",color:th.muted}}>
          <div style={{fontSize:48,marginBottom:16}}>🔍</div>
          <div style={{fontSize:16,fontWeight:600}}>No products found</div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {filtered.map((p,i)=>{
          const justAdded = added===p.id;
          const qty = inCart(p.id)?.qty||0;
          const outOfStock = p.stock===0;
          return(
            <div key={p.id} className="prod-card" style={{...th.card,borderRadius:18,padding:26,border:`1px solid ${th.border}`,transition:"all 0.25s",animation:`fadeUp 0.3s ease ${i*0.05}s both`,opacity:outOfStock?0.5:1}}>
              <div style={{fontSize:52,marginBottom:14,textAlign:"center"}}>{p.emoji||p.img||"📦"}</div>
              <div style={{fontWeight:700,fontSize:16,color:th.heading,marginBottom:4}}>{p.name}</div>
              <div style={{fontSize:12,color:"#f97316",fontWeight:600,marginBottom:8}}>{p.category}</div>
              {p.description&&<div style={{fontSize:13,color:th.muted,marginBottom:14,lineHeight:1.6,minHeight:38}}>{p.description}</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:22,fontWeight:800,color:th.heading}}>${p.price}</span>
                <span style={{fontSize:12,color:outOfStock?"#ef4444":p.stock<20?"#f59e0b":"#22c55e",fontWeight:600}}>
                  {outOfStock?"❌ Out":p.stock<20?"⚠️ Low":"✅ In stock"}
                </span>
              </div>
              {/* Two buttons: Add to Cart + Buy Now */}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>!outOfStock&&handle(p)} disabled={outOfStock}
                  style={{flex:1,background:justAdded?"#22c55e":outOfStock?"#333":qty>0?"#ea580c":"rgba(249,115,22,0.15)",border:qty>0||justAdded?"none":`1px solid rgba(249,115,22,0.4)`,borderRadius:10,padding:"10px 6px",color:justAdded||qty>0?"#fff":"#f97316",fontSize:13,fontWeight:700,cursor:outOfStock?"not-allowed":"pointer",transition:"all 0.2s",textAlign:"center"}}>
                  {justAdded?"✅ Added":outOfStock?"—":qty>0?`🛒 (${qty})`:"🛒 Cart"}
                </button>
                <button onClick={()=>{ if(!outOfStock){ addToCart(p); goCheckout(); }}} disabled={outOfStock}
                  style={{flex:1,background:outOfStock?"#333":"linear-gradient(135deg,#f97316,#ea580c)",border:"none",borderRadius:10,padding:"10px 6px",color:"#fff",fontSize:13,fontWeight:700,cursor:outOfStock?"not-allowed":"pointer",transition:"all 0.2s",textAlign:"center"}}>
                  ⚡ Buy Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Cart ──────────────────────────────────────────────────────────────────────
function CustomerCart({ th, cart, removeFromCart, updateQty, cartTotal, goCheckout }) {
  if(cart.length===0) return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:th.heading,marginBottom:6}}>Cart</h1>
      <div style={{...th.card,borderRadius:16,padding:60,textAlign:"center",color:th.muted,marginTop:24}}>
        <div style={{fontSize:52,marginBottom:16}}>🛒</div>
        <div style={{fontSize:16,fontWeight:600}}>Your cart is empty</div>
        <div style={{fontSize:13,marginTop:8}}>Go to Shop to browse products!</div>
      </div>
    </div>
  );

  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:th.heading,marginBottom:6}}>Cart</h1>
      <p style={{color:th.muted,fontSize:14,marginBottom:24}}>{cart.reduce((s,c)=>s+c.qty,0)} items · ${cartTotal} total</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:24,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {cart.map((item,i)=>(
            <div key={item.uid} style={{...th.card,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,animation:`fadeUp 0.3s ease ${i*0.05}s both`}}>
              <div style={{fontSize:34}}>{item.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:th.heading,marginBottom:2}}>{item.name}</div>
                <div style={{fontSize:12,color:th.muted}}>${item.price} each</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <button onClick={()=>updateQty(item.uid,item.qty-1)} style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${th.border}`,background:th.badge,color:th.text,fontSize:16,cursor:"pointer",display:"grid",placeItems:"center"}}>−</button>
                <span style={{fontWeight:700,fontSize:15,color:th.heading,minWidth:22,textAlign:"center"}}>{item.qty}</span>
                <button onClick={()=>updateQty(item.uid,item.qty+1)} style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${th.border}`,background:th.badge,color:th.text,fontSize:16,cursor:"pointer",display:"grid",placeItems:"center"}}>+</button>
              </div>
              <div style={{fontWeight:700,fontSize:15,color:"#f97316",minWidth:56,textAlign:"right"}}>${(item.price*item.qty).toFixed(0)}</div>
              <button onClick={()=>removeFromCart(item.uid)} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:8,padding:"5px 9px",color:"#ef4444",cursor:"pointer",fontSize:12,fontWeight:700}}>✕</button>
            </div>
          ))}
        </div>

        {/* Summary panel */}
        <div style={{...th.card,borderRadius:16,padding:24,border:`1px solid ${th.border}`,position:"sticky",top:0}}>
          <div style={{fontWeight:800,fontSize:17,color:th.heading,marginBottom:18,fontFamily:"'Syne',sans-serif"}}>Order Summary</div>
          {cart.map(item=>(
            <div key={item.uid} style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:13}}>
              <span style={{color:th.muted}}>{item.name} × {item.qty}</span>
              <span style={{color:th.text,fontWeight:600}}>${(item.price*item.qty).toFixed(0)}</span>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${th.border}`,margin:"14px 0",paddingTop:14,display:"flex",justifyContent:"space-between"}}>
            <span style={{color:th.muted,fontSize:13}}>Shipping</span>
            <span style={{color:"#22c55e",fontWeight:600,fontSize:13}}>FREE</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
            <span style={{fontWeight:700,fontSize:15,color:th.heading}}>Total</span>
            <span style={{fontWeight:800,fontSize:20,color:"#f97316"}}>${cartTotal}</span>
          </div>
          <button onClick={goCheckout}
            style={{width:"100%",background:"linear-gradient(135deg,#f97316,#ea580c)",border:"none",borderRadius:12,padding:13,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Checkout ──────────────────────────────────────────────────────────────────
function CustomerCheckout({ th, cart, cartTotal, placeOrder, onBack, user }) {
  const [step, setStep]       = useState(1); // 1=address, 2=payment, 3=confirm
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ name: user.name||"", phone:"", line1:"", city:"", zip:"", country:"India" });
  const [payment, setPayment] = useState("card");
  const [card, setCard]       = useState({ number:"", expiry:"", cvv:"", holder:"" });
  const [upiId, setUpiId]     = useState("");

  const setA = (k,v) => setAddress(a=>({...a,[k]:v}));
  const setC = (k,v) => setCard(c=>({...c,[k]:v}));

  const fmtCard = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExp  = (v) => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };

  const addrOk = address.name && address.phone && address.line1 && address.city && address.zip;
  // payOk — COD always ok, UPI needs an id, Card needs holder+number(min 12 digits)+expiry+cvv
  const payOk  = payment==="cod"
    || (payment==="upi" && upiId.trim().length > 3)
    || (payment==="card" && card.holder && card.number.replace(/\s/g,"").length >= 12 && card.expiry.length === 5 && card.cvv.length >= 3);

  const handleConfirm = async () => {
    console.log("handleConfirm fired, cart:", cart);
    if(!cart || cart.length === 0) { console.error("handleConfirm: cart is empty!"); return; }
    setPlacing(true);
    try {
      await placeOrder(payment, `${address.line1}, ${address.city} ${address.zip}, ${address.country}`, cart);
    } catch(e) {
      console.error("handleConfirm error:", e);
    } finally {
      setPlacing(false);
    }
  };

  const payMethods = [
    { id:"card",  icon:"💳", label:"Credit / Debit Card" },
    { id:"upi",   icon:"📱", label:"UPI / PhonePe / GPay" },
    { id:"cod",   icon:"💵", label:"Cash on Delivery" },
  ];

  const stepLabel = ["", "Delivery Address", "Payment Method", "Review & Confirm"];

  return (
    <div style={{animation:"fadeUp 0.4s ease",maxWidth:720,margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
        <button onClick={onBack} style={{background:th.badge,border:"none",borderRadius:10,padding:"8px 14px",color:th.muted,cursor:"pointer",fontSize:13,fontWeight:600}}>← Back</button>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:th.heading}}>Checkout</h1>
      </div>

      {/* Step indicator */}
      <div style={{display:"flex",alignItems:"center",marginBottom:32,gap:0}}>
        {[1,2,3].map((s,i)=>(
          <React.Fragment key={s}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:step>=s?"#f97316":th.badge,border:`2px solid ${step>=s?"#f97316":th.border}`,display:"grid",placeItems:"center",fontSize:13,fontWeight:700,color:step>=s?"#fff":th.muted,transition:"all 0.3s"}}>
                {step>s?"✓":s}
              </div>
              <span style={{fontSize:13,fontWeight:step===s?700:400,color:step>=s?th.heading:th.muted}}>{stepLabel[s]}</span>
            </div>
            {i<2&&<div style={{flex:1,height:2,background:step>s?"#f97316":th.border,margin:"0 12px",transition:"background 0.3s"}}/>}
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 1: Address ── */}
      {step===1 && (
        <div style={{...th.card,borderRadius:16,padding:28}}>
          <div style={{fontWeight:700,fontSize:17,color:th.heading,marginBottom:20}}>📍 Delivery Address</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            {[
              {k:"name",  label:"Full Name",    ph:"Your full name"},
              {k:"phone", label:"Phone Number", ph:"+91 98765 43210"},
            ].map(f=>(
              <div key={f.k}>
                <label style={{display:"block",fontSize:12,fontWeight:600,color:th.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:7}}>{f.label}</label>
                <input value={address[f.k]} onChange={e=>setA(f.k,e.target.value)} placeholder={f.ph}
                  style={{...th.input,width:"100%",padding:"10px 14px",borderRadius:10,fontSize:14,border:`1px solid ${th.border}`}}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:th.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:7}}>Address Line</label>
            <input value={address.line1} onChange={e=>setA("line1",e.target.value)} placeholder="House / Flat / Street"
              style={{...th.input,width:"100%",padding:"10px 14px",borderRadius:10,fontSize:14,border:`1px solid ${th.border}`}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:24}}>
            {[
              {k:"city",    label:"City",    ph:"Mumbai"},
              {k:"zip",     label:"PIN Code",ph:"400001"},
              {k:"country", label:"Country", ph:"India"},
            ].map(f=>(
              <div key={f.k}>
                <label style={{display:"block",fontSize:12,fontWeight:600,color:th.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:7}}>{f.label}</label>
                <input value={address[f.k]} onChange={e=>setA(f.k,e.target.value)} placeholder={f.ph}
                  style={{...th.input,width:"100%",padding:"10px 14px",borderRadius:10,fontSize:14,border:`1px solid ${th.border}`}}/>
              </div>
            ))}
          </div>
          <button onClick={()=>setStep(2)} disabled={!addrOk}
            style={{width:"100%",background:addrOk?"linear-gradient(135deg,#f97316,#ea580c)":"#444",border:"none",borderRadius:12,padding:13,color:"#fff",fontSize:15,fontWeight:700,cursor:addrOk?"pointer":"not-allowed"}}>
            Continue to Payment →
          </button>
        </div>
      )}

      {/* ── Step 2: Payment ── */}
      {step===2 && (
        <div style={{...th.card,borderRadius:16,padding:28}}>
          <div style={{fontWeight:700,fontSize:17,color:th.heading,marginBottom:20}}>💳 Payment Method</div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
            {payMethods.map(m=>(
              <div key={m.id} onClick={()=>setPayment(m.id)}
                style={{border:`2px solid ${payment===m.id?"#f97316":th.border}`,borderRadius:12,padding:"14px 18px",cursor:"pointer",background:payment===m.id?"rgba(249,115,22,0.07)":th.card.background,display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"}}>
                <span style={{fontSize:22}}>{m.icon}</span>
                <span style={{fontWeight:600,fontSize:14,color:th.heading}}>{m.label}</span>
                {payment===m.id&&<span style={{marginLeft:"auto",color:"#f97316",fontSize:18}}>●</span>}
              </div>
            ))}
          </div>

          {/* Card details */}
          {payment==="card" && (
            <div style={{background:th.badge,borderRadius:12,padding:20,marginBottom:24}}>
              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:12,fontWeight:600,color:th.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:7}}>Cardholder Name</label>
                <input value={card.holder} onChange={e=>setC("holder",e.target.value)} placeholder="Name on card"
                  style={{...th.input,width:"100%",padding:"10px 14px",borderRadius:10,fontSize:14,border:`1px solid ${th.border}`}}/>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:12,fontWeight:600,color:th.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:7}}>Card Number</label>
                <input value={card.number} onChange={e=>setC("number",fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19}
                  style={{...th.input,width:"100%",padding:"10px 14px",borderRadius:10,fontSize:14,border:`1px solid ${th.border}`,letterSpacing:2}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:600,color:th.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:7}}>Expiry</label>
                  <input value={card.expiry} onChange={e=>setC("expiry",fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5}
                    style={{...th.input,width:"100%",padding:"10px 14px",borderRadius:10,fontSize:14,border:`1px solid ${th.border}`}}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:600,color:th.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:7}}>CVV</label>
                  <input value={card.cvv} onChange={e=>setC("cvv",e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="•••" type="password"
                    style={{...th.input,width:"100%",padding:"10px 14px",borderRadius:10,fontSize:14,border:`1px solid ${th.border}`}}/>
                </div>
              </div>
            </div>
          )}
          {payment==="upi" && (
            <div style={{background:th.badge,borderRadius:12,padding:20,marginBottom:24}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:th.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:7}}>UPI ID</label>
              <input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="yourname@okhdfcbank / @ybl / @paytm"
                style={{...th.input,width:"100%",padding:"10px 14px",borderRadius:10,fontSize:14,border:`1px solid ${upiId.length>3?"#22c55e":th.border}`}}/>
              {upiId.length>0 && upiId.length<=3 && <div style={{fontSize:11,color:"#ef4444",marginTop:6}}>Enter a valid UPI ID</div>}
              <div style={{fontSize:12,color:th.muted,marginTop:8}}>You'll receive a payment request on your UPI app.</div>
            </div>
          )}
          {payment==="cod" && (
            <div style={{background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,padding:16,marginBottom:24,fontSize:13,color:"#22c55e"}}>
              💵 Pay ${cartTotal} in cash when your order is delivered.
            </div>
          )}

          {!payOk && payment==="card" && (
            <div style={{fontSize:12,color:"#f59e0b",marginBottom:10,padding:"8px 12px",background:"rgba(245,158,11,0.1)",borderRadius:8}}>
              ⚠️ Please fill in all card details to continue.
            </div>
          )}
          {!payOk && payment==="upi" && (
            <div style={{fontSize:12,color:"#f59e0b",marginBottom:10,padding:"8px 12px",background:"rgba(245,158,11,0.1)",borderRadius:8}}>
              ⚠️ Please enter your UPI ID to continue.
            </div>
          )}
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>setStep(1)} style={{flex:1,background:th.badge,border:`1px solid ${th.border}`,borderRadius:12,padding:12,color:th.muted,fontSize:14,cursor:"pointer",fontWeight:600}}>← Back</button>
            <button onClick={()=>{ if(payOk) setStep(3); }} disabled={!payOk}
              style={{flex:2,background:payOk?"linear-gradient(135deg,#f97316,#ea580c)":"rgba(100,100,100,0.4)",border:"none",borderRadius:12,padding:12,color:"#fff",fontSize:15,fontWeight:700,cursor:payOk?"pointer":"not-allowed",opacity:payOk?1:0.7}}>
              {payOk ? "Review Order →" : "Fill details above ↑"}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirm ── */}
      {step===3 && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Items */}
          <div style={{...th.card,borderRadius:16,padding:24}}>
            <div style={{fontWeight:700,fontSize:16,color:th.heading,marginBottom:16}}>🛍️ Order Items</div>
            {cart.map(item=>(
              <div key={item.uid} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${th.border}`}}>
                <div style={{fontSize:28}}>{item.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14,color:th.heading}}>{item.name}</div>
                  <div style={{fontSize:12,color:th.muted}}>${item.price} × {item.qty}</div>
                </div>
                <div style={{fontWeight:700,color:"#f97316"}}>${(item.price*item.qty).toFixed(0)}</div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              <span style={{color:th.muted,fontSize:14}}>Shipping</span>
              <span style={{color:"#22c55e",fontWeight:600}}>FREE</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
              <span style={{fontWeight:700,fontSize:16,color:th.heading}}>Total</span>
              <span style={{fontWeight:800,fontSize:20,color:"#f97316"}}>${cartTotal}</span>
            </div>
          </div>

          {/* Address + Payment summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{...th.card,borderRadius:14,padding:20}}>
              <div style={{fontWeight:700,fontSize:14,color:th.heading,marginBottom:12}}>📍 Delivery To</div>
              <div style={{fontSize:13,color:th.text,lineHeight:1.8}}>{address.name}<br/>{address.phone}<br/>{address.line1}<br/>{address.city}, {address.zip}<br/>{address.country}</div>
            </div>
            <div style={{...th.card,borderRadius:14,padding:20}}>
              <div style={{fontWeight:700,fontSize:14,color:th.heading,marginBottom:12}}>💳 Payment</div>
              <div style={{fontSize:22,marginBottom:8}}>{payMethods.find(m=>m.id===payment)?.icon}</div>
              <div style={{fontSize:13,color:th.text,fontWeight:600}}>{payMethods.find(m=>m.id===payment)?.label}</div>
              {payment==="card"&&<div style={{fontSize:12,color:th.muted,marginTop:4}}>•••• •••• •••• {card.number.replace(/\s/g,"").slice(-4)||"****"}</div>}
              {payment==="cod"&&<div style={{fontSize:12,color:"#22c55e",marginTop:4}}>Pay on delivery</div>}
            </div>
          </div>

          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>setStep(2)} style={{flex:1,background:th.badge,border:`1px solid ${th.border}`,borderRadius:12,padding:13,color:th.muted,fontSize:14,cursor:"pointer",fontWeight:600}}>← Back</button>
            <button onClick={handleConfirm} disabled={placing}
              style={{flex:3,background:placing?"#7c3d12":"linear-gradient(135deg,#22c55e,#16a34a)",border:"none",borderRadius:12,padding:14,color:"#fff",fontSize:16,fontWeight:700,cursor:placing?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 20px rgba(34,197,94,0.35)"}}>
              {placing?<><Spinner/> Placing Order…</>:<>✅ Confirm & Place Order — ${cartTotal}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerOrders({ th, orders, updatedIds }) {
  const steps = ["Pending","Processing","Shipped","Delivered"];
  const sorted = [...orders].sort((a,b)=>b.id-a.id);

  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:th.heading,marginBottom:6}}>My Orders</h1>
      <p style={{color:th.muted,fontSize:14,marginBottom:12}}>Refreshes every 5 s — admin status updates appear here automatically.</p>

      {updatedIds.size>0&&(
        <div style={{background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.3)",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10,animation:"popIn 0.3s ease"}}>
          <span style={{fontSize:20}}>🔔</span>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:"#f97316"}}>{updatedIds.size} order{updatedIds.size>1?"s":""} updated by admin!</div>
            <div style={{fontSize:12,color:th.muted}}>Scroll to see the highlighted orders below.</div>
          </div>
        </div>
      )}

      {sorted.length===0&&(
        <div style={{...th.card,borderRadius:16,padding:60,textAlign:"center",color:th.muted}}>
          <div style={{fontSize:48,marginBottom:16}}>📭</div>
          <div style={{fontSize:16,fontWeight:600}}>No orders yet</div>
          <div style={{fontSize:13,marginTop:8}}>Head to the Shop to place your first order!</div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        {sorted.map((o,i)=>{
          const idx = steps.indexOf(o.status);
          const cancelled = o.status==="Cancelled";
          const isUpdated = updatedIds.has(o.id);
          const statusColor = {Pending:"#f59e0b",Processing:"#3b82f6",Shipped:"#8b5cf6",Delivered:"#22c55e",Cancelled:"#ef4444"}[o.status]||"#888";

          return(
            <div key={o.id} style={{...th.card,borderRadius:16,padding:24,border:`2px solid ${isUpdated?"#f97316":th.border}`,animation:`fadeUp 0.3s ease ${i*0.06}s both`,boxShadow:isUpdated?"0 0 0 4px rgba(249,115,22,0.12)":"none",transition:"all 0.4s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <div style={{fontWeight:700,fontSize:16,color:th.heading}}>{o.product}</div>
                    {isUpdated&&<span style={{background:"#f97316",color:"#fff",fontSize:9,padding:"2px 8px",borderRadius:20,fontWeight:700,animation:"popIn 0.3s ease"}}>UPDATED</span>}
                  </div>
                  <div style={{fontSize:13,color:th.muted}}>Order #{o.id} · {o.date}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:18,fontWeight:700,color:"#f97316"}}>${o.total}</span>
                  <StatusBadge status={o.status}/>
                </div>
              </div>

              {!cancelled&&(
                <div style={{position:"relative",paddingTop:8,paddingBottom:12}}>
                  <div style={{position:"absolute",top:24,left:"8%",right:"8%",height:3,background:th.border,borderRadius:4}}/>
                  <div style={{position:"absolute",top:24,left:"8%",height:3,borderRadius:4,background:"linear-gradient(90deg,#f97316,#ea580c)",width:`${Math.max(0,(idx/(steps.length-1))*84)}%`,transition:"width 0.8s ease"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",position:"relative"}}>
                    {steps.map((step,si)=>{
                      const done=si<=idx; const curr=si===idx;
                      return(
                        <div key={step} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,flex:1}}>
                          <div style={{width:34,height:34,borderRadius:"50%",background:done?"#f97316":th.badge,border:curr?"3px solid #f97316":`2px solid ${th.border}`,display:"grid",placeItems:"center",fontSize:14,zIndex:1,transition:"all 0.4s",boxShadow:curr?"0 0 0 5px rgba(249,115,22,0.18)":"none",color:"#fff"}}>
                            {si<idx?"✓":done?["🕐","⚙️","🚚","✅"][si]:"○"}
                          </div>
                          <div style={{fontSize:11,fontWeight:done?600:400,color:done?th.heading:th.muted,textAlign:"center"}}>{step}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{marginTop:8,padding:"10px 14px",borderRadius:10,background:`${statusColor}11`,border:`1px solid ${statusColor}33`,fontSize:13,color:statusColor,fontWeight:500}}>
                {{
                  Pending:    "🕐 Order received — waiting for admin confirmation.",
                  Processing: "⚙️ Admin confirmed! Your order is being packed.",
                  Shipped:    "🚚 On the way! Your order has been dispatched.",
                  Delivered:  "✅ Delivered! Enjoy your purchase. Thank you!",
                  Cancelled:  "❌ This order was cancelled. Contact support if needed.",
                }[o.status]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveFeed({ th, notifications }) {
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:th.heading}}>Live Feed</h1>
        <span style={{display:"flex",alignItems:"center",gap:6,background:"rgba(34,197,94,0.12)",color:"#22c55e",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 1.5s infinite"}}/> LIVE
        </span>
      </div>
      <p style={{color:th.muted,fontSize:14,marginBottom:24}}>Real-time activity — new customer orders appear here instantly.</p>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {notifications.length===0&&<div style={{...th.card,borderRadius:14,padding:40,textAlign:"center",color:th.muted}}><div style={{fontSize:32,marginBottom:8}}>⏳</div>Waiting for events…</div>}
        {notifications.map(n=>(
          <div key={n.id} style={{...th.card,borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,animation:"slideIn 0.4s ease",borderLeft:`3px solid ${n.type==="alert"?"#ef4444":n.type==="order"?"#f97316":n.type==="payment"?"#22c55e":"#60a5fa"}`}}>
            <span style={{fontSize:22}}>{n.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:th.text,fontWeight:500}}>{n.msg}</div>
              <div style={{fontSize:11,color:th.muted,marginTop:3}}>{n.ts}</div>
            </div>
            <span style={{fontSize:11,color:th.muted,padding:"3px 8px",background:th.badge,borderRadius:6,textTransform:"uppercase",fontWeight:600,letterSpacing:0.5}}>{n.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniTable({ th, orders }) {
  return(
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead>
        <tr style={{borderBottom:`1px solid ${th.border}`}}>
          {["ID","Customer","Product","Total","Status"].map(h=>(
            <th key={h} style={{padding:"10px 14px",textAlign:"left",color:th.muted,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {orders.map(o=>(
          <tr key={o.id} className="row-hover" style={{borderBottom:`1px solid ${th.border}`,transition:"background 0.15s"}}>
            <td style={{padding:"12px 14px",fontSize:12,fontWeight:700,color:"#f97316"}}>#{o.id}</td>
            <td style={{padding:"12px 14px",fontSize:13,color:th.text}}>{o.customerName||"—"}</td>
            <td style={{padding:"12px 14px",fontSize:13,color:th.muted}}>{o.product}</td>
            <td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:th.heading}}>${o.total}</td>
            <td style={{padding:"12px 14px"}}><StatusBadge status={o.status}/></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]         = useState(null);
  const [dark, setDark]         = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(()=>{
    api.get("/auth/me").then(r=>r.ok?r.json():Promise.reject()).then(u=>setUser(u)).catch(()=>{}).finally(()=>setChecking(false));
  },[]);

  const handleLogout = async () => { await api.post("/auth/logout",{}).catch(()=>{}); setUser(null); };

  if(checking) return(
    <>
      <GlobalStyles/>
      <div style={{width:"100vw",height:"100vh",background:"#0f0f11",display:"grid",placeItems:"center",fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16,animation:"pulse 1.5s infinite"}}>🛍️</div>
          <div style={{color:"#f97316",fontWeight:600,fontSize:16}}>Loading ShopFlow…</div>
        </div>
      </div>
    </>
  );

  return(
    <>
      <GlobalStyles/>
      {!user                   && <LoginPage           onLogin={setUser}/>}
      {user?.role==="admin"    && <AdminDashboard    user={user} onLogout={handleLogout} dark={dark} setDark={setDark}/>}
      {user?.role==="customer" && <CustomerDashboard user={user} onLogout={handleLogout} dark={dark} setDark={setDark}/>}
    </>
  );
}

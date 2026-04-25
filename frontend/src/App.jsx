import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ============================================================
// API & AUTH CONTEXT
// ============================================================
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const API = `${BASE_URL}/api`;
const AuthContext = createContext(null);

function useAuth() { return useContext(AuthContext); }

function api(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${API}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    ...options,
  }).then(r => r.json());
}

// ============================================================
// ICONS (inline SVGs)
// ============================================================
const Icon = ({ name, size = 20 }) => {
  const icons = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
    map: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></>,
    phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.2 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>,
    trophy: <><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 006 6 6 6 0 006-6V2z"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ============================================================
// THEME
// ============================================================
const COLORS = {
  primary: "#0f4c75",
  secondary: "#1b6ca8",
  accent: "#e8a838",
  light: "#e8f4fd",
  dark: "#0a2540",
  success: "#27ae60",
  danger: "#e74c3c",
  warning: "#f39c12",
  text: "#2c3e50",
  muted: "#6c757d",
};

// ============================================================
// GLOBAL STYLES
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; color: ${COLORS.text}; background: #f8f9fb; }
    :root { --primary: ${COLORS.primary}; --secondary: ${COLORS.secondary}; --accent: ${COLORS.accent}; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: ${COLORS.secondary}; border-radius: 3px; }
    .fade-in { animation: fadeIn 0.5s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .card { background: white; border-radius: 16px; box-shadow: 0 2px 20px rgba(0,0,0,0.07); transition: transform 0.2s, box-shadow 0.2s; }
    .card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; border: none; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: ${COLORS.primary}; color: white; } .btn-primary:hover { background: ${COLORS.secondary}; }
    .btn-accent { background: ${COLORS.accent}; color: white; } .btn-accent:hover { background: #d4972e; }
    .btn-danger { background: ${COLORS.danger}; color: white; } .btn-danger:hover { background: #c0392b; }
    .btn-outline { background: transparent; color: ${COLORS.primary}; border: 2px solid ${COLORS.primary}; } .btn-outline:hover { background: ${COLORS.primary}; color: white; }
    .btn-sm { padding: 6px 14px; font-size: 13px; }
    input, textarea, select { width: 100%; padding: 10px 14px; border: 1.5px solid #dde3ec; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
    input:focus, textarea:focus, select:focus { border-color: ${COLORS.secondary}; box-shadow: 0 0 0 3px rgba(27,108,168,0.1); }
    label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; color: ${COLORS.text}; }
    .form-group { margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; } th { background: ${COLORS.light}; color: ${COLORS.primary}; font-weight: 600; padding: 12px 16px; text-align: left; font-size: 13px; } td { padding: 12px 16px; border-bottom: 1px solid #eef2f7; font-size: 14px; } tr:hover td { background: #fafbfd; }
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-emas { background: #fff3cd; color: #856404; } .badge-perak { background: #e9ecef; color: #495057; } .badge-perunggu { background: #f8d7c6; color: #7a3b0b; }
    .badge-nasional { background: #cce5ff; color: #004085; } .badge-internasional { background: #d4edda; color: #155724; } .badge-provinsi { background: #e2d9f3; color: #4a2c7a; } .badge-kota { background: #d1ecf1; color: #0c5460; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal { background: white; border-radius: 20px; padding: 32px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; }
    .section-title { font-family: 'Playfair Display', serif; font-size: 2rem; color: ${COLORS.primary}; margin-bottom: 8px; }
    .section-subtitle { color: ${COLORS.muted}; margin-bottom: 32px; }
  `}</style>
);

// ============================================================
// NAVBAR
// ============================================================
function Navbar({ page, setPage, auth }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { id: "home", label: "Beranda", icon: "home" },
    { id: "informasi", label: "Informasi", icon: "info" },
    { id: "kurikulum", label: "Kurikulum", icon: "book" },
    { id: "prestasi", label: "Prestasi", icon: "trophy" },
    { id: "media", label: "Galeri", icon: "image" },
    { id: "lokasi", label: "Lokasi", icon: "map" },
    { id: "kontak", label: "Kontak", icon: "phone" },
  ];
  return (
    <nav style={{ background: COLORS.primary, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,0.2)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setPage("home")}>
          <img
            src="/src/logo.png" // ganti dengan path logo kamu
            alt="Logo Sekolah"
            style={{
            width: 40,
            height: 40,
            borderRadius: "50%", // kalau mau tetap bulat
            objectFit: "cover"
  }}
/>
          <div>
            <div style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>SEKOLAH KU JAYA</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Sistem Informasi Sekolah</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="nav-desktop">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ background: page === item.id ? "rgba(255,255,255,0.15)" : "transparent", color: "white", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>
              {item.label}
            </button>
          ))}
          {auth.user ? (
            <button onClick={() => setPage("admin")} className="btn btn-accent btn-sm" style={{ marginLeft: 8 }}>
              <Icon name="settings" size={14} /> Admin
            </button>
          ) : (
            <button onClick={() => setPage("login")} className="btn btn-accent btn-sm" style={{ marginLeft: 8 }}>
              <Icon name="user" size={14} /> Login
            </button>
          )}
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "transparent", border: "none", color: "white", cursor: "pointer" }} className="nav-mobile">
          <Icon name={menuOpen ? "x" : "menu"} />
        </button>
      </div>
      <style>{`@media(max-width:768px){.nav-desktop{display:none!important}.nav-mobile{display:flex!important}}`}</style>
    </nav>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
function HomePage({ setPage }) {
  const [stats, setStats] = useState({ jumlahSiswa: 0, jumlahGuru: 0, akreditasi: '-', lulusanDiterima: 0, jumlahKelas: 0, tahunBerdiri: '-' });
  const [informasi, setInformasi] = useState([]);
  const [prestasi, setPrestasi] = useState([]);

  useEffect(() => {
    api("/statistik").then(setStats);
    api("/informasi").then(d => setInformasi(d.slice(0, 3)));
    api("/prestasi").then(d => setPrestasi(d.slice(0, 3)));
  }, []);

  return (
    <div className="fade-in">
      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.primary} 60%, ${COLORS.secondary} 100%)`, minHeight: 520, display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(232,168,56,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-block", background: "rgba(232,168,56,0.2)", color: COLORS.accent, padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20, border: "1px solid rgba(232,168,56,0.3)" }}>
                🏫 Sekolah Menengah Atas
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.5rem", color: "white", lineHeight: 1.15, marginBottom: 20 }}>
                SMA<br /><span style={{ color: COLORS.accent }}>Jalavadya</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                Membentuk generasi cerdas, berkarakter, dan berdaya saing global sejak 1990. Bersama kami, raih prestasi terbaik.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                <button className="btn btn-accent" style={{ fontSize: 15, padding: "12px 28px" }} onClick={() => setPage("informasi")}>Lihat Informasi</button>
                <button className="btn btn-outline" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)", fontSize: 15, padding: "12px 28px" }} onClick={() => setPage("kontak")}>Hubungi Kami</button>
              </div>
            </div>
            {stats && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Siswa Aktif", value: (stats.jumlahSiswa || 0).toLocaleString(), icon: "user", color: "#3498db" },
                  { label: "Tenaga Pengajar", value: stats.jumlahGuru, icon: "book", color: "#27ae60" },
                  { label: "Akreditasi", value: stats.akreditasi, icon: "star", color: COLORS.accent },
                  { label: "Lulusan Diterima PTN", value: `${stats.lulusanDiterima}%`, icon: "trophy", color: "#e74c3c" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ color: s.color, marginBottom: 8 }}><Icon name={s.icon} size={28} /></div>
                    <div style={{ color: "white", fontSize: "1.8rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
        {/* BERITA TERBARU */}
        <div style={{ marginBottom: 60 }}>
          <h2 className="section-title">Berita & Pengumuman</h2>
          <p className="section-subtitle">Informasi terkini dari SMA Jalavadya</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {informasi.map(item => (
              <div key={item.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: "inline-block", background: COLORS.light, color: COLORS.secondary, padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>{item.kategori}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: COLORS.dark, marginBottom: 10, lineHeight: 1.4 }}>{item.judul}</h3>
                <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6 }}>{item.isi.slice(0, 120)}...</p>
                <div style={{ marginTop: 16, fontSize: 12, color: COLORS.muted }}>{item.tanggal}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn btn-outline" onClick={() => setPage("informasi")}>Lihat Semua Informasi →</button>
          </div>
        </div>

        {/* PRESTASI */}
        <div style={{ background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.primary})`, borderRadius: 24, padding: "48px", marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "white", marginBottom: 8 }}>Prestasi Membanggakan</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>Kami bangga dengan pencapaian siswa-siswi terbaik kami</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {prestasi.map(p => (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 24 }}>{p.medali === "emas" ? "🥇" : p.medali === "perak" ? "🥈" : p.medali === "perunggu" ? "🥉" : "🏆"}</div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 14, lineHeight: 1.4 }}>{p.judul}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 6 }}>{p.peraih} • {p.tahun}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn btn-accent" onClick={() => setPage("prestasi")}>Lihat Semua Prestasi →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INFORMASI PAGE
// ============================================================
function InformasiPage() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("semua");
  useEffect(() => { api("/informasi").then(setData); }, []);
  const kategoriList = ["semua", ...new Set(data.map(d => d.kategori))];
  const filtered = filter === "semua" ? data : data.filter(d => d.kategori === filter);
  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <h1 className="section-title">Informasi Sekolah</h1>
      <p className="section-subtitle">Berita, pengumuman, dan artikel terbaru</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        {kategoriList.map(k => (
          <button key={k} onClick={() => setFilter(k)} className="btn btn-sm" style={{ background: filter === k ? COLORS.primary : "white", color: filter === k ? "white" : COLORS.text, border: `1.5px solid ${filter === k ? COLORS.primary : "#dde3ec"}`, textTransform: "capitalize" }}>{k}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ padding: 28 }}>
            <span style={{ background: COLORS.light, color: COLORS.secondary, padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{item.kategori}</span>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: "14px 0 10px", color: COLORS.dark, lineHeight: 1.4 }}>{item.judul}</h3>
            <p style={{ color: COLORS.muted, lineHeight: 1.7, fontSize: 14 }}>{item.isi}</p>
            <div style={{ marginTop: 16, fontSize: 12, color: COLORS.muted, borderTop: "1px solid #eef2f7", paddingTop: 12 }}>📅 {item.tanggal}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// KURIKULUM PAGE
// ============================================================
function KurikulumPage() {
  const [data, setData] = useState([]);
  useEffect(() => { api("/kurikulum").then(setData); }, []);
  return (
    <div className="fade-in" style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
      <h1 className="section-title">Dokumen Kurikulum</h1>
      <p className="section-subtitle">Unduh dokumen kurikulum dan silabus sekolah</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.map(item => (
          <div key={item.id} className="card" style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, background: COLORS.light, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary }}>
                <Icon name="book" size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: COLORS.dark }}>{item.namaDokumen}</div>
                <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>{item.deskripsi} • {item.tahun}</div>
              </div>
            </div>
            <a href={item.file ? `${BASE_URL}/uploads/${item.file}` : "#"} target="_blank" rel="noopener noreferrer" download className="btn btn-primary btn-sm" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="download" size={14} /> Unduh</a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PRESTASI PAGE
// ============================================================
function PrestasiPage() {
  const [data, setData] = useState([]);
  const [filterKat, setFilterKat] = useState("semua");
  const [filterTingkat, setFilterTingkat] = useState("semua");
  useEffect(() => { api("/prestasi").then(setData); }, []);
  const kategoriList = ["semua", ...new Set(data.map(d => d.kategori))];
  const tingkatList = ["semua", ...new Set(data.map(d => d.tingkat))];
  const filtered = data.filter(d => (filterKat === "semua" || d.kategori === filterKat) && (filterTingkat === "semua" || d.tingkat === filterTingkat));
  const medalEmoji = { emas: "🥇", perak: "🥈", perunggu: "🥉", penghargaan: "🏆" };
  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <h1 className="section-title">Prestasi Sekolah</h1>
      <p className="section-subtitle">Pencapaian membanggakan siswa dan sekolah kami</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: COLORS.muted, fontWeight: 500 }}>Kategori:</span>
          {kategoriList.map(k => <button key={k} onClick={() => setFilterKat(k)} className="btn btn-sm" style={{ background: filterKat === k ? COLORS.primary : "white", color: filterKat === k ? "white" : COLORS.text, border: `1.5px solid ${filterKat === k ? COLORS.primary : "#dde3ec"}`, textTransform: "capitalize" }}>{k}</button>)}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: COLORS.muted, fontWeight: 500 }}>Tingkat:</span>
          {tingkatList.map(t => <button key={t} onClick={() => setFilterTingkat(t)} className="btn btn-sm" style={{ background: filterTingkat === t ? COLORS.secondary : "white", color: filterTingkat === t ? "white" : COLORS.text, border: `1.5px solid ${filterTingkat === t ? COLORS.secondary : "#dde3ec"}`, textTransform: "capitalize" }}>{t}</button>)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <span style={{ fontSize: 40 }}>{medalEmoji[item.medali] || "🏆"}</span>
              <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end" }}>
                <span className={`badge badge-${item.tingkat}`} style={{ textTransform: "capitalize" }}>{item.tingkat}</span>
                <span style={{ fontSize: 12, color: COLORS.muted }}>{item.tahun}</span>
              </div>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.dark, marginBottom: 10, lineHeight: 1.4 }}>{item.judul}</h3>
            <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6 }}>{item.deskripsi}</p>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>👤 {item.peraih}</span>
              <span style={{ fontSize: 12, background: COLORS.light, color: COLORS.secondary, padding: "2px 10px", borderRadius: 20, textTransform: "capitalize" }}>{item.kategori}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MEDIA/GALERI PAGE
// ============================================================
function MediaPage() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { api("/media").then(setData); }, []);
  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <h1 className="section-title">Galeri Sekolah</h1>
      <p className="section-subtitle">Foto dan dokumentasi kegiatan SMA Jalavadya</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {data.map(item => {
          const imgSrc = item.url && item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`;
          return (
          <div key={item.id} className="card" style={{ overflow: "hidden", cursor: "pointer" }} onClick={() => setSelected(item)}>
            <div style={{ height: 200, overflow: "hidden" }}>
              <img src={imgSrc} alt={item.keterangan} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} onMouseOver={e => e.target.style.transform = "scale(1.05)"} onMouseOut={e => e.target.style.transform = "scale(1)"} onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = "#eef2f7"; }} />
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{item.keterangan}</p>
              <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{item.tanggal}</p>
            </div>
          </div>
          );
        })}
      </div>
      {selected && (() => {
        const selSrc = selected.url && selected.url.startsWith("http") ? selected.url : `${BASE_URL}${selected.url}`;
        return (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div style={{ maxWidth: 700, width: "100%", borderRadius: 20, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <img src={selSrc} alt={selected.keterangan} style={{ width: "100%", maxHeight: 500, objectFit: "cover" }} />
            <div style={{ background: "white", padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>{selected.keterangan}</h3>
              <p style={{ color: COLORS.muted, marginTop: 4 }}>{selected.tanggal}</p>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => setSelected(null)}>Tutup</button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// LOKASI PAGE
// ============================================================
function LokasiPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api("/lokasi").then(setData); }, []);
  if (!data) return <div style={{ padding: 48, textAlign: "center" }}>Memuat...</div>;
  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <h1 className="section-title">Lokasi Sekolah</h1>
      <p className="section-subtitle">Temukan kami di peta dan hubungi kami</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: COLORS.primary }}>Informasi Kontak</h3>
            {[
              { icon: "map", label: "Alamat", value: data.alamat },
              { icon: "phone", label: "Telepon", value: data.telepon },
              { icon: "mail", label: "Email", value: data.email },
              { icon: "info", label: "Jam Operasional", value: data.jamOperasional },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <div style={{ color: COLORS.primary, flexShrink: 0, marginTop: 2 }}><Icon name={item.icon} size={18} /></div>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ overflow: "hidden", minHeight: 400 }}>
          <iframe
            title="Peta Lokasi SMA Jalavadya"
            width="100%" height="100%"
            style={{ border: 0, minHeight: 400 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.longitude - 0.01},${data.latitude - 0.01},${data.longitude + 0.01},${data.latitude + 0.01}&layer=mapnik&marker=${data.latitude},${data.longitude}`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KONTAK PAGE
// ============================================================
function KontakPage() {
  const [form, setForm] = useState({ nama: "", email: "", telepon: "", pesan: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lokasi, setLokasi] = useState(null);
  useEffect(() => { api("/lokasi").then(setLokasi); }, []);
  const handleSubmit = async () => {
    if (!form.nama || !form.email || !form.pesan) return alert("Lengkapi semua field!");
    setLoading(true);
    await api("/kontak", { method: "POST", body: JSON.stringify(form) });
    setSuccess(true);
    setLoading(false);
    setForm({ nama: "", email: "", telepon: "", pesan: "" });
  };
  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <h1 className="section-title">Hubungi Kami</h1>
      <p className="section-subtitle">Kirim pesan kepada kami, kami akan segera merespon</p>
      {success ? (
        <div style={{ background: "#d4edda", color: "#155724", padding: 20, borderRadius: 12, textAlign: "center", fontSize: 16, marginBottom: 24 }}>
          ✅ Pesan Anda berhasil terkirim! Kami akan segera merespon.
          <div><button className="btn btn-sm btn-outline" style={{ marginTop: 12 }} onClick={() => setSuccess(false)}>Kirim Pesan Lagi</button></div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: COLORS.primary }}>Formulir Pesan</h3>
            <div className="form-group"><label>Nama Lengkap *</label><input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Masukkan nama Anda" /></div>
            <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
            <div className="form-group"><label>Telepon</label><input value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} placeholder="08xxxxxxxxxx" /></div>
            <div className="form-group"><label>Pesan *</label><textarea value={form.pesan} onChange={e => setForm({ ...form, pesan: e.target.value })} rows={5} placeholder="Tulis pesan Anda..." /></div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>{loading ? "Mengirim..." : "Kirim Pesan"}</button>
          </div>
          <div>
            {lokasi && (
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: COLORS.primary }}>Kontak Langsung</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", gap: 12 }}><Icon name="phone" size={18} color={COLORS.primary} /><div><div style={{ fontSize: 12, color: COLORS.muted }}>Telepon</div><div style={{ fontWeight: 500 }}>{lokasi.telepon}</div></div></div>
                  <div style={{ display: "flex", gap: 12 }}><Icon name="mail" size={18} /><div><div style={{ fontSize: 12, color: COLORS.muted }}>Email</div><div style={{ fontWeight: 500 }}>{lokasi.email}</div></div></div>
                  <div style={{ display: "flex", gap: 12 }}><Icon name="map" size={18} /><div><div style={{ fontSize: 12, color: COLORS.muted }}>Alamat</div><div style={{ fontWeight: 500 }}>{lokasi.alamat}</div></div></div>
                  <div style={{ display: "flex", gap: 12 }}><Icon name="info" size={18} /><div><div style={{ fontSize: 12, color: COLORS.muted }}>Jam Operasional</div><div style={{ fontWeight: 500 }}>{lokasi.jamOperasional}</div></div></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage({ auth, setPage }) {
  const [form, setForm] = useState({ email: "admin@jalavadya.sch.id", password: "admin123" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const res = await api("/auth/login", { method: "POST", body: JSON.stringify(form) });
      if (res.token) { auth.login(res.token, res.user); setPage("admin"); }
      else setError(res.error || "Login gagal");
    } catch { setError("Terjadi kesalahan, coba lagi"); }
    setLoading(false);
  };
  return (
    <div className="fade-in" style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.primary} 100%)`, padding: 24 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "white" }}><Icon name="user" size={28} /></div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: COLORS.dark }}>Login Admin</h2>
          <p style={{ color: COLORS.muted, marginTop: 6, fontSize: 14 }}>Masuk untuk mengelola data sekolah</p>
        </div>
        {error && <div style={{ background: "#fde8e8", color: COLORS.danger, padding: "10px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
        <button className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15, marginTop: 8 }} onClick={handleLogin} disabled={loading}>{loading ? "Memproses..." : "Masuk"}</button>
        <div style={{ marginTop: 16, padding: 14, background: "#f8f9fb", borderRadius: 10, fontSize: 13, color: COLORS.muted }}>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminPage({ auth, setPage }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  if (!auth.user) { setPage("login"); return null; }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "chart" },
    { id: "informasi", label: "Informasi", icon: "info" },
    { id: "kurikulum", label: "Kurikulum", icon: "book" },
    { id: "prestasi", label: "Prestasi", icon: "trophy" },
    { id: "media", label: "Media", icon: "image" },
    { id: "statistik", label: "Statistik", icon: "chart" },
    { id: "kontak", label: "Pesan", icon: "mail" },
    { id: "laporan", label: "Laporan", icon: "download" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      {/* SIDEBAR */}
      <div style={{ width: 220, background: COLORS.dark, flexShrink: 0, padding: "24px 0" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{auth.user.nama}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{auth.user.email}</div>
        </div>
        <nav style={{ padding: "16px 0" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 20px", background: activeTab === t.id ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === t.id ? "white" : "rgba(255,255,255,0.6)", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", borderLeft: activeTab === t.id ? `3px solid ${COLORS.accent}` : "3px solid transparent", transition: "all 0.2s" }}>
              <Icon name={t.icon} size={16} />{t.label}
            </button>
          ))}
          <button onClick={() => { auth.logout(); setPage("home"); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 20px", background: "transparent", color: "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", marginTop: 24, borderLeft: "3px solid transparent" }}>
            <Icon name="logout" size={16} /> Keluar
          </button>
        </nav>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: 32, overflowY: "auto", background: "#f8f9fb" }}>
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "informasi" && <AdminInformasi />}
        {activeTab === "kurikulum" && <AdminKurikulum />}
        {activeTab === "prestasi" && <AdminPrestasi />}
        {activeTab === "media" && <AdminMedia />}
        {activeTab === "statistik" && <AdminStatistik />}
        {activeTab === "kontak" && <AdminKontak />}
        {activeTab === "laporan" && <AdminLaporan />}
      </div>
    </div>
  );
}

// ---- ADMIN DASHBOARD ----
function AdminDashboard() {
  const [stats, setStats] = useState({ jumlahSiswa: 0, jumlahGuru: 0, akreditasi: '-', lulusanDiterima: 0, jumlahKelas: 0, tahunBerdiri: '-' });
  const [counts, setCounts] = useState({});
  useEffect(() => {
    api("/statistik").then(setStats);
    Promise.all([api("/informasi"), api("/prestasi"), api("/media"), api("/kurikulum")]).then(([i, p, m, k]) =>
      setCounts({ informasi: i.length, prestasi: p.length, media: m.length, kurikulum: k.length })
    );
  }, []);
  return (
    <div className="fade-in">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: COLORS.dark, marginBottom: 8 }}>Dashboard Admin</h2>
      <p style={{ color: COLORS.muted, marginBottom: 32 }}>Kelola seluruh konten dan data SMA Jalavadya</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
        {[
          { label: "Total Informasi", value: counts.informasi, icon: "info", color: "#3498db" },
          { label: "Total Prestasi", value: counts.prestasi, icon: "trophy", color: COLORS.accent },
          { label: "Media/Foto", value: counts.media, icon: "image", color: "#27ae60" },
          { label: "Dokumen Kurikulum", value: counts.kurikulum, icon: "book", color: "#9b59b6" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div style={{ color: s.color, marginBottom: 12 }}><Icon name={s.icon} size={28} /></div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: COLORS.dark }}>{s.value ?? "..."}</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {stats && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 20, color: COLORS.primary }}>Data Statistik Sekolah</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              ["Jumlah Siswa", stats.jumlahSiswa],
              ["Jumlah Guru", stats.jumlahGuru],
              ["Jumlah Kelas", stats.jumlahKelas],
              ["Akreditasi", stats.akreditasi],
              ["Tahun Berdiri", stats.tahunBerdiri],
              ["Lulusan PTN", `${stats.lulusanDiterima}%`],
            ].map(([label, val], i) => (
              <div key={i} style={{ background: "#f8f9fb", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{label}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: COLORS.primary, marginTop: 4 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- REUSABLE TABLE ADMIN ----
function AdminTable({ title, icon, data, columns, onAdd, onEdit, onDelete, loading }) {
  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: COLORS.dark }}>{title}</h2>
        </div>
        <button className="btn btn-primary" onClick={onAdd}><Icon name="plus" size={16} /> Tambah</button>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Aksi</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 1} style={{ textAlign: "center", padding: 32, color: COLORS.muted }}>Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={columns.length + 1} style={{ textAlign: "center", padding: 32, color: COLORS.muted }}>Belum ada data</td></tr>
              ) : data.map(row => (
                <tr key={row.id}>
                  {columns.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      {onEdit && <button className="btn btn-outline btn-sm" onClick={() => onEdit(row)}><Icon name="edit" size={13} /></button>}
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(row.id)}><Icon name="trash" size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- ADMIN INFORMASI ----
function AdminInformasi() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ judul: "", isi: "", kategori: "berita" });
  const [editing, setEditing] = useState(null);
  const load = () => api("/informasi").then(setData);
  useEffect(() => { load(); }, []);
  const handleSave = async () => {
    if (editing) await api(`/informasi/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
    else await api("/informasi", { method: "POST", body: JSON.stringify(form) });
    load(); setModal(false); setForm({ judul: "", isi: "", kategori: "berita" }); setEditing(null);
  };
  const handleEdit = (row) => { setEditing(row); setForm({ judul: row.judul, isi: row.isi, kategori: row.kategori }); setModal(true); };
  const handleDelete = async (id) => { if (confirm("Hapus data ini?")) { await api(`/informasi/${id}`, { method: "DELETE" }); load(); } };
  return (
    <>
      <AdminTable title="Kelola Informasi" data={data} columns={[
        { key: "judul", label: "Judul" },
        { key: "kategori", label: "Kategori", render: v => <span style={{ background: COLORS.light, color: COLORS.secondary, padding: "2px 10px", borderRadius: 20, fontSize: 12 }}>{v}</span> },
        { key: "tanggal", label: "Tanggal" },
      ]} onAdd={() => { setEditing(null); setForm({ judul: "", isi: "", kategori: "berita" }); setModal(true); }} onEdit={handleEdit} onDelete={handleDelete} />
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ fontWeight: 600, marginBottom: 24 }}>{editing ? "Edit" : "Tambah"} Informasi</h3>
            <div className="form-group"><label>Judul</label><input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} /></div>
            <div className="form-group"><label>Kategori</label><select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}><option value="berita">Berita</option><option value="pengumuman">Pengumuman</option><option value="program">Program</option><option value="kegiatan">Kegiatan</option></select></div>
            <div className="form-group"><label>Isi</label><textarea value={form.isi} onChange={e => setForm({ ...form, isi: e.target.value })} rows={5} /></div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---- ADMIN KURIKULUM ----
function AdminKurikulum() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ namaDokumen: "", deskripsi: "", tahun: "2024" });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const load = () => api("/kurikulum").then(setData);
  useEffect(() => { load(); }, []);
  const handleSave = async () => {
    if (!pdfFile) { alert("Pilih file PDF terlebih dahulu"); return; }
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("namaDokumen", form.namaDokumen);
      formData.append("deskripsi", form.deskripsi);
      formData.append("tahun", form.tahun);
      await fetch(`${API}/kurikulum`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      load(); setModal(false); setForm({ namaDokumen: "", deskripsi: "", tahun: "2024" }); setPdfFile(null);
    } finally { setUploading(false); }
  };
  const handleDelete = async (id) => { if (confirm("Hapus?")) { await api(`/kurikulum/${id}`, { method: "DELETE" }); load(); } };
  return (
    <>
      <AdminTable title="Kelola Kurikulum" data={data} columns={[
        { key: "namaDokumen", label: "Nama Dokumen" },
        { key: "deskripsi", label: "Deskripsi" },
        { key: "tahun", label: "Tahun" },
      ]} onAdd={() => { setModal(true); setPdfFile(null); }} onDelete={handleDelete} />
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ fontWeight: 600, marginBottom: 24 }}>Tambah Dokumen Kurikulum</h3>
            <div className="form-group"><label>Nama Dokumen</label><input value={form.namaDokumen} onChange={e => setForm({ ...form, namaDokumen: e.target.value })} /></div>
            <div className="form-group"><label>Deskripsi</label><textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} rows={3} /></div>
            <div className="form-group"><label>Tahun</label><input value={form.tahun} onChange={e => setForm({ ...form, tahun: e.target.value })} /></div>
            <div className="form-group">
              <label>File PDF</label>
              <input type="file" accept=".pdf,application/pdf" onChange={e => setPdfFile(e.target.files[0] || null)} style={{ padding: "6px 0" }} />
              {pdfFile && <div style={{ fontSize: 12, color: "#27ae60", marginTop: 4 }}>✓ {pdfFile.name}</div>}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={uploading}>{uploading ? "Mengunggah..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---- ADMIN PRESTASI ----
function AdminPrestasi() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { judul: "", deskripsi: "", kategori: "akademik", tingkat: "kota", tahun: "2024", peraih: "", medali: "emas" };
  const [form, setForm] = useState(emptyForm);
  const load = () => api("/prestasi").then(setData);
  useEffect(() => { load(); }, []);
  const handleSave = async () => {
    if (editing) await api(`/prestasi/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
    else await api("/prestasi", { method: "POST", body: JSON.stringify(form) });
    load(); setModal(false); setForm(emptyForm); setEditing(null);
  };
  const handleEdit = row => { setEditing(row); setForm({ judul: row.judul, deskripsi: row.deskripsi, kategori: row.kategori, tingkat: row.tingkat, tahun: row.tahun, peraih: row.peraih, medali: row.medali }); setModal(true); };
  const handleDelete = async (id) => { if (confirm("Hapus?")) { await api(`/prestasi/${id}`, { method: "DELETE" }); load(); } };
  const medalEmoji = { emas: "🥇", perak: "🥈", perunggu: "🥉", penghargaan: "🏆" };
  return (
    <>
      <AdminTable title="Kelola Prestasi" data={data} columns={[
        { key: "medali", label: "Medali", render: v => <span>{medalEmoji[v] || "🏆"}</span> },
        { key: "judul", label: "Judul" },
        { key: "tingkat", label: "Tingkat", render: v => <span className={`badge badge-${v}`} style={{ textTransform: "capitalize" }}>{v}</span> },
        { key: "tahun", label: "Tahun" },
      ]} onAdd={() => { setEditing(null); setForm(emptyForm); setModal(true); }} onEdit={handleEdit} onDelete={handleDelete} />
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ fontWeight: 600, marginBottom: 24 }}>{editing ? "Edit" : "Tambah"} Prestasi</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group" style={{ gridColumn: "1/-1" }}><label>Judul Prestasi</label><input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} /></div>
              <div className="form-group"><label>Kategori</label><select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>{["akademik", "teknologi", "olahraga", "seni", "bahasa", "lingkungan"].map(k => <option key={k} value={k}>{k}</option>)}</select></div>
              <div className="form-group"><label>Tingkat</label><select value={form.tingkat} onChange={e => setForm({ ...form, tingkat: e.target.value })}>{["kota", "provinsi", "nasional", "internasional"].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="form-group"><label>Tahun</label><input value={form.tahun} onChange={e => setForm({ ...form, tahun: e.target.value })} /></div>
              <div className="form-group"><label>Medali</label><select value={form.medali} onChange={e => setForm({ ...form, medali: e.target.value })}>{["emas", "perak", "perunggu", "penghargaan"].map(m => <option key={m} value={m}>{m}</option>)}</select></div>
              <div className="form-group" style={{ gridColumn: "1/-1" }}><label>Peraih</label><input value={form.peraih} onChange={e => setForm({ ...form, peraih: e.target.value })} /></div>
              <div className="form-group" style={{ gridColumn: "1/-1" }}><label>Deskripsi</label><textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} rows={3} /></div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---- ADMIN MEDIA ----
function AdminMedia() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ keterangan: "", tipe: "foto" });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const load = () => api("/media").then(setData);
  useEffect(() => { load(); }, []);
  const handleSave = async () => {
    if (!imageFile) { alert("Pilih file gambar terlebih dahulu"); return; }
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("keterangan", form.keterangan);
      formData.append("tipe", form.tipe);
      formData.append("namaFile", form.keterangan.replace(/\s+/g, "_"));
      await fetch(`${API}/media`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      load(); setModal(false); setForm({ keterangan: "", tipe: "foto" }); setImageFile(null);
    } finally { setUploading(false); }
  };
  const handleDelete = async (id) => { if (confirm("Hapus?")) { await api(`/media/${id}`, { method: "DELETE" }); load(); } };
  return (
    <>
      <AdminTable title="Kelola Media & Foto" data={data} columns={[
        { key: "url", label: "Preview", render: (v) => { const src = v && v.startsWith("http") ? v : `${BASE_URL}${v}`; return <img src={src} style={{ width: 60, height: 45, objectFit: "cover", borderRadius: 6 }} onError={e => { e.target.style.display = "none"; }} />; } },
        { key: "keterangan", label: "Keterangan" },
        { key: "tipe", label: "Tipe" },
        { key: "tanggal", label: "Tanggal" },
      ]} onAdd={() => { setModal(true); setImageFile(null); }} onDelete={handleDelete} />
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ fontWeight: 600, marginBottom: 24 }}>Tambah Media</h3>
            <div className="form-group"><label>Keterangan</label><input value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} /></div>
            <div className="form-group">
              <label>File Gambar</label>
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" onChange={e => setImageFile(e.target.files[0] || null)} style={{ padding: "6px 0" }} />
              {imageFile && (
                <div style={{ marginTop: 8 }}>
                  <img src={URL.createObjectURL(imageFile)} alt="preview" style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
                  <div style={{ fontSize: 12, color: "#27ae60", marginTop: 4 }}>✓ {imageFile.name}</div>
                </div>
              )}
            </div>
            <div className="form-group"><label>Tipe</label><select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })}><option value="foto">Foto</option><option value="video">Video</option></select></div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={uploading}>{uploading ? "Mengunggah..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---- ADMIN STATISTIK ----
function AdminStatistik() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { api("/statistik").then(setForm); }, []);
  const handleSave = async () => {
    await api("/statistik", { method: "PUT", body: JSON.stringify(form) });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  if (!form) return <div>Memuat...</div>;
  return (
    <div className="fade-in">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: COLORS.dark, marginBottom: 24 }}>Kelola Data Statistik</h2>
      <div className="card" style={{ padding: 32, maxWidth: 600 }}>
        {[["jumlahSiswa", "Jumlah Siswa"], ["jumlahGuru", "Jumlah Guru"], ["jumlahKelas", "Jumlah Kelas"], ["tahunBerdiri", "Tahun Berdiri"], ["akreditasi", "Akreditasi"], ["lulusanDiterima", "% Lulusan Diterima PTN"]].map(([key, label]) => (
          <div className="form-group" key={key}>
            <label>{label}</label>
            <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
          </div>
        ))}
        <button className="btn btn-primary" onClick={handleSave}>{saved ? "✅ Tersimpan!" : "Simpan Perubahan"}</button>
      </div>
    </div>
  );
}

// ---- ADMIN KONTAK ----
function AdminKontak() {
  const [data, setData] = useState([]);
  useEffect(() => { api("/kontak").then(setData); }, []);
  const handleStatus = async (id, status) => {
    await api(`/kontak/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    api("/kontak").then(setData);
  };
  const handleDelete = async (id) => { if (confirm("Hapus?")) { await api(`/kontak/${id}`, { method: "DELETE" }); api("/kontak").then(setData); } };
  return (
    <div className="fade-in">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: COLORS.dark, marginBottom: 24 }}>Pesan Masuk</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.map(item => (
          <div key={item.id} className="card" style={{ padding: 24, borderLeft: `4px solid ${item.status === "belum_dibalas" ? COLORS.danger : COLORS.success}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{item.nama}</div>
                <div style={{ color: COLORS.muted, fontSize: 13 }}>{item.email} • {item.telepon}</div>
                <div style={{ marginTop: 10, fontSize: 14 }}>{item.pesan}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: COLORS.muted }}>{item.tanggal}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <span style={{ background: item.status === "belum_dibalas" ? "#fde8e8" : "#d4edda", color: item.status === "belum_dibalas" ? COLORS.danger : COLORS.success, padding: "3px 12px", borderRadius: 20, fontSize: 12 }}>{item.status === "belum_dibalas" ? "Belum Dibalas" : "Sudah Dibalas"}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleStatus(item.id, item.status === "belum_dibalas" ? "sudah_dibalas" : "belum_dibalas")}>{item.status === "belum_dibalas" ? "Tandai Dibalas" : "Tandai Belum"}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}><Icon name="trash" size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- ADMIN TEMA ----
function AdminTema() {
  const [form, setForm] = useState({ warna: COLORS.primary, layout: "default" });
  const [saved, setSaved] = useState(false);
  useEffect(() => { api("/tema").then(setForm); }, []);
  const handleSave = async () => {
    await api("/tema", { method: "PUT", body: JSON.stringify(form) });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const colorOptions = [{ label: "Biru Tua (Default)", value: "#0f4c75" }, { label: "Hijau Emerald", value: "#1a6b4a" }, { label: "Merah Marun", value: "#7b1c1c" }, { label: "Ungu", value: "#4a235a" }, { label: "Biru Langit", value: "#1565c0" }];
  return (
    <div className="fade-in">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: COLORS.dark, marginBottom: 24 }}>Ubah Tema Tampilan</h2>
      <div className="card" style={{ padding: 32, maxWidth: 500 }}>
        <div className="form-group">
          <label>Warna Utama</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {colorOptions.map(opt => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontWeight: 400 }}>
                <input type="radio" name="warna" value={opt.value} checked={form.warna === opt.value} onChange={e => setForm({ ...form, warna: e.target.value })} style={{ width: "auto" }} />
                <div style={{ width: 24, height: 24, borderRadius: 6, background: opt.value }} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Layout</label>
          <select value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>
            <option value="default">Default</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>{saved ? "✅ Tema Disimpan!" : "Simpan Tema"}</button>
      </div>
    </div>
  );
}

// ---- ADMIN LAPORAN ----
function AdminLaporan() {
  const handleExport = async (type) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/laporan/export/${type}`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = type === "pdf" ? "laporan_jalavadya.txt" : "laporan_jalavadya.csv";
    a.click();
  };
  return (
    <div className="fade-in">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: COLORS.dark, marginBottom: 24 }}>Ekspor Laporan</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {[
          { title: "Laporan PDF", desc: "Ekspor laporan lengkap data sekolah dalam format teks/PDF", type: "pdf", icon: "download", color: "#e74c3c" },
          { title: "Laporan Excel/CSV", desc: "Ekspor data informasi dan statistik dalam format CSV/Excel", type: "excel", icon: "download", color: "#27ae60" },
        ].map(item => (
          <div key={item.type} className="card" style={{ padding: 28 }}>
            <div style={{ color: item.color, marginBottom: 12 }}><Icon name={item.icon} size={32} /></div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
            <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{item.desc}</p>
            <button className="btn btn-primary" onClick={() => handleExport(item.type)}><Icon name="download" size={14} /> Unduh {item.type.toUpperCase()}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer({ setPage }) {
  return (
    <footer style={{ background: COLORS.dark, color: "rgba(255,255,255,0.7)", padding: "48px 24px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "white", marginBottom: 12 }}>SMA Jalavadya</div>
            <p style={{ lineHeight: 1.7, fontSize: 14 }}>Sekolah Menengah Atas Jalavadya berkomitmen untuk menghasilkan lulusan yang cerdas, berkarakter, dan berdaya saing global.</p>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 600, marginBottom: 16 }}>Menu</div>
            {["home", "informasi", "kurikulum", "prestasi", "media", "lokasi", "kontak"].map(p => (
              <div key={p} onClick={() => setPage(p)} style={{ cursor: "pointer", marginBottom: 8, fontSize: 14, textTransform: "capitalize" }}>{p}</div>
            ))}
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 600, marginBottom: 16 }}>Kontak</div>
            <div style={{ fontSize: 14, lineHeight: 2 }}>
              <div>📍 Jl. Pendidikan No. 42, Bandung</div>
              <div>📞 (022) 1234-5678</div>
              <div>✉️ info@jalavadya.sch.id</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, textAlign: "center", fontSize: 13 }}>
          © 2024 SMA Jalavadya. Sistem Informasi Sekolah.
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// AUTH PROVIDER
// ============================================================
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api("/auth/me").then(u => { if (u.id) setUser(u); else localStorage.removeItem("token"); }).catch(() => localStorage.removeItem("token"));
    }
  }, []);
  const login = (token, userData) => { localStorage.setItem("token", token); setUser(userData); };
  const logout = () => { localStorage.removeItem("token"); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [page, setPage] = useState("home");
  const auth = useContext(AuthContext);

  const pages = { home: <HomePage setPage={setPage} />, informasi: <InformasiPage />, kurikulum: <KurikulumPage />, prestasi: <PrestasiPage />, media: <MediaPage />, lokasi: <LokasiPage />, kontak: <KontakPage />, login: <LoginPage auth={auth} setPage={setPage} />, admin: <AdminPage auth={auth} setPage={setPage} /> };

  return (
    <>
      <GlobalStyles />
      <Navbar page={page} setPage={setPage} auth={auth} />
      {pages[page] || <HomePage setPage={setPage} />}
      {!["login", "admin"].includes(page) && <Footer setPage={setPage} />}
    </>
  );
}

// Wrap with AuthProvider at root
const RootApp = () => <AuthProvider><App /></AuthProvider>;
export { RootApp };
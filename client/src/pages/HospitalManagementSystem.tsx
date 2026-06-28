import React, { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Admin {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  passwordHash: string;
  registeredAt: string;
  lastLogin: string | null;
}

interface Patient {
  id: string;
  name: string;
  age: number | string;
  gender: string;
  phone: string;
  email: string;
  bloodType: string;
  address: string;
  registered: string;
  condition: string;
  status: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  experience: number | string;
  schedule: string;
  status: string;
  patients: number;
  rating: number;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
}

interface BillItem {
  desc: string;
  amount: number | string;
}

interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: BillItem[];
  total: number;
  paid: number;
  status: string;
  method: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  vitals: {
    bp: string;
    hr: string;
    temp: string;
    weight: string;
  };
}

interface AuditLogEntry {
  time: string;
  msg: string;
  admin: string;
  type: string;
}

// ─── Auth Storage (in-memory) ─────────────────────────────────────────────────
const ADMIN_STORE_KEY = "medcore_admins";
const SESSION_KEY = "medcore_session";

const getAdmins = (): Admin[] => {
  try { return JSON.parse(sessionStorage.getItem(ADMIN_STORE_KEY) || "[]"); } catch { return []; }
};
const saveAdmins = (list: Admin[]) => sessionStorage.setItem(ADMIN_STORE_KEY, JSON.stringify(list));
const getSession = (): Admin | null => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } };
const saveSession = (admin: Admin) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(admin));
const clearSession = () => sessionStorage.removeItem(SESSION_KEY);

const hashPass = (pw: string) => {
  const salted = pw + "_medcore_salt";
  const encoded = new TextEncoder().encode(salted);
  return btoa(String.fromCharCode(...Array.from(encoded)));
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const INITIAL_PATIENTS: Patient[] = [
  { id: "P001", name: "Eleanor Voss", age: 54, gender: "Female", phone: "555-0101", email: "e.voss@email.com", bloodType: "A+", address: "12 Oak Lane, Springfield", registered: "2024-01-15", condition: "Hypertension", status: "Active" },
  { id: "P002", name: "Marcus Webb", age: 32, gender: "Male", phone: "555-0102", email: "m.webb@email.com", bloodType: "O-", address: "45 Elm St, Riverside", registered: "2024-02-20", condition: "Diabetes Type 2", status: "Active" },
  { id: "P003", name: "Priya Anand", age: 28, gender: "Female", phone: "555-0103", email: "p.anand@email.com", bloodType: "B+", address: "88 Maple Ave, Lakewood", registered: "2024-03-05", condition: "Asthma", status: "Discharged" },
  { id: "P004", name: "James Okafor", age: 67, gender: "Male", phone: "555-0104", email: "j.okafor@email.com", bloodType: "AB+", address: "3 Birch Rd, Hillcrest", registered: "2024-03-18", condition: "Cardiac Arrhythmia", status: "Critical" },
  { id: "P005", name: "Sofia Reyes", age: 41, gender: "Female", phone: "555-0105", email: "s.reyes@email.com", bloodType: "A-", address: "22 Cedar Blvd, Westview", registered: "2024-04-02", condition: "Migraine", status: "Active" },
];
const INITIAL_DOCTORS: Doctor[] = [
  { id: "D001", name: "Dr. Nathan Clarke", specialty: "Cardiology", phone: "555-0201", email: "n.clarke@hospital.com", experience: 18, schedule: "Mon-Fri", status: "Available", patients: 24, rating: 4.9 },
  { id: "D002", name: "Dr. Aisha Patel", specialty: "Neurology", phone: "555-0202", email: "a.patel@hospital.com", experience: 12, schedule: "Tue-Sat", status: "Busy", patients: 31, rating: 4.8 },
  { id: "D003", name: "Dr. Lorenzo Bianchi", specialty: "Orthopedics", phone: "555-0203", email: "l.bianchi@hospital.com", experience: 22, schedule: "Mon-Thu", status: "Available", patients: 19, rating: 4.7 },
  { id: "D004", name: "Dr. Yuki Tanaka", specialty: "Pediatrics", phone: "555-0204", email: "y.tanaka@hospital.com", experience: 9, schedule: "Wed-Sun", status: "On Leave", patients: 42, rating: 4.9 },
  { id: "D005", name: "Dr. Olivia Grant", specialty: "General Medicine", phone: "555-0205", email: "o.grant@hospital.com", experience: 15, schedule: "Mon-Fri", status: "Available", patients: 56, rating: 4.6 },
];
const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: "A001", patientId: "P001", patientName: "Eleanor Voss", doctorId: "D001", doctorName: "Dr. Nathan Clarke", date: "2026-07-01", time: "09:00", type: "Follow-up", status: "Confirmed", notes: "Blood pressure review" },
  { id: "A002", patientId: "P002", patientName: "Marcus Webb", doctorId: "D005", doctorName: "Dr. Olivia Grant", date: "2026-07-01", time: "10:30", type: "Consultation", status: "Pending", notes: "HbA1c results review" },
  { id: "A003", patientId: "P004", patientName: "James Okafor", doctorId: "D001", doctorName: "Dr. Nathan Clarke", date: "2026-07-02", time: "08:00", type: "Emergency", status: "Confirmed", notes: "Arrhythmia monitoring" },
  { id: "A004", patientId: "P005", patientName: "Sofia Reyes", doctorId: "D002", doctorName: "Dr. Aisha Patel", date: "2026-07-03", time: "14:00", type: "Consultation", status: "Confirmed", notes: "MRI follow-up" },
  { id: "A005", patientId: "P003", patientName: "Priya Anand", doctorId: "D005", doctorName: "Dr. Olivia Grant", date: "2026-07-04", time: "11:00", type: "Check-up", status: "Cancelled", notes: "Routine spirometry" },
];
const INITIAL_BILLS: Bill[] = [
  { id: "B001", patientId: "P001", patientName: "Eleanor Voss", date: "2026-06-15", items: [{ desc: "Consultation", amount: 150 }, { desc: "ECG Test", amount: 80 }, { desc: "Medication", amount: 45 }], total: 275, paid: 275, status: "Paid", method: "Card" },
  { id: "B002", patientId: "P002", patientName: "Marcus Webb", date: "2026-06-20", items: [{ desc: "Consultation", amount: 120 }, { desc: "Blood Test", amount: 65 }], total: 185, paid: 100, status: "Partial", method: "Cash" },
  { id: "B003", patientId: "P004", patientName: "James Okafor", date: "2026-06-25", items: [{ desc: "Emergency Fee", amount: 500 }, { desc: "ICU (1 day)", amount: 1200 }, { desc: "Medications", amount: 320 }], total: 2020, paid: 0, status: "Unpaid", method: "-" },
  { id: "B004", patientId: "P005", patientName: "Sofia Reyes", date: "2026-06-28", items: [{ desc: "Consultation", amount: 150 }, { desc: "MRI Scan", amount: 650 }], total: 800, paid: 800, status: "Paid", method: "Insurance" },
];
const INITIAL_RECORDS: MedicalRecord[] = [
  { id: "R001", patientId: "P001", patientName: "Eleanor Voss", date: "2026-06-15", doctor: "Dr. Nathan Clarke", diagnosis: "Hypertension Stage 2", prescription: "Amlodipine 5mg, Lisinopril 10mg", notes: "BP: 155/95. Advised low-sodium diet and 30 min daily walk.", vitals: { bp: "155/95", hr: "78", temp: "36.8", weight: "72kg" } },
  { id: "R002", patientId: "P002", patientName: "Marcus Webb", date: "2026-06-20", doctor: "Dr. Olivia Grant", diagnosis: "Type 2 Diabetes", prescription: "Metformin 500mg BD, Insulin Glargine 10u nocte", notes: "HbA1c: 8.2%. Referred to dietitian. Follow-up in 4 weeks.", vitals: { bp: "130/85", hr: "82", temp: "36.6", weight: "91kg" } },
  { id: "R003", patientId: "P004", patientName: "James Okafor", date: "2026-06-25", doctor: "Dr. Nathan Clarke", diagnosis: "Atrial Fibrillation", prescription: "Warfarin 5mg, Bisoprolol 2.5mg, Digoxin 0.25mg", notes: "INR: 2.4. Holter monitor applied. Echocardiogram scheduled.", vitals: { bp: "140/90", hr: "105 (irregular)", temp: "36.9", weight: "83kg" } },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const genId = (prefix: string, list: any[]) => `${prefix}${String(list.length + 1).padStart(3, "0")}`;
const today = () => new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

// ─── Shared UI ────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700", Discharged: "bg-slate-100 text-slate-600",
    Critical: "bg-red-100 text-red-700", Available: "bg-emerald-100 text-emerald-700",
    Busy: "bg-amber-100 text-amber-700", "On Leave": "bg-slate-100 text-slate-500",
    Confirmed: "bg-sky-100 text-sky-700", Pending: "bg-amber-100 text-amber-700",
    Cancelled: "bg-red-100 text-red-600", Paid: "bg-emerald-100 text-emerald-700",
    Partial: "bg-amber-100 text-amber-700", Unpaid: "bg-red-100 text-red-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
};

const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,22,40,0.6)", backdropFilter: "blur(2px)" }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
      </div>
      <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent" {...props} />
  </div>
);

const Select = ({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400" {...props}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ─── Auth Screens ─────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }: { onLogin: (admin: Admin) => void }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ fullName: "", email: "", role: "Administrator", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleRegister = () => {
    setError(""); setSuccess("");
    if (!form.fullName.trim()) return setError("Full name is required.");
    if (!form.email.includes("@")) return setError("Enter a valid email address.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    const admins = getAdmins();
    if (admins.find(a => a.email === form.email.toLowerCase())) return setError("An account with this email already exists.");
    const newAdmin: Admin = {
      id: `ADM${String(admins.length + 1).padStart(3, "0")}`,
      fullName: form.fullName.trim(),
      email: form.email.toLowerCase(),
      role: form.role,
      phone: form.phone,
      passwordHash: hashPass(form.password),
      registeredAt: new Date().toISOString(),
      lastLogin: null,
    };
    saveAdmins([...admins, newAdmin]);
    setSuccess("Account created! You can now log in.");
    setMode("login");
    setForm(p => ({ ...p, password: "", confirm: "", fullName: "", phone: "" }));
  };

  const handleLogin = () => {
    setError(""); setLoading(true);
    setTimeout(() => {
      const admins = getAdmins();
      const admin = admins.find(a => a.email === form.email.toLowerCase() && a.passwordHash === hashPass(form.password));
      if (!admin) { setError("Invalid email or password."); setLoading(false); return; }
      const updated = admins.map(a => a.id === admin.id ? { ...a, lastLogin: new Date().toISOString() } : a);
      saveAdmins(updated);
      const loggedIn = { ...admin, lastLogin: new Date().toISOString() };
      saveSession(loggedIn);
      setLoading(false);
      onLogin(loggedIn);
    }, 600);
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") mode === "login" ? handleLogin() : handleRegister(); };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A1628 0%, #0F2345 50%, #0A1628 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: 16 }}>
      <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(14,165,233,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(16,185,129,0.04)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#0EA5E9,#0284C7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px", boxShadow: "0 8px 32px rgba(14,165,233,0.3)" }}>🏥</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>MedCore HMS</div>
          <div style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>Hospital Management System</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
                flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#0A1628" : "#94A3B8",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s",
              }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ color: "#DC2626", fontSize: 13 }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <span style={{ color: "#16A34A", fontSize: 13 }}>{success}</span>
            </div>
          )}

          {mode === "login" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email Address</label>
                <input value={form.email} onChange={f("email")} onKeyDown={handleKey} type="email" placeholder="admin@hospital.com"
                  style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input value={form.password} onChange={f("password")} onKeyDown={handleKey} type={showPw ? "text" : "password"} placeholder="Enter your password"
                    style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 44px 10px 14px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }} />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}>{showPw ? "🙈" : "👁"}</button>
                </div>
              </div>
              <button onClick={handleLogin} disabled={loading} style={{
                width: "100%", padding: "12px 0", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "#93C5FD" : "linear-gradient(135deg,#0EA5E9,#0284C7)",
                color: "#fff", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(14,165,233,0.3)", transition: "all 0.2s",
              }}>
                {loading ? "Signing in…" : "Sign In to Dashboard"}
              </button>
              <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#9CA3AF" }}>
                No account?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} style={{ background: "none", border: "none", color: "#0EA5E9", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Register here</button>
              </p>
            </div>
          )}

          {mode === "register" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Full Name</label>
                  <input value={form.fullName} onChange={f("fullName")} placeholder="Dr. Jane Smith"
                    style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email Address</label>
                  <input value={form.email} onChange={f("email")} type="email" placeholder="admin@hospital.com"
                    style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Role</label>
                  <select value={form.role} onChange={f("role")}
                    style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box", background: "#fff" }}>
                    {["Administrator", "Senior Admin", "Records Officer", "Billing Officer", "System Admin"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Phone (optional)</label>
                  <input value={form.phone} onChange={f("phone")} placeholder="011 000 0000"
                    style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input value={form.password} onChange={f("password")} type={showPw ? "text" : "password"} placeholder="Min. 6 characters"
                      style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 40px 10px 14px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }} />
                    <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#9CA3AF" }}>{showPw ? "🙈" : "👁"}</button>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Confirm Password</label>
                  <input value={form.confirm} onChange={f("confirm")} onKeyDown={handleKey} type={showPw ? "text" : "password"} placeholder="Repeat password"
                    style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              {form.password && (
                <div style={{ marginBottom: 16, marginTop: 4 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => {
                      const strength = form.password.length >= 10 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password) ? 4
                        : form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 3
                        : form.password.length >= 6 ? 2 : 1;
                      const colors = ["#EF4444","#F59E0B","#0EA5E9","#10B981"];
                      return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? colors[strength-1] : "#E5E7EB", transition: "background 0.3s" }} />;
                    })}
                  </div>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>
                    {form.password.length < 6 ? "Too short" : form.password.length < 8 ? "Weak — add uppercase & numbers" : form.password.length < 10 ? "Fair — add symbols for better security" : "Strong password"}
                  </span>
                </div>
              )}

              <button onClick={handleRegister} style={{
                width: "100%", padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#10B981,#059669)",
                color: "#fff", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(16,185,129,0.3)", marginTop: 4,
              }}>
                Create Admin Account
              </button>
              <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#9CA3AF" }}>
                Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: "#0EA5E9", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Sign in</button>
              </p>
            </div>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: 20, color: "#334155", fontSize: 12 }}>
          🔒 Secure admin portal — authorised personnel only
        </p>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ patients, doctors, appointments, bills, auditLog }: { patients: Patient[]; doctors: Doctor[]; appointments: Appointment[]; bills: Bill[]; auditLog: AuditLogEntry[] }) => {
  const revenue = bills.reduce((s, b) => s + b.paid, 0);
  const pending = bills.filter(b => b.status !== "Paid").reduce((s, b) => s + (b.total - b.paid), 0);
  const todayAppts = appointments.filter(a => a.date === "2026-07-01").length;
  const stats = [
    { label: "Total Patients", value: patients.length, icon: "👥", color: "#0EA5E9", bg: "#E0F2FE" },
    { label: "Doctors on Staff", value: doctors.length, icon: "🩺", color: "#10B981", bg: "#D1FAE5" },
    { label: "Today's Appointments", value: todayAppts, icon: "📅", color: "#8B5CF6", bg: "#EDE9FE" },
    { label: "Revenue Collected", value: `R${revenue.toLocaleString()}`, icon: "💰", color: "#F59E0B", bg: "#FEF3C7" },
  ];
  const typeColor: Record<string, string> = { "check-in": "#0EA5E9", appt: "#8B5CF6", bill: "#F59E0B", record: "#10B981", doctor: "#EF4444", auth: "#8B5CF6", patient: "#0EA5E9" };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Sunday, 28 June 2026 — Good morning, Administrator</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>Live</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4">Billing Overview</h3>
          {[{ label: "Collected", val: revenue, color: "#10B981" }, { label: "Outstanding", val: pending, color: "#EF4444" }].map(item => (
            <div key={item.label} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-semibold" style={{ color: item.color }}>R{item.val.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(item.val / (revenue + pending || 1)) * 100}%`, background: item.color }} />
              </div>
            </div>
          ))}
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-sm">
            <span className="text-slate-500">Total Billed</span>
            <span className="font-bold text-slate-800">R{(revenue + pending).toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4">Doctor Availability</h3>
          {doctors.map(d => (
            <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <div className="text-sm font-semibold text-slate-700">{d.name}</div>
                <div className="text-xs text-slate-400">{d.specialty}</div>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100" style={{ gridColumn: "1/-1" }}>
          <h3 className="font-bold text-slate-700 mb-4">Audit Log — Recent Activity</h3>
          <div>
            {auditLog.length === 0 && <p className="text-slate-400 text-sm">No activity recorded yet.</p>}
            {[...auditLog].reverse().slice(0, 10).map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: typeColor[a.type] || "#ccc" }} />
                <span className="text-xs text-slate-400 w-14 flex-shrink-0">{a.time}</span>
                <span className="text-sm text-slate-600 flex-1">{a.msg}</span>
                <span className="text-xs text-slate-300">{a.admin}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Patients ─────────────────────────────────────────────────────────────────
const Patients = ({ patients, setPatients, addLog }: { patients: Patient[]; setPatients: React.Dispatch<React.SetStateAction<Patient[]>>; addLog: (m: string, t: string) => void }) => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ name: "", age: "", gender: "Male", phone: "", email: "", bloodType: "A+", address: "", condition: "", status: "Active" });
  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search));
  const handleAdd = () => {
    const newP: Patient = { ...form, id: genId("P", patients), registered: today() };
    setPatients([...patients, newP]);
    addLog(`Patient registered: ${form.name}`, "patient");
    setShowModal(false);
    setForm({ name: "", age: "", gender: "Male", phone: "", email: "", bloodType: "A+", address: "", condition: "", status: "Active" });
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold text-slate-800">Patient Registry</h2><p className="text-slate-500 text-sm mt-1">{patients.length} registered patients</p></div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow" style={{ background: "#0EA5E9" }}>+ Register Patient</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID…" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">{["ID","Name","Age","Blood","Condition","Registered","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(p=>(
              <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.id}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-600">{p.age}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-bold">{p.bloodType}</span></td>
                <td className="px-4 py-3 text-slate-600">{p.condition}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{p.registered}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3"><button onClick={()=>setViewPatient(p)} className="text-sky-500 hover:text-sky-700 text-xs font-semibold">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<div className="text-center py-12 text-slate-400">No patients found.</div>}
      </div>
      {showModal&&<Modal title="Register New Patient" onClose={()=>setShowModal(false)}>
        <Input label="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Age" type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} />
          <Select label="Gender" value={form.gender} options={["Male","Female","Other"]} onChange={e=>setForm({...form,gender:e.target.value})} />
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <Select label="Blood Type" value={form.bloodType} options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]} onChange={e=>setForm({...form,bloodType:e.target.value})} />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <Input label="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
        <Input label="Primary Condition" value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})} />
        <button onClick={handleAdd} className="w-full py-2.5 rounded-xl text-white font-semibold" style={{background:"#0EA5E9"}}>Register Patient</button>
      </Modal>}
      {viewPatient&&<Modal title={`Patient: ${viewPatient.name}`} onClose={()=>setViewPatient(null)}>
        <div className="space-y-3">
          {[["Patient ID",viewPatient.id],["Age / Gender",`${viewPatient.age} / ${viewPatient.gender}`],["Phone",viewPatient.phone],["Email",viewPatient.email],["Blood Type",viewPatient.bloodType],["Address",viewPatient.address],["Primary Condition",viewPatient.condition],["Registered",viewPatient.registered]].map(([k,v])=>(
            <div key={k} className="flex justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-500">{k}</span><span className="text-sm font-semibold text-slate-800">{v}</span></div>
          ))}
          <div className="flex justify-between items-center py-2"><span className="text-sm text-slate-500">Status</span><StatusBadge status={viewPatient.status} /></div>
        </div>
      </Modal>}
    </div>
  );
};

// ─── Doctors ──────────────────────────────────────────────────────────────────
const Doctors = ({ doctors, setDoctors, addLog }: { doctors: Doctor[]; setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>; addLog: (m: string, t: string) => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", specialty: "General Medicine", phone: "", email: "", experience: "", schedule: "Mon-Fri", status: "Available" });
  const handleAdd = () => {
    const newD: Doctor = { ...form, id: genId("D", doctors), patients: 0, rating: 5.0 };
    setDoctors([...doctors, newD]);
    addLog(`Doctor added: ${form.name}`, "doctor");
    setShowModal(false);
    setForm({ name: "", specialty: "General Medicine", phone: "", email: "", experience: "", schedule: "Mon-Fri", status: "Available" });
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold text-slate-800">Medical Staff</h2><p className="text-slate-500 text-sm mt-1">{doctors.length} active practitioners</p></div>
        <button onClick={()=>setShowModal(true)} className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow" style={{background:"#10B981"}}>+ Add Doctor</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:16}}>
        {doctors.map(d=>(
          <div key={d.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl">👨‍⚕️</div>
              <StatusBadge status={d.status} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{d.name}</h3>
            <p className="text-sky-600 text-sm font-medium mb-4">{d.specialty}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div><div className="text-xs text-slate-400 uppercase">Experience</div><div className="text-sm font-bold text-slate-700">{d.experience} yrs</div></div>
              <div><div className="text-xs text-slate-400 uppercase">Rating</div><div className="text-sm font-bold text-slate-700">⭐ {d.rating}</div></div>
              <div><div className="text-xs text-slate-400 uppercase">Schedule</div><div className="text-sm font-bold text-slate-700">{d.schedule}</div></div>
              <div><div className="text-xs text-slate-400 uppercase">Patients</div><div className="text-sm font-bold text-slate-700">{d.patients}</div></div>
            </div>
          </div>
        ))}
      </div>
      {showModal&&<Modal title="Add New Doctor" onClose={()=>setShowModal(false)}>
        <Input label="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <Select label="Specialty" value={form.specialty} options={["General Medicine","Cardiology","Neurology","Orthopedics","Pediatrics","Dermatology","Psychiatry"]} onChange={e=>setForm({...form,specialty:e.target.value})} />
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <Input label="Experience (years)" type="number" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <Select label="Schedule" value={form.schedule} options={["Mon-Fri","Tue-Sat","Wed-Sun","Mon-Thu","Weekends"]} onChange={e=>setForm({...form,schedule:e.target.value})} />
        <button onClick={handleAdd} className="w-full py-2.5 rounded-xl text-white font-semibold" style={{background:"#10B981"}}>Add Doctor</button>
      </Modal>}
    </div>
  );
};

// ─── Appointments ─────────────────────────────────────────────────────────────
const Appointments = ({ appointments, setAppointments, patients, doctors, addLog }: { appointments: Appointment[]; setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>; patients: Patient[]; doctors: Doctor[]; addLog: (m: string, t: string) => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ patientId: patients[0]?.id||"", doctorId: doctors[0]?.id||"", date: today(), time: "09:00", type: "Consultation", notes: "" });
  const statuses = ["All","Confirmed","Pending","Cancelled"];
  const filtered = appointments.filter(a=>filter==="All"||a.status===filter);
  const typeColors: Record<string, string> = {"Emergency":"#EF4444","Consultation":"#8B5CF6","Follow-up":"#0EA5E9","Check-up":"#10B981"};
  const handleAdd = () => {
    const p = patients.find(x=>x.id===form.patientId);
    const d = doctors.find(x=>x.id===form.doctorId);
    const newA: Appointment = { ...form, id: genId("A", appointments), patientName: p?.name || "", doctorName: d?.name || "", status: "Pending" };
    setAppointments([...appointments, newA]);
    addLog(`Appointment booked: ${p?.name} → ${d?.name} on ${form.date}`, "appt");
    setShowModal(false);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold text-slate-800">Appointments</h2><p className="text-slate-500 text-sm mt-1">{appointments.length} total appointments</p></div>
        <button onClick={()=>setShowModal(true)} className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow" style={{background:"#8B5CF6"}}>+ Book Appointment</button>
      </div>
      <div className="flex gap-2 mb-4">
        {statuses.map(s=><button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter===s?"text-white shadow":"bg-white text-slate-500 border border-slate-200"}`} style={filter===s?{background:"#0A1628"}:{}}>{s}</button>)}
      </div>
      <div className="space-y-3">
        {filtered.map(a=>(
          <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-1 h-14 rounded-full flex-shrink-0" style={{background:typeColors[a.type]||"#ccc"}} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><span className="font-bold text-slate-800 text-sm">{a.patientName}</span><span className="text-slate-400 text-xs">→</span><span className="text-sky-600 text-sm font-medium">{a.doctorName}</span></div>
              <div className="text-xs text-slate-400">{a.notes}</div>
            </div>
            <div className="text-center flex-shrink-0"><div className="text-sm font-bold text-slate-700">{a.date}</div><div className="text-xs text-slate-400">{a.time}</div></div>
            <div className="flex-shrink-0"><span className="text-xs px-2 py-0.5 rounded-full font-semibold mr-2" style={{background:typeColors[a.type]+"20",color:typeColors[a.type]}}>{a.type}</span></div>
            <StatusBadge status={a.status} />
          </div>
        ))}
        {filtered.length===0&&<div className="text-center py-12 text-slate-400 bg-white rounded-2xl">No appointments found.</div>}
      </div>
      {showModal&&<Modal title="Book Appointment" onClose={()=>setShowModal(false)}>
        <div className="mb-4"><label className="block text-sm font-medium text-slate-600 mb-1">Patient</label>
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})}>
            {patients.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
          </select>
        </div>
        <div className="mb-4"><label className="block text-sm font-medium text-slate-600 mb-1">Doctor</label>
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})}>
            {doctors.map(d=><option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Date" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
          <Input label="Time" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} />
        </div>
        <Select label="Appointment Type" value={form.type} options={["Consultation","Follow-up","Check-up","Emergency"]} onChange={e=>setForm({...form,type:e.target.value})} />
        <div className="mb-4"><label className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
          <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
        </div>
        <button onClick={handleAdd} className="w-full py-2.5 rounded-xl text-white font-semibold" style={{background:"#8B5CF6"}}>Book Appointment</button>
      </Modal>}
    </div>
  );
};

// ─── Billing ──────────────────────────────────────────────────────────────────
const Billing = ({ bills, setBills, patients, addLog }: { bills: Bill[]; setBills: React.Dispatch<React.SetStateAction<Bill[]>>; patients: Patient[]; addLog: (m: string, t: string) => void }) => {
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{ patientId: string; items: BillItem[]; method: string }>({ patientId: patients[0]?.id||"", items: [{desc:"",amount:""}], method: "Card" });
  const addItem = () => setForm({...form,items:[...form.items,{desc:"",amount:""}]});
  const updateItem = (i: number, k: keyof BillItem, v: string) => { const items=[...form.items]; (items[i] as any)[k]=v; setForm({...form,items}); };
  const handleCreate = () => {
    const p = patients.find(x=>x.id===form.patientId);
    const total = form.items.reduce((s,i)=>s+(parseFloat(i.amount as string)||0),0);
    const newB: Bill = {
      id: genId("B", bills),
      patientId: form.patientId,
      patientName: p?.name || "",
      date: today(),
      items: form.items.map(it => ({ ...it, amount: parseFloat(it.amount as string) || 0 })),
      total,
      paid: 0,
      status: "Unpaid",
      method: form.method
    };
    setBills([...bills, newB]);
    addLog(`Invoice created for ${p?.name} — R${total.toLocaleString()}`, "bill");
    setShowModal(false);
    setForm({patientId:patients[0]?.id||"",items:[{desc:"",amount:""}],method:"Card"});
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold text-slate-800">Billing & Invoices</h2><p className="text-slate-500 text-sm mt-1">{bills.length} invoices</p></div>
        <button onClick={()=>setShowModal(true)} className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow" style={{background:"#F59E0B"}}>+ Create Invoice</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">{["Invoice","Patient","Date","Total","Paid","Balance","Method","Status",""].map(h=><th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {bills.map(b=>(
              <tr key={b.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{b.id}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{b.patientName}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{b.date}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">R{b.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">R{b.paid.toLocaleString()}</td>
                <td className="px-4 py-3 text-red-500 font-medium">R{(b.total-b.paid).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{b.method}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3"><button onClick={()=>setViewBill(b)} className="text-sky-500 hover:text-sky-700 text-xs font-semibold">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal&&<Modal title="Create Invoice" onClose={()=>setShowModal(false)}>
        <div className="mb-4"><label className="block text-sm font-medium text-slate-600 mb-1">Patient</label>
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})}>
            {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="mb-3"><label className="block text-sm font-medium text-slate-600 mb-2">Line Items</label>
          {form.items.map((item,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,marginBottom:8}}>
              <input placeholder="Description" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" value={item.desc} onChange={e=>updateItem(i,"desc",e.target.value)} />
              <input placeholder="R" type="number" className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-sky-400" value={item.amount as string} onChange={e=>updateItem(i,"amount",e.target.value)} />
            </div>
          ))}
          <button onClick={addItem} className="text-sky-500 text-sm font-medium">+ Add Item</button>
        </div>
        <Select label="Payment Method" value={form.method} options={["Card","Cash","Insurance","Bank Transfer"]} onChange={e=>setForm({...form,method:e.target.value})} />
        <div className="flex justify-between items-center py-3 border-t border-slate-100 mb-4">
          <span className="font-semibold text-slate-700">Total</span>
          <span className="text-lg font-bold text-slate-800">R{form.items.reduce((s,i)=>s+(parseFloat(i.amount as string)||0),0).toLocaleString()}</span>
        </div>
        <button onClick={handleCreate} className="w-full py-2.5 rounded-xl text-white font-semibold" style={{background:"#F59E0B"}}>Create Invoice</button>
      </Modal>}
      {viewBill&&<Modal title={`Invoice ${viewBill.id}`} onClose={()=>setViewBill(null)}>
        <div className="mb-4">
          <div className="flex justify-between mb-1"><span className="text-slate-500 text-sm">Patient</span><span className="font-semibold text-slate-800">{viewBill.patientName}</span></div>
          <div className="flex justify-between mb-1"><span className="text-slate-500 text-sm">Date</span><span className="font-semibold text-slate-800">{viewBill.date}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 text-sm">Method</span><span className="font-semibold text-slate-800">{viewBill.method}</span></div>
        </div>
        <div className="border border-slate-100 rounded-xl overflow-hidden mb-4">
          <div className="bg-slate-50 px-4 py-2 text-xs text-slate-500 uppercase font-semibold flex justify-between"><span>Description</span><span>Amount</span></div>
          {viewBill.items.map((item,i)=>(
            <div key={i} className="px-4 py-2.5 flex justify-between border-t border-slate-50 text-sm">
              <span className="text-slate-700">{item.desc}</span>
              <span className="font-medium text-slate-800">R{(item.amount as number).toLocaleString()}</span>
            </div>
          ))}
          <div className="px-4 py-3 bg-slate-50 flex justify-between font-bold text-slate-800 border-t border-slate-200">
            <span>Total</span><span>R{viewBill.total.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <StatusBadge status={viewBill.status} />
          <span className="text-sm text-emerald-600 font-semibold">Paid: R{viewBill.paid.toLocaleString()}</span>
        </div>
      </Modal>}
    </div>
  );
};

// ─── Medical Records ──────────────────────────────────────────────────────────
const Records = ({ records, setRecords, patients, doctors, addLog }: { records: MedicalRecord[]; setRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>; patients: Patient[]; doctors: Doctor[]; addLog: (m: string, t: string) => void }) => {
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: patients[0]?.id||"", doctorId: doctors[0]?.id||"", diagnosis: "", prescription: "", notes: "", vitals: {bp:"",hr:"",temp:"",weight:""} });
  const handleAdd = () => {
    const p = patients.find(x=>x.id===form.patientId);
    const d = doctors.find(x=>x.id===form.doctorId);
    const newR: MedicalRecord = {
      id: genId("R", records),
      patientId: form.patientId,
      patientName: p?.name || "",
      date: today(),
      doctor: d?.name || "",
      diagnosis: form.diagnosis,
      prescription: form.prescription,
      notes: form.notes,
      vitals: form.vitals
    };
    setRecords([...records, newR]);
    addLog(`Medical record created: ${p?.name} — ${form.diagnosis}`, "record");
    setShowModal(false);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold text-slate-800">Medical Records</h2><p className="text-slate-500 text-sm mt-1">{records.length} records on file</p></div>
        <button onClick={()=>setShowModal(true)} className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow" style={{background:"#0A1628"}}>+ New Record</button>
      </div>
      <div className="space-y-3">
        {records.map(r=>(
          <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1"><span className="font-bold text-slate-800">{r.patientName}</span><span className="font-mono text-xs text-slate-400">#{r.id}</span></div>
                <p className="text-sky-600 font-semibold text-sm">{r.diagnosis}</p>
                <p className="text-slate-500 text-xs mt-1">{r.doctor} · {r.date}</p>
              </div>
              <button onClick={()=>setViewRecord(r)} className="text-sky-500 hover:text-sky-700 text-sm font-semibold">View Record</button>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-50 flex gap-6">
              {Object.entries(r.vitals).map(([k,v])=>(
                <div key={k} className="text-center"><div className="text-xs text-slate-400 uppercase">{k}</div><div className="text-sm font-semibold text-slate-700">{v}</div></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showModal&&<Modal title="New Medical Record" onClose={()=>setShowModal(false)}>
        <div className="mb-4"><label className="block text-sm font-medium text-slate-600 mb-1">Patient</label>
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})}>
            {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="mb-4"><label className="block text-sm font-medium text-slate-600 mb-1">Doctor</label>
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})}>
            {doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <Input label="Diagnosis" value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})} />
        <div className="mb-4"><label className="block text-sm font-medium text-slate-600 mb-1">Prescription</label>
          <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" rows={2} value={form.prescription} onChange={e=>setForm({...form,prescription:e.target.value})} />
        </div>
        <label className="block text-sm font-medium text-slate-600 mb-2">Vitals</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {(["bp","hr","temp","weight"] as const).map(k=><Input key={k} label={k.toUpperCase()} value={form.vitals[k]} onChange={e=>setForm({...form,vitals:{...form.vitals,[k]:e.target.value}})} />)}
        </div>
        <div className="mb-4"><label className="block text-sm font-medium text-slate-600 mb-1">Clinical Notes</label>
          <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
        </div>
        <button onClick={handleAdd} className="w-full py-2.5 rounded-xl text-white font-semibold" style={{background:"#0A1628"}}>Save Record</button>
      </Modal>}
      {viewRecord&&<Modal title={`Medical Record — ${viewRecord.id}`} onClose={()=>setViewRecord(null)}>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-500">Patient</span><span className="font-semibold text-slate-800">{viewRecord.patientName}</span></div>
          <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-500">Doctor</span><span className="font-semibold text-slate-800">{viewRecord.doctor}</span></div>
          <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-500">Date</span><span className="font-semibold text-slate-800">{viewRecord.date}</span></div>
          <div className="py-2 border-b border-slate-50"><span className="text-sm text-slate-500 block mb-1">Diagnosis</span><span className="font-semibold text-sky-700">{viewRecord.diagnosis}</span></div>
          <div className="py-2 border-b border-slate-50"><span className="text-sm text-slate-500 block mb-1">Prescription</span><span className="text-sm text-slate-700">{viewRecord.prescription}</span></div>
          <div className="py-2 border-b border-slate-50"><span className="text-sm text-slate-500 block mb-2">Vitals</span>
            <div className="flex gap-4">
              {Object.entries(viewRecord.vitals).map(([k,v])=>(
                <div key={k} className="bg-slate-50 rounded-lg px-3 py-2 text-center"><div className="text-xs text-slate-400 uppercase">{k}</div><div className="text-sm font-bold text-slate-700">{v}</div></div>
              ))}
            </div>
          </div>
          <div className="py-2"><span className="text-sm text-slate-500 block mb-1">Clinical Notes</span><p className="text-sm text-slate-700">{viewRecord.notes}</p></div>
        </div>
      </Modal>}
    </div>
  );
};

// ─── Admin Management ─────────────────────────────────────────────────────────
const AdminManagement = ({ currentAdmin, addLog }: { currentAdmin: Admin; addLog: (m: string, t: string) => void }) => {
  const [admins, setAdmins] = useState(getAdmins());
  const roleColor: Record<string, string> = { Administrator: "#0EA5E9", "Senior Admin": "#8B5CF6", "Records Officer": "#10B981", "Billing Officer": "#F59E0B", "System Admin": "#EF4444" };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Admin Accounts</h2>
        <p className="text-slate-500 text-sm mt-1">{admins.length} registered administrator{admins.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">{["ID","Name","Email","Role","Phone","Registered","Last Login"].map(h=><th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {admins.map(a=>(
              <tr key={a.id} className={`border-t border-slate-50 hover:bg-slate-50 transition-colors ${a.id===currentAdmin.id?"bg-sky-50":""}`}>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.id}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{a.fullName}</div>
                  {a.id===currentAdmin.id&&<span className="text-xs text-sky-500 font-medium">● You</span>}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{a.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:(roleColor[a.role]||"#64748B")+"18",color:roleColor[a.role]||"#64748B"}}>{a.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{a.phone||"—"}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{a.registeredAt ? new Date(a.registeredAt).toLocaleDateString("en-ZA") : "—"}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{a.lastLogin ? new Date(a.lastLogin).toLocaleString("en-ZA") : "First session"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins.length===0&&<div className="text-center py-12 text-slate-400">No admins registered yet.</div>}
      </div>
    </div>
  );
};

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "◈", color: "#0EA5E9" },
  { id: "patients", label: "Patients", icon: "👥", color: "#0EA5E9" },
  { id: "doctors", label: "Doctors", icon: "🩺", color: "#10B981" },
  { id: "appointments", label: "Appointments", icon: "📅", color: "#8B5CF6" },
  { id: "billing", label: "Billing", icon: "💳", color: "#F59E0B" },
  { id: "records", label: "Medical Records", icon: "📋", color: "#64748B" },
  { id: "admins", label: "Admin Accounts", icon: "🔐", color: "#EF4444" },
];

// ─── Main App (authenticated) ─────────────────────────────────────────────────
const MainApp = ({ admin, onLogout }: { admin: Admin; onLogout: () => void }) => {
  const [page, setPage] = useState("dashboard");
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
    { time: "09:00", msg: `Admin session started`, admin: admin.fullName, type: "auth" },
  ]);

  const addLog = (msg: string, type = "record") => {
    setAuditLog(prev => [...prev, { time: nowTime(), msg, admin: admin.fullName, type }]);
  };

  const handleLogout = () => {
    addLog("Admin signed out", "auth");
    clearSession();
    onLogout();
  };

  const current = NAV.find(n => n.id === page);
  const initials = admin.fullName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <aside style={{ width: 240, background: "#0A1628", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0EA5E9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏥</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px" }}>MedCore</div>
              <div style={{ color: "#64748B", fontSize: 11 }}>Hospital System</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px 8px" }}>Navigation</div>
          {NAV.map(n => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 2, textAlign: "left",
                background: active ? "rgba(14,165,233,0.12)" : "transparent",
                borderLeft: active ? `3px solid ${n.color}` : "3px solid transparent",
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{n.icon}</span>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#fff" : "#94A3B8" }}>{n.label}</span>
                {n.id === "patients" && <span style={{ marginLeft: "auto", background: "#0EA5E920", color: "#0EA5E9", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8 }}>{patients.length}</span>}
                {n.id === "appointments" && <span style={{ marginLeft: "auto", background: "#8B5CF620", color: "#8B5CF6", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8 }}>{appointments.filter(a=>a.status==="Pending").length}</span>}
                {n.id === "admins" && <span style={{ marginLeft: "auto", background: "#EF444420", color: "#EF4444", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8 }}>{getAdmins().length}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#0EA5E9,#0284C7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{admin.fullName}</div>
              <div style={{ color: "#475569", fontSize: 10 }}>{admin.role}</div>
            </div>
            <button onClick={handleLogout} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: 16, flexShrink: 0, padding: 2 }}>⏻</button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{current?.icon}</span>
            <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{current?.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "#F0FDF4", color: "#166534", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
              🟢 Signed in as {admin.fullName}
            </div>
            <div style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>⚠ {appointments.filter(a=>a.status==="Pending").length} Pending</div>
            <div style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>🔴 {patients.filter(p=>p.status==="Critical").length} Critical</div>
            <button onClick={handleLogout} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Sign Out</button>
          </div>
        </header>
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {page==="dashboard"&&<Dashboard patients={patients} doctors={doctors} appointments={appointments} bills={bills} auditLog={auditLog} />}
          {page==="patients"&&<Patients patients={patients} setPatients={setPatients} addLog={addLog} />}
          {page==="doctors"&&<Doctors doctors={doctors} setDoctors={setDoctors} addLog={addLog} />}
          {page==="appointments"&&<Appointments appointments={appointments} setAppointments={setAppointments} patients={patients} doctors={doctors} addLog={addLog} />}
          {page==="billing"&&<Billing bills={bills} setBills={setBills} patients={patients} addLog={addLog} />}
          {page==="records"&&<Records records={records} setRecords={setRecords} patients={patients} doctors={doctors} addLog={addLog} />}
          {page==="admins"&&<AdminManagement currentAdmin={admin} addLog={addLog} />}
        </div>
      </main>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [admin, setAdmin] = useState<Admin | null>(() => getSession());

  const handleLogin = (a: Admin) => setAdmin(a);
  const handleLogout = () => setAdmin(null);

  if (!admin) return <AuthScreen onLogin={handleLogin} />;
  return <MainApp admin={admin} onLogout={handleLogout} />;
}

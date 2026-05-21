import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const BLUE = "#1b75bb";
const GREEN = "#7eb842";
const LIGHT_BLUE = "#e8f3fb";
const LIGHT_GREEN = "#f0f9e8";
const BORDER = "#e0e7ef";
const MUTED = "#7a90a8";
const TEXT = "#1a2533";
const BG = "#f5f7fa";
const WHITE = "#ffffff";

// ── HOOK ──
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

// ── ICONS ──
const Icons = {
  Home: ({size=24})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Building: ({size=24})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9"/></svg>,
  Key: ({size=24})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  Heart: ({size=24})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Briefcase: ({size=24})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  Layers: ({size=24})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Grid: ({size=24})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Sparkle: ({size=24})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  Bed: ({size=22})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M2 4v16"/><path d="M2 8h18a2 2 0 012 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
  Bath: ({size=22})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M9 6L6.5 3.5a1.5 1.5 0 00-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 002 2h12a2 2 0 002-2v-5"/><line x1="3" y1="13" x2="21" y2="13"/></svg>,
  Oven: ({size=28})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="2" y="3" width="20" height="18" rx="2"/><rect x="6" y="8" width="12" height="9" rx="1"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="10" y1="6" x2="10" y2="6"/><line x1="14" y1="6" x2="14" y2="6"/><line x1="18" y1="6" x2="18" y2="6"/></svg>,
  Fridge: ({size=28})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="9" y1="6" x2="9" y2="8"/><line x1="9" y1="14" x2="9" y2="18"/></svg>,
  Window: ({size=28})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  Cabinet: ({size=28})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/><circle cx="9" cy="8" r="1" fill="currentColor"/><circle cx="9" cy="17" r="1" fill="currentColor"/></svg>,
  DeepClean: ({size=28})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Balcony: ({size=28})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M3 9l9-7 9 7"/><path d="M3 9v12h18V9"/><line x1="12" y1="22" x2="12" y2="9"/><line x1="7" y1="22" x2="7" y2="14"/><line x1="17" y1="22" x2="17" y2="14"/><line x1="3" y1="14" x2="21" y2="14"/></svg>,
  Laundry: ({size=28})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="13" r="4"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="10" y1="6" x2="10" y2="6"/></svg>,
  Walls: ({size=28})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="16" y2="21"/><line x1="2" y1="9" x2="8" y2="9"/><line x1="16" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="8" y2="15"/><line x1="16" y1="15" x2="22" y2="15"/></svg>,
  Calendar: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  MapPin: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  CreditCard: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Check: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><polyline points="20 6 9 17 4 12"/></svg>,
  Star: ({size=14})=><svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Phone: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.14a16 16 0 006.95 6.95l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Tag: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Trash: ({size=14})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Edit: ({size=14})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Plus: ({size=14})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  User: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Lock: ({size=36})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Shield: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  ChevronRight: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronLeft: ({size=16})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><polyline points="15 18 9 12 15 6"/></svg>,
  Menu: ({size=22})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X: ({size=22})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ClipboardList: ({size=20})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  DollarSign: ({size=20})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Users: ({size=20})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
};

const SERVICES = [
  { id:"house", name:"House Cleaning", Icon:Icons.Home, base:119, hasRooms:true },
  { id:"commercial", name:"Commercial", Icon:Icons.Building, base:149, hasRooms:false },
  { id:"lease", name:"End of Lease", Icon:Icons.Key, base:199, hasRooms:true },
  { id:"ndis", name:"NDIS Cleaning", Icon:Icons.Heart, base:99, hasRooms:true },
  { id:"office", name:"Office Cleaning", Icon:Icons.Briefcase, base:139, hasRooms:false },
  { id:"carpet", name:"Carpet Cleaning", Icon:Icons.Layers, base:89, hasRooms:false },
  { id:"strata", name:"Strata Cleaning", Icon:Icons.Grid, base:129, hasRooms:false },
  { id:"deep", name:"Deep Clean", Icon:Icons.Sparkle, base:179, hasRooms:true },
];

const EXTRAS = [
  { id:"oven", name:"Oven Cleaning", Icon:Icons.Oven, price:65 },
  { id:"fridge", name:"Fridge Cleaning", Icon:Icons.Fridge, price:50 },
  { id:"windows", name:"Interior Windows", Icon:Icons.Window, price:79 },
  { id:"cabinets", name:"Inside Cabinets", Icon:Icons.Cabinet, price:40 },
  { id:"deepclean", name:"Deep Clean", Icon:Icons.DeepClean, price:159 },
  { id:"balcony", name:"Balcony Cleaning", Icon:Icons.Balcony, price:45 },
  { id:"laundry", name:"Laundry", Icon:Icons.Laundry, price:35 },
  { id:"walls", name:"Wall Washing", Icon:Icons.Walls, price:55 },
];

const FREQS = [
  { id:"once", label:"One Time", disc:0 },
  { id:"weekly", label:"Every Week", disc:10 },
  { id:"fortnightly", label:"Every 2 Weeks", disc:10 },
  { id:"monthly", label:"Every 4 Weeks", disc:5 },
];

const TIME_SLOTS = ["7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const SUPER_ADMIN = {
  id: "super",
  name: "Ron_admin",
  email: "ron.web108@gmail.com",
  password: "Ron@!two3@#",
  role: "superadmin",
};

const DEF_ADMINS = [];

// Helper to check super admin
// eslint-disable-next-line no-unused-vars
function isSuperAdminUser(u) {
  return u && u.role === "superadmin" && u.id === "super";
}

function checkSuperAdmin(u) {
  return !!(u && u.role === "superadmin" && u.id === "super");
}
  return u && u.role === "superadmin" && u.id === "super";
}

const DEF_COUPONS = [
  { code:"YAHWEH10", disc:10, active:true },
  { code:"YPC10", disc:10, active:true },
  { code:"WELCOME15", disc:15, active:true },
  { code:"NDIS20", disc:20, active:true },
];

const DEF_CLIENTS = [
  { id:"c1", name:"Sarah Mitchell", email:"sarah@example.com", password:"pass123", phone:"0411111111" },
  { id:"c2", name:"James Lee", email:"james@example.com", password:"pass123", phone:"0422222222" },
];

const DEF_BOOKINGS = [
  { id:"YPC1001", clientId:"c1", clientName:"Sarah Mitchell", clientEmail:"sarah@example.com", service:"House Cleaning", date:"2026-05-25", time:"9:00 AM", address:"12 Rose St, Blacktown NSW 2148", total:107.10, status:"Confirmed", freq:"Weekly", extras:[] },
  { id:"YPC1002", clientId:"c1", clientName:"Sarah Mitchell", clientEmail:"sarah@example.com", service:"Carpet Cleaning", date:"2026-04-10", time:"10:00 AM", address:"12 Rose St, Blacktown NSW 2148", total:89.00, status:"Completed", freq:"One Time", extras:["Oven Cleaning"] },
  { id:"YPC1003", clientId:"c2", clientName:"James Lee", clientEmail:"james@example.com", service:"Office Cleaning", date:"2026-05-28", time:"8:00 AM", address:"45 Market St, Sydney NSW 2000", total:139.00, status:"Pending", freq:"Fortnightly", extras:[] },
  { id:"YPC1004", clientId:"c2", clientName:"James Lee", clientEmail:"james@example.com", service:"End of Lease", date:"2026-03-15", time:"7:00 AM", address:"88 Hill Rd, Parramatta NSW 2150", total:199.00, status:"Completed", freq:"One Time", extras:["Deep Clean"] },
];

const STATUS_CONFIG = {
  Pending:   { color:"#e67e22", bg:"#fff8f0" },
  Confirmed: { color:BLUE,      bg:LIGHT_BLUE },
  Completed: { color:GREEN,     bg:LIGHT_GREEN },
  Cancelled: { color:"#e74c3c", bg:"#fdecea" },
};

function calcPrice(svc, beds, baths, freq, extras, couponPct) {
  if (!svc) return { subtotal:0, discAmt:0, couponDisc:0, gst:0, total:0 };
  const isNDIS = svc.id === "ndis";
  const roomAdd = svc.hasRooms ? (beds-1)*20+(baths-1)*15 : 0;
  const extTotal = extras.reduce((s,e)=>s+e.price,0);
  const sub = svc.base + roomAdd + extTotal;
  const disc = freq.disc>0 ? Math.round(sub*freq.disc/100) : 0;
  const coup = couponPct>0 ? Math.round((sub-disc)*couponPct/100) : 0;
  const afterDisc = sub - disc - coup;
  const gst = isNDIS ? 0 : Math.round(afterDisc * 0.10 * 100) / 100;
  return { subtotal:sub, discAmt:disc, couponDisc:coup, gst, total: afterDisc + gst };
}

const fmt = (n) => `A${Number(n).toFixed(2)}`;

function uid() { return Math.random().toString(36).slice(2,8); }

const S = {
  panel: (m) => ({ background:WHITE, borderRadius:m?12:16, border:`1px solid ${BORDER}`, padding:m?"16px":"28px 32px", marginBottom:m?12:20, boxShadow:"0 2px 12px rgba(27,117,187,0.06)" }),
  secTitle: (m) => ({ fontSize:m?15:19, fontWeight:800, color:TEXT, marginBottom:m?14:20, paddingBottom:m?10:14, borderBottom:`2px solid ${BORDER}` }),
  inp: { width:"100%", border:`1.5px solid ${BORDER}`, borderRadius:9, padding:"12px 14px", fontSize:15, outline:"none", fontFamily:"inherit", color:TEXT, background:WHITE, boxSizing:"border-box" },
  btn: (bg,col,border) => ({ background:bg, color:col, border:border?`1.5px solid ${border}`:"none", borderRadius:9, padding:"12px 24px", fontSize:14, fontWeight:700, cursor:"pointer" }),
  sLbl: { fontSize:11, fontWeight:800, color:MUTED, textTransform:"uppercase", letterSpacing:1.2, marginBottom:8, marginTop:16 },
};

function Logo({ small }) {
  return (
    <img
      src="/logo.png"
      alt="Yahweh Property Care"
      style={{
        height: small ? 70 : 100,
        width: "auto",
        objectFit: "contain",
        display: "block",
        mixBlendMode: "multiply",
      }}
    />
  );
}

function StatusTag({ s }) {
  const cfg = STATUS_CONFIG[s]||{ color:MUTED, bg:"#f5f5f5" };
  return <span style={{ background:cfg.bg, color:cfg.color, borderRadius:50, padding:"4px 12px", fontSize:11, fontWeight:800, border:`1px solid ${cfg.color}33`, whiteSpace:"nowrap" }}>{s}</span>;
}

function Avatar({ name, size=36 }) {
  const initials = name ? name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() : "?";
  const colors = [BLUE, GREEN, "#9b59b6", "#e67e22", "#e74c3c", "#1abc9c"];
  const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
  return <div style={{ width:size, height:size, borderRadius:"50%", background:color+"22", border:`2px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:size*0.35, color, flexShrink:0 }}>{initials}</div>;
}

// ── MOBILE BOTTOM NAV ──
function MobileBottomNav({ user, isAdmin }) {
  const path = window.location.pathname;
  const items = isAdmin
    ? [{ label:"Dashboard", icon:<Icons.ClipboardList size={22}/>, href:"/admin" }]
    : [
        { label:"Book", icon:<Icons.Home size={22}/>, href:"/book" },
        user
          ? { label:"My Bookings", icon:<Icons.ClipboardList size={22}/>, href:"/client" }
          : { label:"Login", icon:<Icons.User size={22}/>, href:"/login" },
        { label:"Admin", icon:<Icons.Lock size={22}/>, href:"/admin-login" },
      ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:WHITE, borderTop:`1px solid ${BORDER}`, display:"flex", zIndex:300, boxShadow:"0 -4px 20px rgba(0,0,0,0.08)" }}>
      {items.map(item=>{
        const active = path === item.href;
        return (
          <div key={item.href} onClick={()=>window.location.href=item.href} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 0 8px", cursor:"pointer", color:active?BLUE:MUTED, borderTop:`2px solid ${active?BLUE:"transparent"}` }}>
            {item.icon}
            <span style={{ fontSize:10, fontWeight:700, marginTop:3 }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── SIDEBAR (desktop only) ──
function Sidebar({ bk, coupon, setCoupon, couponPct, onApply, couponMsg }) {
  const { svc, beds, baths, freq, extras } = bk;
  const { subtotal, discAmt, couponDisc, gst, total } = calcPrice(svc,beds,baths,freq,extras,couponPct);
  const isNDIS = svc?.id === "ndis";
  return (
    <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, overflow:"hidden", position:"sticky", top:76, boxShadow:"0 4px 24px rgba(27,117,187,0.10)" }}>
      <div style={{ background:`linear-gradient(135deg,${BLUE},#2196f3)`, padding:"20px 22px", color:WHITE }}>
        <div style={{ fontSize:11, fontWeight:700, opacity:0.8, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Service Summary</div>
        <div style={{ fontSize:30, fontWeight:900 }}>{fmt(total)}</div>
        <div style={{ fontSize:12, opacity:0.75, marginTop:4 }}>{isNDIS ? "GST Free (NDIS)" : "Inc. 10% GST"}</div>
      </div>
      <div style={{ padding:"20px" }}>
        {!svc ? <div style={{ color:MUTED, fontSize:13, textAlign:"center", padding:"20px 0" }}>Select a service to see pricing</div> : <>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${BORDER}` }}>
            <div style={{ color:BLUE }}><Icons.Home size={20}/></div>
            <span style={{ fontWeight:700, fontSize:14 }}>Service</span>
          </div>
          {[["Cleaning Type",svc.name],["Your Home",svc.hasRooms?`${beds} bed, ${baths} bath`:"Flat rate"],["Frequency",freq.label],["Extras",extras.length?extras.map(e=>e.name).join(", "):"—"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:9, fontSize:13 }}>
              <span style={{ color:MUTED }}>{k}</span>
              <span style={{ fontWeight:600, color:TEXT, textAlign:"right", maxWidth:"55%", fontSize:12 }}>{v}</span>
            </div>
          ))}
          <div style={{ background:BG, borderRadius:10, padding:"14px 16px", marginTop:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}><span style={{ color:MUTED }}>Sub Total</span><span style={{ fontWeight:700 }}>{fmt(subtotal)}</span></div>
            {discAmt>0&&<div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6, color:GREEN }}><span>Discount</span><span style={{ fontWeight:700 }}>-{fmt(discAmt)}</span></div>}
            {couponDisc>0&&<div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6, color:GREEN }}><span>Promo</span><span style={{ fontWeight:700 }}>-{fmt(couponDisc)}</span></div>}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6, color:isNDIS?GREEN:MUTED }}>
              <span>GST (10%)</span>
              <span style={{ fontWeight:700 }}>{isNDIS?"GST Free":fmt(gst)}</span>
            </div>
            <hr style={{ border:"none", borderTop:`1px dashed ${BORDER}`, margin:"10px 0" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontWeight:800, fontSize:15 }}>Total (AUD)</span><span style={{ fontWeight:900, fontSize:22, color:BLUE }}>{fmt(total)}</span></div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:14 }}>
            <input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Discount code" style={{ ...S.inp, flex:1, fontSize:13, padding:"9px 12px" }}/>
            <button onClick={onApply} style={S.btn(BLUE,WHITE)}>Apply</button>
          </div>
          {couponMsg&&<div style={{ fontSize:12, marginTop:6, color:couponMsg.ok?GREEN:"#e74c3c", fontWeight:600 }}>{couponMsg.text}</div>}
        </>}
      </div>
      <div style={{ padding:"12px 20px", display:"flex", alignItems:"center", gap:6, fontSize:13, color:MUTED, borderTop:`1px solid ${BORDER}` }}>
        <span style={{ color:GREEN }}><Icons.Phone/></span>
        <a href="tel:1300925355" style={{ color:GREEN, fontWeight:800, textDecoration:"none" }}>1300 925 355</a>
      </div>
    </div>
  );
}

// ── MOBILE PRICE STRIP ──
function MobilePriceStrip({ total, step, onNext, onBack, label }) {
  return (
    <div style={{ position:"fixed", bottom:56, left:0, right:0, background:WHITE, borderTop:`1px solid ${BORDER}`, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:200, boxShadow:"0 -2px 10px rgba(0,0,0,0.06)" }}>
      <div>
        <div style={{ fontSize:11, color:MUTED, fontWeight:600 }}>Total</div>
        <div style={{ fontSize:20, fontWeight:900, color:BLUE }}>${total.toFixed(2)}</div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        {step>1&&<button style={{ ...S.btn(WHITE,BLUE,BLUE), padding:"10px 16px", fontSize:13 }} onClick={onBack}>← Back</button>}
        <button style={{ ...S.btn(step<5?BLUE:GREEN,WHITE), padding:"10px 20px", fontSize:13 }} onClick={onNext}>
          {step<5?"Continue →":label}
        </button>
      </div>
    </div>
  );
}

// ── BOOKING APP ──
function BookingApp({ user, services, extras, coupons, onComplete }) {
  const mobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponPct, setCouponPct] = useState(0);
  const [couponMsg, setCouponMsg] = useState(null);
  const [done, setDone] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [bk, setBk] = useState({
    svc:services[0]||null, beds:1, baths:1, freq:FREQS[1], extras:[],
    date:null, time:"9:00 AM",
    firstName:user?user.name.split(" ")[0]:"", lastName:user?user.name.split(" ").slice(1).join(" "):"",
    email:user?user.email:"", phone:user?user.phone:"",
    address:"", suburb:"", state:"NSW", postcode:"", notes:"",
    cardName:"", cardNum:"", cardExp:"", cardCvv:"",
  });

  const { subtotal, discAmt, gst, total } = calcPrice(bk.svc,bk.beds,bk.baths,bk.freq,bk.extras,couponPct);
  const isNDIS = bk.svc?.id === "ndis";
  const set = k => e => setBk(p=>({...p,[k]:e.target.value}));
  const setV = (k,v) => setBk(p=>({...p,[k]:v}));
  const togExtra = ex => { const has=bk.extras.find(e=>e.id===ex.id); setV("extras",has?bk.extras.filter(e=>e.id!==ex.id):[...bk.extras,ex]); };

  function applyC() {
    const cp = coupons.find(c=>c.code===coupon&&c.active);
    if (cp) { setCouponPct(cp.disc); setCouponMsg({ok:true,text:`✓ ${cp.disc}% discount applied!`}); }
    else setCouponMsg({ok:false,text:"✗ Invalid or inactive code."});
  }

  const VALS = [null,()=>!!bk.svc,()=>!!bk.date&&!!bk.time,()=>!!(bk.firstName&&bk.lastName&&bk.email&&bk.phone&&bk.address&&bk.suburb&&bk.postcode),()=>!!(bk.cardName&&bk.cardNum.length>=16&&bk.cardExp&&bk.cardCvv.length>=3),()=>true];
  const ERRS = ["","Please select a cleaning service.","Please select a date and time.","Please fill all required fields.","Please complete payment details.",""];

  function next() {
    if (!VALS[step]()) { setError(ERRS[step]); window.scrollTo(0,0); return; }
    setError("");
    if (step===5) { submit(); return; }
    const ns=step+1; setStep(ns); setMaxStep(m=>Math.max(m,ns)); window.scrollTo(0,0);
  }

  function submit() {
    const nb = { id:"YPC"+Math.floor(Math.random()*9000+1000), clientId:user?user.id:"guest", clientName:[bk.firstName,bk.lastName].join(" "), clientEmail:bk.email, service:bk.svc.name, date:bk.date?bk.date.toISOString().split("T")[0]:"", time:bk.time, address:[bk.address,bk.suburb,bk.state,bk.postcode].filter(Boolean).join(", "), total, status:"Confirmed", freq:bk.freq.label, extras:bk.extras.map(e=>e.name) };
    onComplete(nb); setDone(true);
  }

  const today = new Date();
  const dates = Array.from({length:21},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()+i); return d; });
  const STEP_LABELS = ["Services","Schedule","Location","Payment","Confirm"];
  const p = mobile ? "16px" : "24px 28px";
  const mw = mobile ? "100%" : "1080px";

  if (done) return (
    <div style={{ maxWidth:540, margin:mobile?"0 auto":"48px auto", padding:mobile?"16px":"0 16px" }}>
      <div style={{ ...S.panel(mobile), textAlign:"center", padding:mobile?"24px 20px":"52px 36px" }}>
        <div style={{ width:72, height:72, background:LIGHT_GREEN, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}><Icons.Check size={36}/></div>
        <h2 style={{ fontSize:mobile?22:26, fontWeight:900, color:GREEN, marginBottom:8 }}>Booking Confirmed!</h2>
        <p style={{ color:MUTED, marginBottom:20, fontSize:14 }}>Confirmation sent to <strong style={{ color:BLUE }}>{bk.email}</strong></p>
        <div style={{ background:BG, borderRadius:12, padding:16, textAlign:"left", marginBottom:16 }}>
          {[["Service",bk.svc.name],["Date",bk.date?bk.date.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):"—"],["Time",bk.time],["GST",isNDIS?"GST Free":fmt(gst)],["Total (AUD)",fmt(total)]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:14 }}><span style={{ color:MUTED }}>{k}</span><span style={{ fontWeight:700 }}>{v}</span></div>
          ))}
        </div>
        <div style={{ background:"#fff8e1", border:"1px solid #ffe082", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#7a5c00", marginBottom:20 }}>⏰ Our team will call <strong>{bk.phone}</strong> within 2 hours.</div>
        <button style={{ ...S.btn(BLUE,WHITE), width:"100%", padding:"14px" }} onClick={()=>{setDone(false);setStep(1);setMaxStep(1);}}>Book Another Clean</button>
      </div>
      {mobile && <div style={{ height:70 }}/>}
    </div>
  );

  return (
    <div style={{ paddingBottom:mobile?130:0 }}>
      {/* Step nav */}
      <div style={{ background:WHITE, borderBottom:`1px solid ${BORDER}`, overflowX:"auto" }}>
        <div style={{ maxWidth:mw, margin:"0 auto", display:"flex", padding:mobile?"0 8px":"0 28px" }}>
          {STEP_LABELS.map((label,i)=>{
            const n=i+1, active=step===n, done2=step>n, can=n<=maxStep;
            return (
              <div key={n} onClick={()=>can&&setStep(n)} style={{ display:"flex", alignItems:"center", gap:6, padding:mobile?"12px 8px":"16px 14px 16px 0", borderBottom:`3px solid ${active?BLUE:done2?GREEN:"transparent"}`, color:active?BLUE:done2?GREEN:"#bbb", cursor:can?"pointer":"default", fontSize:mobile?11:13, fontWeight:700, marginRight:mobile?4:16, whiteSpace:"nowrap" }}>
                <span style={{ width:22, height:22, borderRadius:"50%", background:active?BLUE:done2?GREEN:"#e8ecf0", color:WHITE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, flexShrink:0 }}>{done2?<Icons.Check size={11}/>:n}</span>
                {!mobile||active?label:""}
              </div>
            );
          })}
        </div>
      </div>

      {error&&<div style={{ maxWidth:mw, margin:"10px auto 0", padding:mobile?"0 16px":"0 28px" }}><div style={{ background:"#fdecea", border:"1px solid #f5c6cb", borderRadius:9, padding:"10px 14px", color:"#c0392b", fontSize:14 }}>⚠️ {error}</div></div>}

      {/* Mobile summary toggle */}
      {mobile && bk.svc && (
        <div onClick={()=>setShowSummary(!showSummary)} style={{ margin:"12px 16px 0", background:LIGHT_BLUE, borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", border:`1px solid ${BLUE}22` }}>
          <div style={{ fontSize:13, color:BLUE, fontWeight:700 }}>📋 View Summary — ${total.toFixed(2)}</div>
          <span style={{ color:BLUE }}><Icons.ChevronRight size={16}/></span>
        </div>
      )}

      {/* Mobile summary drawer */}
      {mobile && showSummary && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:500 }} onClick={()=>setShowSummary(false)}>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:WHITE, borderRadius:"20px 20px 0 0", padding:"20px 20px 80px", maxHeight:"80vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, background:BORDER, borderRadius:2, margin:"0 auto 16px" }}/>
            <div style={{ fontSize:16, fontWeight:800, marginBottom:16 }}>Booking Summary</div>
            <div style={{ background:BG, borderRadius:12, padding:16 }}>
              {[["Service",bk.svc.name],["Property",bk.svc.hasRooms?`${bk.beds} bed, ${bk.baths} bath`:"Flat rate"],["Frequency",bk.freq.label]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:14 }}><span style={{ color:MUTED }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span></div>
              ))}
              {bk.extras.map(e=><div key={e.id} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:14 }}><span style={{ color:MUTED }}>{e.name}</span><span style={{ fontWeight:600, color:GREEN }}>+${e.price}</span></div>)}
              <hr style={{ border:"none", borderTop:`1px dashed ${BORDER}`, margin:"10px 0" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:14 }}><span style={{ color:MUTED }}>Subtotal</span><span style={{ fontWeight:700 }}>${subtotal.toFixed(2)}</span></div>
              {discAmt>0&&<div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:14, color:GREEN }}><span>Discount</span><span style={{ fontWeight:700 }}>-${discAmt.toFixed(2)}</span></div>}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}><span style={{ fontWeight:800, fontSize:16 }}>Total</span><span style={{ fontWeight:900, fontSize:24, color:BLUE }}>${total.toFixed(2)}</span></div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Promo code" style={{ ...S.inp, flex:1 }}/>
              <button onClick={applyC} style={S.btn(BLUE,WHITE)}>Apply</button>
            </div>
            {couponMsg&&<div style={{ fontSize:13, marginTop:6, color:couponMsg.ok?GREEN:"#e74c3c", fontWeight:600 }}>{couponMsg.text}</div>}
          </div>
        </div>
      )}

      <div style={{ maxWidth:mw, margin:"0 auto", padding:p, display:mobile?"block":"grid", gridTemplateColumns:"1fr 300px", gap:24 }}>
        <div>
          {/* STEP 1 */}
          {step===1&&<>
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>What kind of clean?</div>
              <div style={{ display:"grid", gridTemplateColumns:mobile?"repeat(2,1fr)":"repeat(auto-fill,minmax(130px,1fr))", gap:mobile?10:12 }}>
                {services.map(svc=>{ const a=bk.svc?.id===svc.id; return (
                  <div key={svc.id} onClick={()=>setV("svc",svc)} style={{ border:`2px solid ${a?BLUE:BORDER}`, borderRadius:12, padding:mobile?"14px 10px":"20px 12px", textAlign:"center", cursor:"pointer", background:a?LIGHT_BLUE:WHITE, transition:"all .2s" }}>
                    <div style={{ color:a?BLUE:MUTED, display:"flex", justifyContent:"center", marginBottom:8 }}><svc.Icon size={mobile?26:32}/></div>
                    <div style={{ fontSize:mobile?12:13, fontWeight:700, color:a?BLUE:TEXT, lineHeight:1.3 }}>{svc.name}</div>
                    <div style={{ fontSize:11, color:a?BLUE:MUTED, marginTop:3 }}>from ${svc.base}</div>
                    {a&&<div style={{ marginTop:6 }}><span style={{ background:BLUE, color:WHITE, borderRadius:50, padding:"2px 8px", fontSize:10, fontWeight:800 }}>✓</span></div>}
                  </div>
                );})}
              </div>
            </div>
            {bk.svc?.hasRooms&&(
              <div style={S.panel(mobile)}>
                <div style={S.secTitle(mobile)}>Bedrooms & Bathrooms</div>
                {[{label:"Bedrooms",Icon:Icons.Bed,key:"beds",max:8},{label:"Bathrooms",Icon:Icons.Bath,key:"baths",max:6}].map(r=>(
                  <div key={r.key} style={{ marginBottom:20 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, fontWeight:600, fontSize:14 }}><span style={{ color:BLUE }}><r.Icon/></span>{r.label}</div>
                    <div style={{ display:"flex", gap:mobile?10:8, flexWrap:"wrap" }}>
                      {Array.from({length:r.max},(_,i)=>i+1).map(n=>(
                        <div key={n} onClick={()=>setV(r.key,n)} style={{ width:mobile?46:44, height:mobile?46:44, borderRadius:10, border:`2px solid ${bk[r.key]===n?BLUE:BORDER}`, background:bk[r.key]===n?BLUE:WHITE, color:bk[r.key]===n?WHITE:TEXT, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontWeight:800, fontSize:16, transition:"all .2s" }}>{n}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>How often?</div>
              <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr 1fr":"repeat(auto-fill,minmax(170px,1fr))", gap:mobile?10:12 }}>
                {FREQS.map(f=>{ const a=bk.freq.id===f.id; return (
                  <div key={f.id} onClick={()=>setV("freq",f)} style={{ border:`2px solid ${a?GREEN:BORDER}`, borderRadius:12, padding:mobile?"14px":"16px 18px", cursor:"pointer", background:a?LIGHT_GREEN:WHITE }}>
                    <div style={{ fontWeight:800, fontSize:mobile?13:14, color:a?GREEN:TEXT }}>{f.label}</div>
                    {f.disc>0&&<div style={{ marginTop:5 }}><span style={{ background:GREEN, color:WHITE, borderRadius:50, padding:"2px 8px", fontSize:10, fontWeight:800 }}>{f.disc}% off</span></div>}
                  </div>
                );})}
              </div>
            </div>
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Extra services</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {extras.map(ex=>{ const a=bk.extras.some(e=>e.id===ex.id); return (
                  <div key={ex.id} onClick={()=>togExtra(ex)} style={{ border:`2px solid ${a?BLUE:BORDER}`, borderRadius:12, padding:"14px", cursor:"pointer", background:a?LIGHT_BLUE:WHITE, display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ color:a?BLUE:MUTED, flexShrink:0 }}><ex.Icon size={24}/></div>
                    <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14, color:a?BLUE:TEXT }}>{ex.name}</div><div style={{ fontSize:13, color:GREEN, fontWeight:700 }}>+${ex.price}</div></div>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:a?BLUE:BORDER, display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, flexShrink:0 }}>{a&&<Icons.Check size={13}/>}</div>
                  </div>
                );})}
              </div>
            </div>
            {!mobile&&<div style={S.panel(false)}>
              <div style={S.secTitle(false)}>Discount code</div>
              <div style={{ display:"flex", gap:10 }}>
                <input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Enter code" style={{ ...S.inp, maxWidth:220 }}/>
                <button onClick={applyC} style={S.btn(BLUE,WHITE)}>Apply</button>
              </div>
              {couponMsg&&<div style={{ fontSize:13, marginTop:6, color:couponMsg.ok?GREEN:"#e74c3c", fontWeight:600 }}>{couponMsg.text}</div>}
            </div>}
          </>}

          {/* STEP 2 */}
          {step===2&&(
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Choose date & time</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:mobile?4:6, marginBottom:20 }}>
                {DAYS_SHORT.map(d=><div key={d} style={{ textAlign:"center", fontSize:10, color:MUTED, fontWeight:800, padding:"3px 0" }}>{d}</div>)}
                {dates.map((d,i)=>{ const a=bk.date&&d.toDateString()===bk.date.toDateString(); const past=d<today&&d.toDateString()!==today.toDateString(); return (
                  <div key={i} onClick={()=>!past&&setV("date",d)} style={{ border:`2px solid ${a?BLUE:BORDER}`, borderRadius:8, padding:mobile?"8px 2px":"10px 4px", textAlign:"center", cursor:past?"not-allowed":"pointer", background:a?BLUE:past?"#f8f8f8":WHITE, opacity:past?0.4:1 }}>
                    <div style={{ fontSize:9, color:a?"rgba(255,255,255,0.8)":MUTED }}>{d.toLocaleString("default",{month:"short"})}</div>
                    <div style={{ fontSize:mobile?13:16, fontWeight:900, color:a?WHITE:past?"#ccc":TEXT }}>{d.getDate()}</div>
                  </div>
                );})}
              </div>
              <div style={S.sLbl}>Preferred time</div>
              <div style={{ display:"grid", gridTemplateColumns:mobile?"repeat(3,1fr)":"repeat(auto-fill,minmax(100px,1fr))", gap:mobile?8:10 }}>
                {TIME_SLOTS.map(t=>{ const a=bk.time===t; return <div key={t} onClick={()=>setV("time",t)} style={{ border:`2px solid ${a?BLUE:BORDER}`, borderRadius:10, padding:mobile?"11px 6px":"12px", textAlign:"center", cursor:"pointer", background:a?BLUE:WHITE, color:a?WHITE:MUTED, fontWeight:a?800:500, fontSize:mobile?12:13 }}>{t}</div>; })}
              </div>
              {bk.date&&<div style={{ marginTop:16, background:LIGHT_GREEN, border:`1px solid ${GREEN}44`, borderRadius:10, padding:"12px 14px", color:GREEN, fontSize:13, fontWeight:700 }}>✅ {bk.date.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} at {bk.time}</div>}
            </div>
          )}

          {/* STEP 3 */}
          {step===3&&(
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Your details</div>
              <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr":"1fr 1fr", gap:mobile?12:16 }}>
                {[["First Name","firstName","text","Jane"],["Last Name","lastName","text","Smith"],["Email","email","email","jane@example.com"],["Phone","phone","tel","04XX XXX XXX"]].map(([l,k,t,ph])=>(
                  <div key={k}><div style={S.sLbl}>{l} *</div><input type={t} value={bk[k]} onChange={set(k)} placeholder={ph} style={S.inp}/></div>
                ))}
              </div>
              <div style={S.sLbl}>Street Address *</div>
              <input value={bk.address} onChange={set("address")} placeholder="123 Main Street" style={S.inp}/>
              <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr 1fr":"1fr 1fr 140px", gap:mobile?12:16, marginTop:4 }}>
                <div><div style={S.sLbl}>Suburb *</div><input value={bk.suburb} onChange={set("suburb")} placeholder="Blacktown" style={S.inp}/></div>
                <div><div style={S.sLbl}>State</div><select value={bk.state} onChange={set("state")} style={S.inp}>{["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"].map(s=><option key={s}>{s}</option>)}</select></div>
                {!mobile&&<div><div style={S.sLbl}>Postcode *</div><input value={bk.postcode} onChange={set("postcode")} maxLength={4} placeholder="2148" style={S.inp}/></div>}
              </div>
              {mobile&&<div style={{ marginTop:12 }}><div style={S.sLbl}>Postcode *</div><input value={bk.postcode} onChange={set("postcode")} maxLength={4} placeholder="2148" style={{ ...S.inp, width:140 }}/></div>}
              <div style={S.sLbl}>Special Instructions</div>
              <textarea value={bk.notes} onChange={set("notes")} rows={3} placeholder="Key location, gate code, pets…" style={{ ...S.inp, resize:"vertical" }}/>
            </div>
          )}

          {/* STEP 4 */}
          {step===4&&(
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Secure Payment</div>
              <div style={{ background:BG, borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:14 }}><span style={{ color:MUTED }}>Service</span><span style={{ fontWeight:700 }}>{bk.svc.name}</span></div>
                {discAmt>0&&<div style={{ display:"flex", justifyContent:"space-between", fontSize:14, color:GREEN, marginBottom:6 }}><span>Discount</span><span style={{ fontWeight:700 }}>-${discAmt.toFixed(2)}</span></div>}
                <hr style={{ border:"none", borderTop:`1px dashed ${BORDER}`, margin:"8px 0" }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontWeight:800 }}>Total</span><span style={{ fontWeight:900, fontSize:22, color:BLUE }}>${total.toFixed(2)}</span></div>
              </div>
              <div style={{ marginBottom:14 }}><div style={S.sLbl}>Name on card *</div><input value={bk.cardName} onChange={set("cardName")} placeholder="Jane Smith" style={S.inp}/></div>
              <div style={{ marginBottom:14 }}><div style={S.sLbl}>Card number *</div><input value={bk.cardNum} onChange={e=>setV("cardNum",e.target.value.replace(/\D/g,"").slice(0,16))} placeholder="1234 5678 9012 3456" style={S.inp}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                <div><div style={S.sLbl}>Expiry *</div><input value={bk.cardExp} onChange={set("cardExp")} placeholder="MM/YY" maxLength={5} style={S.inp}/></div>
                <div><div style={S.sLbl}>CVV *</div><input value={bk.cardCvv} onChange={e=>setV("cardCvv",e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="123" maxLength={4} style={S.inp}/></div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:MUTED }}><Icons.Shield/> Protected by 256-bit SSL encryption</div>
            </div>
          )}

          {/* STEP 5 */}
          {step===5&&(
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Review & Confirm</div>
              {[
                {title:"Service",rows:[["Service",bk.svc.name],["Property",bk.svc.hasRooms?`${bk.beds} bed, ${bk.baths} bath`:"Flat rate"],["Frequency",bk.freq.label],["Extras",bk.extras.length?bk.extras.map(e=>e.name).join(", "):"None"]]},
                {title:"Schedule",rows:[["Date",bk.date?bk.date.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):"—"],["Time",bk.time]]},
                {title:"Location",rows:[["Name",[bk.firstName,bk.lastName].join(" ")],["Address",[bk.address,bk.suburb,bk.state,bk.postcode].filter(Boolean).join(", ")],["Email",bk.email],["Phone",bk.phone]]},
                {title:"Pricing",rows:[["Subtotal",`$${subtotal.toFixed(2)}`],["Discount",discAmt>0?`-$${discAmt.toFixed(2)}`:"—"],["Total",`$${total.toFixed(2)}`]]},
              ].map(sec=>(
                <div key={sec.title} style={{ background:BG, borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
                  <div style={{ fontWeight:800, fontSize:12, color:BLUE, marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>{sec.title}</div>
                  {sec.rows.map(([k,v])=>(<div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:7, fontSize:14 }}><span style={{ color:MUTED }}>{k}</span><span style={{ fontWeight:600, textAlign:"right", maxWidth:"60%" }}>{v}</span></div>))}
                </div>
              ))}
              <div style={{ background:LIGHT_BLUE, borderRadius:10, padding:"12px 14px", fontSize:13, color:"#1a3d60" }}>✅ By confirming you agree to Yahweh Property Care's Terms of Service.</div>
            </div>
          )}

          {/* Desktop nav buttons */}
          {!mobile && (
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              {step>1?<button style={{ ...S.btn(WHITE,BLUE,BLUE), display:"flex", alignItems:"center", gap:6 }} onClick={()=>{ setStep(s=>s-1); window.scrollTo(0,0); }}><Icons.ChevronLeft/> Back</button>:<span/>}
              {step<5?<button style={{ ...S.btn(BLUE,WHITE), display:"flex", alignItems:"center", gap:6 }} onClick={next}>Continue <Icons.ChevronRight/></button>:<button style={{ ...S.btn(GREEN,WHITE), display:"flex", alignItems:"center", gap:8, fontSize:15 }} onClick={next}><Icons.Check/> Confirm & Pay ${total.toFixed(2)}</button>}
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        {!mobile && <Sidebar bk={bk} coupon={coupon} setCoupon={setCoupon} couponPct={couponPct} onApply={applyC} couponMsg={couponMsg}/>}
      </div>

      {/* Mobile sticky price bar */}
      {mobile && <MobilePriceStrip total={total} step={step} onNext={next} onBack={()=>{ setStep(s=>s-1); window.scrollTo(0,0); }} label={`Confirm & Pay $${total.toFixed(2)}`}/>}
    </div>
  );
}

// ── CLIENT DASHBOARD ──
function ClientDash({ user, bookings, onLogout, onBook }) {
  const mobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("upcoming");
  const mine = bookings.filter(b=>b.clientId===user.id||b.clientEmail===user.email);
  const upcoming = mine.filter(b=>["Confirmed","Pending"].includes(b.status));
  const past = mine.filter(b=>["Completed","Cancelled"].includes(b.status));
  const totalSpent = past.filter(b=>b.status==="Completed").reduce((s,b)=>s+b.total,0);
  const nextBooking = upcoming.sort((a,b)=>new Date(a.date)-new Date(b.date))[0];

  return (
    <div style={{ background:BG, minHeight:"100vh", paddingBottom:mobile?90:40 }}>
      {/* Hero header */}
      <div style={{ background:`linear-gradient(135deg, ${BLUE} 0%, #1565a8 60%, #0d4a7a 100%)`, padding:mobile?"24px 16px 80px":"32px 40px 90px", position:"relative", overflow:"hidden" }}>
        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
        <div style={{ position:"absolute", bottom:-60, left:-20, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>
        <div style={{ position:"absolute", top:20, right:80, width:80, height:80, borderRadius:"50%", background:"rgba(126,184,66,0.2)" }}/>

        <div style={{ position:"relative", zIndex:1, maxWidth:900, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:mobile?52:64, height:mobile?52:64, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"3px solid rgba(255,255,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:mobile?20:26, color:WHITE, flexShrink:0 }}>
                {user.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:mobile?11:12, color:"rgba(255,255,255,0.7)", fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>Welcome back</div>
                <div style={{ fontSize:mobile?20:26, fontWeight:900, color:WHITE, lineHeight:1.2 }}>{user.name}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={onBook} style={{ background:GREEN, color:WHITE, border:"none", borderRadius:10, padding:mobile?"10px 16px":"12px 22px", fontSize:mobile?13:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 4px 16px rgba(126,184,66,0.4)" }}>
                <Icons.Plus size={14}/> New Booking
              </button>
              {!mobile&&<button onClick={onLogout} style={{ background:"rgba(255,255,255,0.15)", color:WHITE, border:"1px solid rgba(255,255,255,0.3)", borderRadius:10, padding:"12px 20px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Logout</button>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards — overlapping hero */}
      <div style={{ maxWidth:900, margin:mobile?"-40px 16px 0":"-44px auto 0", position:"relative", zIndex:2 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:mobile?10:16 }}>
          {[
            { icon:"📋", label:"Total Bookings", value:mine.length, color:BLUE, sub:"All time" },
            { icon:"✅", label:"Completed", value:past.filter(b=>b.status==="Completed").length, color:GREEN, sub:"Cleans done" },
            { icon:"💰", label:"Total Spent", value:fmt(totalSpent), color:"#9b59b6", sub:"Inc. GST" },
          ].map(({icon,label,value,color,sub})=>(
            <div key={label} style={{ background:WHITE, borderRadius:14, padding:mobile?"14px 12px":"20px", boxShadow:"0 8px 32px rgba(27,117,187,0.12)", border:`1px solid ${BORDER}` }}>
              <div style={{ fontSize:mobile?22:28, marginBottom:6 }}>{icon}</div>
              <div style={{ fontSize:mobile?18:24, fontWeight:900, color, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:mobile?11:13, fontWeight:700, color:TEXT, marginTop:4 }}>{label}</div>
              <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:mobile?"16px 16px 0":"24px 0 0" }}>

        {/* Next booking banner */}
        {nextBooking && (
          <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, padding:mobile?"16px":"20px 24px", marginBottom:20, boxShadow:"0 4px 16px rgba(27,117,187,0.08)", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div style={{ width:mobile?44:52, height:mobile?44:52, background:LIGHT_BLUE, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", color:BLUE, flexShrink:0 }}>
              <Icons.Calendar size={mobile?20:24}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:800, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Next Appointment</div>
              <div style={{ fontWeight:800, fontSize:mobile?15:17, color:TEXT }}>{nextBooking.service}</div>
              <div style={{ fontSize:13, color:MUTED, marginTop:2, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                <span style={{ display:"flex", alignItems:"center", gap:4 }}><Icons.Calendar size={12}/>{nextBooking.date}</span>
                <span>·</span>
                <span style={{ display:"flex", alignItems:"center", gap:4 }}><Icons.Clock size={12}/>{nextBooking.time}</span>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <StatusTag s={nextBooking.status}/>
              <div style={{ fontSize:mobile?18:22, fontWeight:900, color:BLUE, marginTop:6 }}>{fmt(nextBooking.total)}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:16, background:WHITE, borderRadius:12, padding:6, border:`1px solid ${BORDER}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          {[["upcoming",`Upcoming (${upcoming.length})`],["past",`History (${past.length})`]].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)} style={{ flex:1, background:activeTab===id?BLUE:"transparent", color:activeTab===id?WHITE:MUTED, border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer", transition:"all .2s" }}>{label}</button>
          ))}
        </div>

        {/* Upcoming */}
        {activeTab==="upcoming" && <>
          {upcoming.length===0 ? (
            <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, padding:"48px 24px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
              <div style={{ fontWeight:800, fontSize:17, color:TEXT, marginBottom:6 }}>No upcoming bookings</div>
              <div style={{ color:MUTED, fontSize:14, marginBottom:20 }}>Schedule your next clean today</div>
              <button onClick={onBook} style={{ background:BLUE, color:WHITE, border:"none", borderRadius:10, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Book a Clean</button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {upcoming.map(b=><BookingCard key={b.id} b={b} mobile={mobile}/>)}
            </div>
          )}
        </>}

        {/* Past */}
        {activeTab==="past" && <>
          {past.length===0 ? (
            <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, padding:"48px 24px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🧹</div>
              <div style={{ fontWeight:800, fontSize:17, color:TEXT, marginBottom:6 }}>No past bookings yet</div>
              <div style={{ color:MUTED, fontSize:14 }}>Your completed bookings will appear here</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {past.map(b=><BookingCard key={b.id} b={b} mobile={mobile}/>)}
            </div>
          )}
        </>}

        {/* Quick actions */}
        <div style={{ marginTop:24 }}>
          <div style={{ fontSize:14, fontWeight:800, color:TEXT, marginBottom:12 }}>Quick Actions</div>
          <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr 1fr":"repeat(3,1fr)", gap:12 }}>
            {[
              { icon:"🧹", label:"Book a Clean", sub:"Schedule new service", action:onBook, color:BLUE, bg:LIGHT_BLUE },
              { icon:"📞", label:"Call Us", sub:"1300 925 355", action:()=>window.location.href="tel:1300925355", color:GREEN, bg:LIGHT_GREEN },
              { icon:"🌐", label:"Our Website", sub:"yahwehpc.com.au", action:()=>window.open("https://yahwehpc.com.au","_blank"), color:"#9b59b6", bg:"#f5f0ff" },
            ].map(({icon,label,sub,action,color,bg})=>(
              <div key={label} onClick={action} style={{ background:WHITE, borderRadius:14, border:`1px solid ${BORDER}`, padding:"16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.04)", transition:"all .2s" }}>
                <div style={{ width:44, height:44, background:bg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color }}>{label}</div>
                  <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ b, mobile }) {
  const statusIcons = { Confirmed:"✅", Pending:"⏳", Completed:"🏆", Cancelled:"❌" };
  return (
    <div style={{ background:WHITE, borderRadius:14, border:`1px solid ${BORDER}`, overflow:"hidden", boxShadow:"0 2px 10px rgba(27,117,187,0.06)" }}>
      {/* Card header */}
      <div style={{ background:b.status==="Completed"?LIGHT_GREEN:b.status==="Cancelled"?"#fdecea":LIGHT_BLUE, padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${BORDER}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>{statusIcons[b.status]||"📋"}</span>
          <span style={{ fontWeight:800, fontSize:13, color:b.status==="Completed"?GREEN:b.status==="Cancelled"?"#e74c3c":BLUE }}>{b.service}</span>
        </div>
        <StatusTag s={b.status}/>
      </div>
      {/* Card body */}
      <div style={{ padding:mobile?"14px":"16px 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr":"1fr 1fr", gap:mobile?10:16, marginBottom:12 }}>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ width:36, height:36, background:LIGHT_BLUE, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:BLUE, flexShrink:0 }}><Icons.Calendar size={16}/></div>
            <div>
              <div style={{ fontSize:10, color:MUTED, fontWeight:700, textTransform:"uppercase", letterSpacing:.8 }}>Date & Time</div>
              <div style={{ fontWeight:700, fontSize:13, color:TEXT, marginTop:1 }}>{b.date}</div>
              <div style={{ fontSize:12, color:MUTED }}>{b.time}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ width:36, height:36, background:LIGHT_GREEN, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:GREEN, flexShrink:0 }}><Icons.MapPin size={16}/></div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:10, color:MUTED, fontWeight:700, textTransform:"uppercase", letterSpacing:.8 }}>Location</div>
              <div style={{ fontWeight:600, fontSize:12, color:TEXT, marginTop:1, lineHeight:1.4, wordBreak:"break-word" }}>{b.address}</div>
            </div>
          </div>
        </div>
        {b.extras&&b.extras.length>0&&(
          <div style={{ background:BG, borderRadius:8, padding:"8px 12px", marginBottom:12, fontSize:12, color:MUTED }}>
            <span style={{ fontWeight:700, color:GREEN }}>Extras: </span>{b.extras.join(", ")}
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:`1px dashed ${BORDER}` }}>
          <div style={{ fontSize:12, color:MUTED, display:"flex", alignItems:"center", gap:5 }}>
            <Icons.Tag size={12}/> {b.freq}
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:BLUE, textAlign:"right" }}>{fmt(b.total)}</div>
            <div style={{ fontSize:10, color:MUTED, textAlign:"right" }}>Inc. GST</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL ──
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:999, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:0 }}>
      <div style={{ background:WHITE, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto", padding:24 }}>
        <div style={{ width:40, height:4, background:BORDER, borderRadius:2, margin:"0 auto 16px" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontWeight:800, fontSize:17 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:MUTED }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDel({ msg, onYes, onNo }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:WHITE, borderRadius:16, maxWidth:340, width:"100%", padding:28, textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize:44, marginBottom:12 }}>⚠️</div>
        <p style={{ fontSize:15, marginBottom:24, lineHeight:1.5 }}>{msg}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button style={S.btn("#e74c3c",WHITE)} onClick={onYes}>Yes, Delete</button>
          <button style={S.btn(BG,TEXT,BORDER)} onClick={onNo}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ──
function AdminDash({ bookings, setBookings, clients, setClients, services, setServices, extras, setExtras, coupons, setCoupons, onLogout }) {
  const mobile = useIsMobile();
  const [tab, setTab] = useState("bookings");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [svcModal, setSvcModal] = useState(null);
  const [extraModal, setExtraModal] = useState(null);
  const [couponModal, setCouponModal] = useState(null);
  const [clientModal, setClientModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const SC = { Pending:"#e67e22", Confirmed:BLUE, Completed:GREEN, Cancelled:"#e74c3c" };
  const TABS = [
    { id:"bookings", label:"Bookings", Icon:Icons.ClipboardList },
    { id:"clients", label:"Clients", Icon:Icons.Users },
    { id:"services", label:"Services", Icon:Icons.Home },
    { id:"extras", label:"Add-ons", Icon:Icons.Sparkle },
    { id:"coupons", label:"Coupons", Icon:Icons.Tag },
  ];

  const filtBks = bookings.filter(b=>{
    const ms=filter==="All"||b.status===filter;
    const mq=!search||[b.service,b.id,b.clientName||""].some(x=>x.toLowerCase().includes(search.toLowerCase()));
    return ms&&mq;
  });

  const revenue = bookings.filter(b=>b.status==="Completed").reduce((s,b)=>s+b.total,0);

  function updBk(id,status){ setBookings(p=>p.map(b=>b.id===id?{...b,status}:b)); }
  function delBk(id){ setConfirm({msg:`Delete booking ${id}?`,action:()=>{setBookings(p=>p.filter(b=>b.id!==id));setConfirm(null);}}); }
  function delClient(id){ setConfirm({msg:"Delete this client?",action:()=>{setClients(p=>p.filter(c=>c.id!==id));setBookings(p=>p.filter(b=>b.clientId!==id));setConfirm(null);}}); }
  function saveClient(d){ if(d.id) setClients(p=>p.map(c=>c.id===d.id?d:c)); else setClients(p=>[...p,{...d,id:"c"+uid()}]); setClientModal(null); }
  function saveSvc(d){ if(d.id) setServices(p=>p.map(s=>s.id===d.id?{...d,base:Number(d.base),Icon:s.Icon}:s)); else setServices(p=>[...p,{...d,id:"s"+uid(),base:Number(d.base),Icon:Icons.Sparkle}]); setSvcModal(null); }
  function delSvc(id){ setConfirm({msg:"Delete this service?",action:()=>{setServices(p=>p.filter(s=>s.id!==id));setConfirm(null);}}); }
  function saveExtra(d){ if(d.id) setExtras(p=>p.map(e=>e.id===d.id?{...d,price:Number(d.price),Icon:e.Icon}:e)); else setExtras(p=>[...p,{...d,id:"e"+uid(),price:Number(d.price),Icon:Icons.Sparkle}]); setExtraModal(null); }
  function delExtra(id){ setConfirm({msg:"Delete this add-on?",action:()=>{setExtras(p=>p.filter(e=>e.id!==id));setConfirm(null);}}); }
  function saveCoupon(d){ if(d._edit) setCoupons(p=>p.map(c=>c.code===d._orig?{code:d.code,disc:Number(d.disc),active:d.active}:c)); else {if(coupons.find(c=>c.code===d.code)){alert("Code exists");return;} setCoupons(p=>[...p,{code:d.code.toUpperCase(),disc:Number(d.disc),active:true}]);} setCouponModal(null); }
  function delCoupon(code){ setConfirm({msg:`Delete coupon ${code}?`,action:()=>{setCoupons(p=>p.filter(c=>c.code!==code));setConfirm(null);}}); }

  const NavContent = () => (
    <>
      <div style={{ padding:"0 20px 16px", borderBottom:`1px solid ${BORDER}`, marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:800, color:MUTED, textTransform:"uppercase", letterSpacing:1.5 }}>Navigation</div>
      </div>
      {TABS.map(({id,label,Icon})=>(
        <div key={id} onClick={()=>{ setTab(id); setMenuOpen(false); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 20px", cursor:"pointer", background:tab===id?LIGHT_BLUE:"transparent", color:tab===id?BLUE:MUTED, borderRight:tab===id?`3px solid ${BLUE}`:"3px solid transparent", fontWeight:tab===id?700:500, fontSize:14, marginBottom:2 }}>
          <Icon size={18}/>{label}
        </div>
      ))}
      <div style={{ padding:"16px 20px", borderTop:`1px solid ${BORDER}`, marginTop:16 }}>
        <button onClick={onLogout} style={{ ...S.btn(WHITE,MUTED,BORDER), width:"100%", padding:"10px", fontSize:13 }}>Logout</button>
      </div>
    </>
  );

  return (
    <div style={{ display:"flex", minHeight:"calc(100vh - 66px)" }}>
      {confirm&&<ConfirmDel msg={confirm.msg} onYes={confirm.action} onNo={()=>setConfirm(null)}/>}
      {svcModal&&<Modal title={svcModal.mode==="add"?"Add Service":"Edit Service"} onClose={()=>setSvcModal(null)}><SvcForm data={svcModal.data} onSave={saveSvc}/></Modal>}
      {extraModal&&<Modal title={extraModal.mode==="add"?"Add Add-on":"Edit Add-on"} onClose={()=>setExtraModal(null)}><ExtraForm data={extraModal.data} onSave={saveExtra}/></Modal>}
      {couponModal&&<Modal title={couponModal.mode==="add"?"Add Coupon":"Edit Coupon"} onClose={()=>setCouponModal(null)}><CouponForm data={couponModal.data} onSave={saveCoupon}/></Modal>}
      {clientModal&&<Modal title={clientModal.mode==="add"?"Add Client":"Edit Client"} onClose={()=>setClientModal(null)}><ClientForm data={clientModal.data} onSave={saveClient}/></Modal>}

      {/* Mobile drawer */}
      {mobile && menuOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:400 }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)" }} onClick={()=>setMenuOpen(false)}/>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:260, background:WHITE, overflowY:"auto", paddingTop:60 }}>
            <NavContent/>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {!mobile && (
        <div style={{ width:220, background:WHITE, borderRight:`1px solid ${BORDER}`, padding:"24px 0", flexShrink:0, position:"relative" }}>
          <NavContent/>
        </div>
      )}

      {/* Main */}
      <div style={{ flex:1, overflowY:"auto", background:BG, paddingBottom:mobile?70:0 }}>
        <div style={{ background:WHITE, borderBottom:`1px solid ${BORDER}`, padding:mobile?"14px 16px":"20px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {mobile && <button onClick={()=>setMenuOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", color:TEXT, display:"flex", alignItems:"center" }}><Icons.Menu/></button>}
            <div>
              <h2 style={{ fontSize:mobile?16:20, fontWeight:900 }}>{TABS.find(t=>t.id===tab)?.label}</h2>
              {!mobile&&<p style={{ color:MUTED, fontSize:13, marginTop:2 }}>Yahweh Property Care</p>}
            </div>
          </div>
        </div>

        <div style={{ padding:mobile?"12px 16px":"24px 28px" }}>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:mobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:mobile?10:14, marginBottom:mobile?16:28 }}>
            {[
              { Icon:Icons.ClipboardList, label:"Bookings", value:bookings.length, color:BLUE, bg:LIGHT_BLUE },
              { Icon:Icons.DollarSign, label:"Revenue", value:"$"+revenue.toFixed(0), color:GREEN, bg:LIGHT_GREEN },
              { Icon:Icons.Clock, label:"Pending", value:bookings.filter(b=>b.status==="Pending").length, color:"#e67e22", bg:"#fff8f0" },
              { Icon:Icons.Users, label:"Clients", value:clients.length, color:BLUE, bg:LIGHT_BLUE },
            ].map(({Icon,label,value,color,bg})=>(
              <div key={label} style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:mobile?"14px":"20px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:mobile?40:48, height:mobile?40:48, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}><Icon size={mobile?18:22}/></div>
                <div>
                  <div style={{ fontSize:mobile?20:24, fontWeight:900, color, lineHeight:1 }}>{value}</div>
                  <div style={{ fontSize:mobile?11:12, color:MUTED, marginTop:3 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* BOOKINGS */}
          {tab==="bookings"&&<>
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search…" style={{ ...S.inp, flex:1, minWidth:150, padding:"10px 14px" }}/>
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
              {["All","Pending","Confirmed","Completed","Cancelled"].map(s=>{
                const a=filter===s; const col=SC[s]||BLUE;
                return <button key={s} onClick={()=>setFilter(s)} style={{ background:a?col:WHITE, color:a?WHITE:MUTED, border:`1.5px solid ${a?col:BORDER}`, borderRadius:50, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{s}</button>;
              })}
            </div>
            {filtBks.length===0&&<div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"32px", color:MUTED, textAlign:"center" }}>No bookings found.</div>}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtBks.map(b=>(
                <div key={b.id} style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
                  <div style={{ padding:"10px 14px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:BG }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ background:LIGHT_BLUE, color:BLUE, borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:900 }}>{b.id}</span>
                      <StatusTag s={b.status}/>
                    </div>
                    <span style={{ fontSize:11, color:MUTED }}>{b.date}</span>
                  </div>
                  <div style={{ padding:"14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <Avatar name={b.clientName} size={36}/>
                      <div>
                        <div style={{ fontWeight:800, fontSize:14 }}>{b.service}</div>
                        <div style={{ fontSize:12, color:MUTED }}>{b.clientName||"Guest"} · {b.time}</div>
                      </div>
                      <div style={{ marginLeft:"auto", fontWeight:900, fontSize:18, color:BLUE }}>${b.total.toFixed(2)}</div>
                    </div>
                    <div style={{ fontSize:12, color:MUTED, marginBottom:12 }}>{b.address}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {["Confirmed","Completed","Cancelled"].filter(s=>s!==b.status).map(s=>(
                        <button key={s} onClick={()=>updBk(b.id,s)} style={{ background:STATUS_CONFIG[s]?.bg||BG, color:STATUS_CONFIG[s]?.color||MUTED, border:`1px solid ${STATUS_CONFIG[s]?.color||MUTED}33`, borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>→ {s}</button>
                      ))}
                      <button onClick={()=>delBk(b.id)} style={{ background:"#fdecea", color:"#e74c3c", border:"1px solid #f5c6cb", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}><Icons.Trash size={12}/> Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* CLIENTS */}
          {tab==="clients"&&<>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
              <button style={{ ...S.btn(BLUE,WHITE), display:"flex", alignItems:"center", gap:6 }} onClick={()=>setClientModal({mode:"add",data:{name:"",email:"",phone:"",password:""}})}>
                <Icons.Plus/> Add Client
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {clients.map(c=>{
                const cbks=bookings.filter(b=>b.clientId===c.id);
                return (
                  <div key={c.id} style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                      <Avatar name={c.name} size={44}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:800, fontSize:14 }}>{c.name}</div>
                        <div style={{ fontSize:12, color:MUTED }}>{c.email}</div>
                        <div style={{ fontSize:12, color:MUTED }}>{c.phone}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                      <div style={{ flex:1, background:BG, borderRadius:10, padding:"10px", textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:900, color:BLUE }}>{cbks.length}</div>
                        <div style={{ fontSize:11, color:MUTED }}>Bookings</div>
                      </div>
                      <div style={{ flex:1, background:BG, borderRadius:10, padding:"10px", textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:900, color:GREEN }}>${cbks.reduce((s,b)=>s+b.total,0).toFixed(0)}</div>
                        <div style={{ fontSize:11, color:MUTED }}>Revenue</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>setClientModal({mode:"edit",data:{...c}})} style={{ ...S.btn(LIGHT_BLUE,BLUE), flex:1, padding:"9px", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}><Icons.Edit/> Edit</button>
                      <button onClick={()=>delClient(c.id)} style={{ ...S.btn("#fdecea","#e74c3c"), flex:1, padding:"9px", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}><Icons.Trash/> Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>}

          {/* SERVICES */}
          {tab==="services"&&<>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
              <button style={{ ...S.btn(BLUE,WHITE), display:"flex", alignItems:"center", gap:6 }} onClick={()=>setSvcModal({mode:"add",data:{name:"",base:100,hasRooms:false}})}>
                <Icons.Plus/> Add Service
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
              {services.map(svc=>(
                <div key={svc.id} style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
                  <div style={{ background:`linear-gradient(135deg,${LIGHT_BLUE},${WHITE})`, padding:"18px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:48, height:48, background:WHITE, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:BLUE, boxShadow:"0 2px 8px rgba(27,117,187,0.15)", flexShrink:0 }}><svc.Icon size={26}/></div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15 }}>{svc.name}</div>
                      <div style={{ color:GREEN, fontWeight:800, fontSize:17, marginTop:2 }}>from ${svc.base}</div>
                      <span style={{ fontSize:11, color:MUTED, background:BG, borderRadius:50, padding:"2px 10px", border:`1px solid ${BORDER}` }}>{svc.hasRooms?"Room-based":"Flat rate"}</span>
                    </div>
                  </div>
                  <div style={{ padding:"12px 14px", display:"flex", gap:8 }}>
                    <button onClick={()=>setSvcModal({mode:"edit",data:{...svc}})} style={{ ...S.btn(LIGHT_BLUE,BLUE), flex:1, padding:"9px", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}><Icons.Edit/> Edit</button>
                    <button onClick={()=>delSvc(svc.id)} style={{ ...S.btn("#fdecea","#e74c3c"), flex:1, padding:"9px", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}><Icons.Trash/> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* EXTRAS */}
          {tab==="extras"&&<>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
              <button style={{ ...S.btn(BLUE,WHITE), display:"flex", alignItems:"center", gap:6 }} onClick={()=>setExtraModal({mode:"add",data:{name:"",price:50}})}>
                <Icons.Plus/> Add Add-on
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr 1fr":"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
              {extras.map(ex=>(
                <div key={ex.id} style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
                  <div style={{ background:`linear-gradient(135deg,${LIGHT_GREEN},${WHITE})`, padding:"16px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:44, height:44, background:WHITE, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:GREEN, boxShadow:"0 2px 8px rgba(126,184,66,0.15)", flexShrink:0 }}><ex.Icon size={22}/></div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:13 }}>{ex.name}</div>
                      <div style={{ color:GREEN, fontWeight:900, fontSize:18 }}>+${ex.price}</div>
                    </div>
                  </div>
                  <div style={{ padding:"10px 12px", display:"flex", gap:6 }}>
                    <button onClick={()=>setExtraModal({mode:"edit",data:{...ex}})} style={{ ...S.btn(LIGHT_BLUE,BLUE), flex:1, padding:"8px", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}><Icons.Edit size={12}/> Edit</button>
                    <button onClick={()=>delExtra(ex.id)} style={{ ...S.btn("#fdecea","#e74c3c"), flex:1, padding:"8px", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}><Icons.Trash size={12}/> Del</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* COUPONS */}
          {tab==="coupons"&&<>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
              <button style={{ ...S.btn(BLUE,WHITE), display:"flex", alignItems:"center", gap:6 }} onClick={()=>setCouponModal({mode:"add",data:{code:"",disc:10}})}>
                <Icons.Plus/> Add Coupon
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {coupons.map(c=>(
                <div key={c.code} style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
                  <div style={{ background:c.active?`linear-gradient(135deg,${LIGHT_BLUE},${WHITE})`:"#fafafa", padding:"20px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontWeight:900, color:c.active?BLUE:MUTED, fontSize:20, letterSpacing:2, marginBottom:4 }}>{c.code}</div>
                      <div style={{ fontSize:26, fontWeight:900, color:c.active?GREEN:MUTED }}>{c.disc}% off</div>
                    </div>
                    <div style={{ width:44, height:44, background:c.active?LIGHT_BLUE:"#f0f0f0", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:c.active?BLUE:MUTED }}><Icons.Tag size={20}/></div>
                  </div>
                  <div style={{ padding:"12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                    <button onClick={()=>setCoupons(p=>p.map(x=>x.code===c.code?{...x,active:!x.active}:x))} style={{ background:c.active?LIGHT_GREEN:"#fdecea", color:c.active?GREEN:"#e74c3c", border:`1px solid ${c.active?GREEN+"33":"#f5c6cb"}`, borderRadius:50, padding:"6px 14px", fontSize:12, fontWeight:800, cursor:"pointer" }}>
                      {c.active?"● Active":"○ Inactive"}
                    </button>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>setCouponModal({mode:"edit",data:{code:c.code,disc:c.disc,active:c.active,_edit:true,_orig:c.code}})} style={{ background:LIGHT_BLUE, color:BLUE, border:"none", borderRadius:8, padding:"7px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontWeight:700, fontSize:12 }}><Icons.Edit/> Edit</button>
                      <button onClick={()=>delCoupon(c.code)} style={{ background:"#fdecea", color:"#e74c3c", border:"none", borderRadius:8, padding:"7px 10px", cursor:"pointer", display:"flex", alignItems:"center" }}><Icons.Trash/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

// ── FORMS ──
function SvcForm({ data, onSave }) {
  const [f,setF]=useState({...data});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  return <>
    {[["Service Name","name","text","e.g. Window Cleaning"],["Base Price ($)","base","number","119"]].map(([l,k,t,p])=>(
      <div key={k} style={{ marginBottom:14 }}><div style={S.sLbl}>{l}</div><input type={t} value={f[k]||""} onChange={set(k)} placeholder={p} style={S.inp}/></div>
    ))}
    <div style={{ marginBottom:20 }}><div style={S.sLbl}>Room-based pricing?</div>
      <div style={{ display:"flex", gap:10 }}>
        {[["Yes",true],["No",false]].map(([l,v])=>(
          <div key={l} onClick={()=>setF(p=>({...p,hasRooms:v}))} style={{ border:`2px solid ${f.hasRooms===v?BLUE:BORDER}`, borderRadius:9, padding:"9px 24px", cursor:"pointer", background:f.hasRooms===v?LIGHT_BLUE:WHITE, color:f.hasRooms===v?BLUE:MUTED, fontWeight:700, fontSize:13 }}>{l}</div>
        ))}
      </div>
    </div>
    <button style={{ ...S.btn(BLUE,WHITE), width:"100%", padding:"14px" }} onClick={()=>onSave(f)}>Save Service</button>
  </>;
}

function ExtraForm({ data, onSave }) {
  const [f,setF]=useState({...data});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  return <>
    {[["Add-on Name","name","text","e.g. Steam Cleaning"],["Price ($)","price","number","50"]].map(([l,k,t,p])=>(
      <div key={k} style={{ marginBottom:14 }}><div style={S.sLbl}>{l}</div><input type={t} value={f[k]||""} onChange={set(k)} placeholder={p} style={S.inp}/></div>
    ))}
    <button style={{ ...S.btn(BLUE,WHITE), width:"100%", padding:"14px", marginTop:6 }} onClick={()=>onSave(f)}>Save Add-on</button>
  </>;
}

function CouponForm({ data, onSave }) {
  const [f,setF]=useState({...data});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  return <>
    <div style={{ marginBottom:14 }}><div style={S.sLbl}>Coupon Code</div><input value={f.code||""} onChange={e=>setF(p=>({...p,code:e.target.value.toUpperCase()}))} placeholder="e.g. SAVE20" style={S.inp}/></div>
    <div style={{ marginBottom:20 }}><div style={S.sLbl}>Discount (%)</div><input type="number" min={1} max={100} value={f.disc||""} onChange={set("disc")} placeholder="10" style={S.inp}/></div>
    <button style={{ ...S.btn(BLUE,WHITE), width:"100%", padding:"14px" }} onClick={()=>onSave(f)}>Save Coupon</button>
  </>;
}

function ClientForm({ data, onSave }) {
  const [f,setF]=useState({...data});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  return <>
    {[["Full Name","name","text","Jane Smith"],["Email","email","email","jane@example.com"],["Phone","phone","tel","04XX XXX XXX"],["Password","password","text","pass123"]].map(([l,k,t,p])=>(
      <div key={k} style={{ marginBottom:14 }}><div style={S.sLbl}>{l}</div><input type={t} value={f[k]||""} onChange={set(k)} placeholder={p} style={S.inp}/></div>
    ))}
    <button style={{ ...S.btn(BLUE,WHITE), width:"100%", padding:"14px", marginTop:6 }} onClick={()=>onSave(f)}>Save Client</button>
  </>;
}

// ── AUTH ──
function LoginScreen({ clients, onLogin, onAdmin, onGuest }) {
  const mobile = useIsMobile();
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  function tryLogin(){ const u=clients.find(c=>c.email===email&&c.password===pass); if(u) onLogin(u); else setErr("Invalid credentials. Try sarah@example.com / pass123"); }
  return (
    <div style={{ maxWidth:420, margin:mobile?"0 auto":"56px auto", padding:mobile?"16px":"0 16px" }}>
      <div style={{ background:WHITE, borderRadius:mobile?16:18, border:`1px solid ${BORDER}`, padding:mobile?"24px 20px":"36px", boxShadow:"0 8px 40px rgba(27,117,187,0.10)", marginTop:mobile?8:0 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <img src="/logo.png" alt="Yahweh Property Care" style={{ height:120, width:"auto", objectFit:"contain", marginBottom:4, mixBlendMode:"multiply" }}/>
          <p style={{ color:MUTED, fontSize:14, marginTop:8 }}>Sign in to manage your bookings</p>
        </div>
        {[["Email","email","email","you@example.com",setEmail,email],["Password","pass","password","••••••••",setPass,pass]].map(([l,id,t,p,fn,v])=>(
          <div key={id} style={{ marginBottom:16 }}><div style={S.sLbl}>{l}</div><input type={t} value={v} onChange={e=>fn(e.target.value)} placeholder={p} style={S.inp} onKeyDown={e=>e.key==="Enter"&&tryLogin()}/></div>
        ))}
        {err&&<div style={{ background:"#fdecea", border:"1px solid #f5c6cb", borderRadius:9, padding:"10px 14px", color:"#c0392b", fontSize:13, marginBottom:14 }}>{err}</div>}
        <button style={{ ...S.btn(BLUE,WHITE), width:"100%", marginBottom:12, fontSize:15, padding:"14px" }} onClick={tryLogin}>Sign In</button>
        <button style={{ ...S.btn(WHITE,BLUE,BLUE), width:"100%", marginBottom:14, padding:"14px" }} onClick={onGuest}>Continue as Guest</button>
        <hr style={{ border:"none", borderTop:`1px solid ${BORDER}`, margin:"14px 0" }}/>
        <button onClick={onAdmin} style={{ width:"100%", background:BG, color:MUTED, border:`1px solid ${BORDER}`, borderRadius:9, padding:"12px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Icons.Shield size={14}/> Admin Login
        </button>
        <p style={{ textAlign:"center", fontSize:12, color:MUTED, marginTop:14 }}>Demo: sarah@example.com / pass123</p>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin, onBack }) {
  const mobile = useIsMobile();
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");

  function tryLogin() {
    // Check super admin first
    if (email.trim().toLowerCase() === SUPER_ADMIN.email.toLowerCase() && pass === SUPER_ADMIN.password) {
      const adminData = { id:"super", name:"Ron_admin", email:SUPER_ADMIN.email, role:"superadmin" };
      sessionStorage.setItem("adminUser", JSON.stringify(adminData));
      onLogin(adminData);
      return;
    }
    // Check normal admins
    try {
      const stored = sessionStorage.getItem("adminList");
      const admins = stored ? JSON.parse(stored) : [];
      const found = admins.find(a => a.email.toLowerCase()===email.trim().toLowerCase() && a.password===pass);
      if (found) {
        sessionStorage.setItem("adminUser", JSON.stringify(found));
        onLogin(found);
        return;
      }
    } catch(e){}
    setErr("Invalid email or password.");
  }

  return (
    <div style={{ maxWidth:360, margin:mobile?"0 auto":"56px auto", padding:mobile?"16px":"0 16px" }}>
      <div style={{ background:WHITE, borderRadius:mobile?16:18, border:`1px solid ${BORDER}`, padding:mobile?"24px 20px":"36px", textAlign:"center", boxShadow:"0 8px 40px rgba(27,117,187,0.10)", marginTop:mobile?8:0 }}>
        <div style={{ width:72, height:72, background:LIGHT_BLUE, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}><Icons.Lock size={36}/></div>
        <h2 style={{ fontWeight:900, fontSize:20, color:BLUE, marginBottom:6 }}>Admin Login</h2>
        <p style={{ color:MUTED, fontSize:13, marginBottom:20 }}>Yahweh Property Care</p>
        <div style={{ textAlign:"left", marginBottom:14 }}>
          <div style={S.sLbl}>Email Address</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" style={S.inp} onKeyDown={e=>e.key==="Enter"&&tryLogin()}/>
        </div>
        <div style={{ textAlign:"left", marginBottom:14 }}>
          <div style={S.sLbl}>Password</div>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" style={S.inp} onKeyDown={e=>e.key==="Enter"&&tryLogin()}/>
        </div>
        {err&&<div style={{ color:"#e74c3c", fontSize:13, marginBottom:12, background:"#fdecea", borderRadius:8, padding:"8px 12px" }}>{err}</div>}
        <button style={{ ...S.btn(BLUE,WHITE), width:"100%", marginBottom:10, padding:"14px" }} onClick={tryLogin}>Login to Dashboard</button>
        <button style={{ ...S.btn(WHITE,BLUE,BLUE), width:"100%", padding:"14px" }} onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const adminUser = (() => { try { const a = sessionStorage.getItem("adminUser"); return a ? JSON.parse(a) : null; } catch(e){ return null; } })();
  if (!adminUser) return <Navigate to="/admin-login" replace />;
  return children;
}

export default function App() {
  const mobile = useIsMobile();
  const [user, setUser] = useState(()=>{ try { const u=sessionStorage.getItem("user"); return u?JSON.parse(u):null; } catch(e){ return null; } });
  const [adminUser, setAdminUser] = useState(()=>{ try { const a=sessionStorage.getItem("adminUser"); return a?JSON.parse(a):null; } catch(e){ return null; } });
  const [admins, setAdmins] = useState(()=>{ try { const a=sessionStorage.getItem("adminList"); return a?JSON.parse(a):DEF_ADMINS; } catch(e){ return DEF_ADMINS; } });
  const isAdmin = !!adminUser;

  useEffect(()=>{ sessionStorage.setItem("adminList", JSON.stringify(admins)); },[admins]);
  const [bookings, setBookings] = useState(DEF_BOOKINGS);
  const [clients, setClients] = useState(DEF_CLIENTS);
  const [services, setServices] = useState(SERVICES);
  const [extras, setExtras] = useState(EXTRAS);
  const [coupons, setCoupons] = useState(DEF_COUPONS);

  return (
    <BrowserRouter>
      <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:BG, minHeight:"100vh", color:TEXT }}>
        {/* Header */}
        <header style={{ background:WHITE, borderBottom:`1px solid ${BORDER}`, padding:mobile?"0 16px":"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", height:mobile?70:90, position:"sticky", top:0, zIndex:200, boxShadow:"0 2px 12px rgba(27,117,187,0.06)" }}>
          <div onClick={()=>window.location.href="/"} style={{ cursor:"pointer" }}><Logo small={mobile}/></div>
          <nav style={{ display:"flex", alignItems:"center", gap:mobile?8:12 }}>
            {!mobile && <>
              {/* Only show My Bookings to logged in clients — NOT admins */}
              {user && !isAdmin && <button onClick={()=>window.location.href="/client"} style={{ background:"none", border:"none", color:MUTED, fontSize:13, cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}><Icons.User size={14}/> My Bookings</button>}
              {/* Show Book a Clean only to non-admins */}
              {!isAdmin && <button style={{ ...S.btn(GREEN,WHITE), display:"flex", alignItems:"center", gap:6 }} onClick={()=>window.location.href="/book"}><Icons.Plus size={13}/> Book a Clean</button>}
              {/* Login button for guests */}
              {!user && !isAdmin && <button style={S.btn(WHITE,BLUE,BLUE)} onClick={()=>window.location.href="/login"}>Login</button>}
              {/* Client logout */}
              {user && !isAdmin && <button style={S.btn(WHITE,BLUE,BLUE)} onClick={()=>{setUser(null);sessionStorage.removeItem("user");window.location.href="/login";}}>Logout</button>}
              {/* Admin logout */}
              {isAdmin && <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ background:adminUser?.role==="superadmin"?`linear-gradient(135deg,${BLUE},#2196f3)`:LIGHT_BLUE, borderRadius:8, padding:"6px 14px", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:12, color:adminUser?.role==="superadmin"?WHITE:BLUE, fontWeight:800 }}>
                    {adminUser?.role==="superadmin"?"⭐ Super Admin":"👤 Admin"}: {adminUser?.name}
                  </span>
                </div>
                <button style={S.btn(WHITE,BLUE,BLUE)} onClick={()=>{setAdminUser(null);sessionStorage.removeItem("adminUser");window.location.href="/login";}}>Logout</button>
              </div>}
            </>}
            <a href="tel:1300925355" style={{ color:GREEN, fontWeight:800, textDecoration:"none", fontSize:mobile?13:14, display:"flex", alignItems:"center", gap:4 }}><Icons.Phone size={14}/>{!mobile&&" 1300 925 355"}</a>
          </nav>
        </header>

        <Routes>
          <Route path="/login" element={<LoginScreen clients={clients} onLogin={u=>{setUser(u);sessionStorage.setItem("user",JSON.stringify(u));window.location.href="/client";}} onAdmin={()=>window.location.href="/admin-login"} onGuest={()=>window.location.href="/book"}/>}/>
          <Route path="/admin-login" element={<AdminLogin onLogin={u=>{ setAdminUser(u); window.location.href="/admin"; }} onBack={()=>window.location.href="/login"}/>}/>
          <Route path="/book" element={<BookingApp user={user} services={services} extras={extras} coupons={coupons} onComplete={nb=>setBookings(p=>[...p,nb])}/>}/>
          <Route path="/client" element={<PrivateRoute user={user}><ClientDash user={user} bookings={bookings} onLogout={()=>{setUser(null);sessionStorage.removeItem("user");window.location.href="/login";}} onBook={()=>window.location.href="/book"}/></PrivateRoute>}/>
          <Route path="/admin" element={<AdminRoute isAdmin={isAdmin}><AdminDash adminUser={adminUser} admins={admins} setAdmins={setAdmins} bookings={bookings} setBookings={setBookings} clients={clients} setClients={setClients} services={services} setServices={setServices} extras={extras} setExtras={setExtras} coupons={coupons} setCoupons={setCoupons} onLogout={()=>{ setAdminUser(null); sessionStorage.removeItem("adminUser"); sessionStorage.removeItem("isAdmin"); window.location.href="/login"; }}/></AdminRoute>}/>
          <Route path="/" element={<Navigate to="/login" replace/>}/>
          <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>

        {/* Mobile bottom nav */}
        {mobile && <MobileBottomNav user={user} isAdmin={isAdmin}/>}
      </div>
    </BrowserRouter>
  );
}
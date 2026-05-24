import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabase";

const BLUE = "#1b75bb", GREEN = "#7eb842", LIGHT_BLUE = "#e8f3fb", LIGHT_GREEN = "#f0f9e8";
const BORDER = "#e0e7ef", MUTED = "#7a90a8", TEXT = "#1a2533", BG = "#f5f7fa", WHITE = "#ffffff";

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => { const fn = () => setM(window.innerWidth < 768); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
  return m;
}

const fmt = n => `A$${Number(n).toFixed(2)}`;
const uid = () => Math.random().toString(36).slice(2, 8);

const FREQUENCIES = [
  { id: "weekly_1",    label: "Weekly (Once)",  multiplier: 4  },
  { id: "weekly_2",    label: "Weekly (Twice)",  multiplier: 8  },
  { id: "weekly_3",    label: "Weekly (3x)",     multiplier: 12 },
  { id: "weekly_4",    label: "Weekly (4x)",     multiplier: 16 },
  { id: "weekly_5",    label: "Weekly (5x)",     multiplier: 20 },
  { id: "weekly_6",    label: "Weekly (6x)",     multiplier: 24 },
  { id: "daily",       label: "Daily",           multiplier: 30 },
  { id: "fortnightly", label: "Fortnightly",     multiplier: 2  },
  { id: "every3w",     label: "Every 3 Weeks",   multiplier: null },
  { id: "monthly",     label: "Monthly",         multiplier: 1  },
];

const EVERY3W = [1,2,4,5,6,8,9,10,12,13,14,16,17,18,20,21,22,24,25,26,28,29,30,32,33,34,36,37,38,40,41,42,44,45,46,48];

function getVisits(freqId, months) {
  if (!freqId || !months) return 0;
  if (freqId === "every3w") return EVERY3W[months - 1] || 0;
  const f = FREQUENCIES.find(x => x.id === freqId);
  return f ? f.multiplier * months : 0;
}

const PERIODS = Array.from({ length: 36 }, (_, i) => ({ value: i + 1, label: `${i + 1} Month${i > 0 ? "s" : ""}` }));

const UNIT_TYPES = [
  "Per Unit","Per Hour","Per Visit","Per Meter","Per Room","Per m²",
  "Per Job","Per Day","Per Equipment","Per Service","Per Machine",
  "Per Chair","Per Item","Per Treatment","Per Clean","Per Mattress",
  "Per Section","Per KM","Per Hour (NDIS)","Weekly","Fortnightly","Monthly","Once Off Service"
];

const CAT_ICONS = ["🏠","💙","🏢","🏭","🧹","✨","🔑","🌿","💼","🏘️"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const TIME_SLOTS = ["7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM"];

const SUPER_ADMIN = { id: "super", name: "Ron_admin", email: "ron.web108@gmail.com", password: "Ron@!two3@#", role: "superadmin" };
const HARDCODED_ADMINS = [
  { id: "a001", name: "Alex Yogarajah", email: "alex@yahwehpc.com.au", password: "Yahweh219@#", role: "admin" },
];

const STATUS_CONFIG = {
  Pending:   { color: "#e67e22", bg: "#fff8f0" },
  Confirmed: { color: BLUE,      bg: LIGHT_BLUE },
  Completed: { color: GREEN,     bg: LIGHT_GREEN },
  Cancelled: { color: "#e74c3c", bg: "#fdecea" },
};

const S = {
  panel: m => ({ background: WHITE, borderRadius: m ? 12 : 16, border: `1px solid ${BORDER}`, padding: m ? 16 : "28px 32px", marginBottom: m ? 12 : 20, boxShadow: "0 2px 12px rgba(27,117,187,0.06)" }),
  inp: { width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 9, padding: "11px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", color: TEXT, background: WHITE, boxSizing: "border-box" },
  btn: (bg, col, bdr) => ({ background: bg, color: col, border: bdr ? `1.5px solid ${bdr}` : "none", borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }),
  sLbl: { fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6, marginTop: 14 },
  secTitle: m => ({ fontSize: m ? 14 : 17, fontWeight: 800, color: TEXT, marginBottom: m ? 12 : 18, paddingBottom: m ? 8 : 12, borderBottom: `2px solid ${BORDER}` }),
};

// ── SHARED COMPONENTS ──
function Logo({ small }) {
  return <img src="/logo.png" alt="Yahweh Property Care" style={{ height: small ? 52 : 72, width: "auto", objectFit: "contain", display: "block", mixBlendMode: "multiply" }} />;
}

function StatusTag({ s }) {
  const c = STATUS_CONFIG[s] || { color: MUTED, bg: "#f5f5f5" };
  return <span style={{ background: c.bg, color: c.color, borderRadius: 50, padding: "4px 12px", fontSize: 11, fontWeight: 800, border: `1px solid ${c.color}33`, whiteSpace: "nowrap" }}>{s}</span>;
}

function Avatar({ name, size = 36 }) {
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = [BLUE, GREEN, "#9b59b6", "#e67e22", "#e74c3c", "#1abc9c"];
  const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", border: `2px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.35, color, flexShrink: 0 }}>{initials}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: WHITE, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", padding: 24 }}>
        <div style={{ width: 40, height: 4, background: BORDER, borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: MUTED }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDel({ msg, onYes, onNo }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: WHITE, borderRadius: 16, maxWidth: 340, width: "100%", padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
        <p style={{ fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>{msg}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={S.btn("#e74c3c", WHITE)} onClick={onYes}>Yes, Delete</button>
          <button style={S.btn(BG, TEXT, BORDER)} onClick={onNo}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Loader({ text = "Loading…" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12 }}>
      <div style={{ width: 36, height: 36, border: `4px solid ${BORDER}`, borderTop: `4px solid ${BLUE}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ color: MUTED, fontSize: 14 }}>{text}</div>
    </div>
  );
}

function MobileBottomNav({ user, isAdmin }) {
  const path = window.location.pathname;
  const items = isAdmin
    ? [{ label: "Dashboard", icon: "🛠", href: "/admin" }]
    : [
        { label: "Book", icon: "🏠", href: "/book" },
        user ? { label: "My Bookings", icon: "📋", href: "/client" } : { label: "Login", icon: "👤", href: "/login" },
        { label: "Admin", icon: "🔐", href: "/admin-login" },
      ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: WHITE, borderTop: `1px solid ${BORDER}`, display: "flex", zIndex: 300, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
      {items.map(item => {
        const active = path === item.href;
        return (
          <div key={item.href} onClick={() => window.location.href = item.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 8px", cursor: "pointer", color: active ? BLUE : MUTED, borderTop: `2px solid ${active ? BLUE : "transparent"}` }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, marginTop: 3 }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── QUOTE SIDEBAR ──
function QuoteSidebar({ items, addons, couponPct, isNDIS, onApplyCoupon }) {
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);
  const itemsTotal = items.reduce((s, i) => s + Number(i.unit_price) * Number(i.qty), 0);
  const addonsTotal = addons.reduce((s, a) => s + Number(a.unit_price) * Number(a.qty), 0);
  const subtotal = itemsTotal + addonsTotal;
  const couponDisc = couponPct > 0 ? Math.round(subtotal * couponPct / 100) : 0;
  const afterDisc = subtotal - couponDisc;
  const gst = isNDIS ? 0 : Math.round(afterDisc * 0.10 * 100) / 100;
  const total = afterDisc + gst;

  async function applyC() {
    const { data } = await supabase.from("coupons").select("*").eq("code", coupon.toUpperCase()).eq("is_active", true).single();
    if (data) { onApplyCoupon(data.discount_value, data.id); setCouponMsg({ ok: true, text: `✓ ${data.discount_value}% off!` }); }
    else setCouponMsg({ ok: false, text: "✗ Invalid code." });
  }

  return (
    <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", position: "sticky", top: 82, boxShadow: "0 4px 24px rgba(27,117,187,0.10)" }}>
      <div style={{ background: `linear-gradient(135deg,${BLUE},#2196f3)`, padding: "20px 22px", color: WHITE }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Quote Summary</div>
        <div style={{ fontSize: 32, fontWeight: 900 }}>{fmt(total)}</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{isNDIS ? "GST Free (NDIS)" : "Inc. 10% GST"}</div>
      </div>
      <div style={{ padding: 18 }}>
        {items.length === 0 && addons.length === 0
          ? <div style={{ color: MUTED, fontSize: 13, textAlign: "center", padding: "16px 0" }}>Add items to see pricing</div>
          : <>
            {items.filter(i => i.name).map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: MUTED, maxWidth: "60%", lineHeight: 1.3 }}>{it.name}</span>
                <span style={{ fontWeight: 700 }}>{fmt(Number(it.unit_price) * Number(it.qty))}</span>
              </div>
            ))}
            {addons.filter(a => a.name).map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: MUTED, maxWidth: "60%", lineHeight: 1.3 }}>+ {a.name}</span>
                <span style={{ fontWeight: 700, color: GREEN }}>+{fmt(Number(a.unit_price) * Number(a.qty))}</span>
              </div>
            ))}
            <div style={{ background: BG, borderRadius: 10, padding: "12px 14px", marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span style={{ color: MUTED }}>Subtotal</span><span style={{ fontWeight: 700 }}>{fmt(subtotal)}</span></div>
              {couponDisc > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5, color: GREEN }}><span>Promo</span><span style={{ fontWeight: 700 }}>-{fmt(couponDisc)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span style={{ color: MUTED }}>GST</span><span style={{ fontWeight: 700 }}>{isNDIS ? "GST Free" : fmt(gst)}</span></div>
              <hr style={{ border: "none", borderTop: `1px dashed ${BORDER}`, margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 800, fontSize: 14 }}>Total</span><span style={{ fontWeight: 900, fontSize: 20, color: BLUE }}>{fmt(total)}</span></div>
            </div>
          </>
        }
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Promo code" style={{ ...S.inp, flex: 1, fontSize: 13, padding: "9px 12px" }} />
          <button onClick={applyC} style={S.btn(BLUE, WHITE)}>Apply</button>
        </div>
        {couponMsg && <div style={{ fontSize: 12, marginTop: 6, color: couponMsg.ok ? GREEN : "#e74c3c", fontWeight: 600 }}>{couponMsg.text}</div>}
      </div>
      <div style={{ padding: "12px 18px", borderTop: `1px solid ${BORDER}` }}>
        <a href="tel:1300925355" style={{ color: GREEN, fontWeight: 800, textDecoration: "none", fontSize: 13 }}>📞 1300 925 355</a>
      </div>
    </div>
  );
}

// ── BOOKING APP ──
function BookingApp({ user, categories, onComplete }) {
  const mobile = useIsMobile();
  const today = new Date();

  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  // ── NEW: track if a new guest account was just created ──
  const [guestAccountCreated, setGuestAccountCreated] = useState(false);

  const [selCat, setSelCat] = useState(null);
  const [bkItems, setBkItems] = useState([]);
  const [bkAddons, setBkAddons] = useState([]);

  const [freqId, setFreqId] = useState("");
  const [period, setPeriod] = useState(1);
  const [quoteItems, setQuoteItems] = useState([{ id: uid(), item_id: "", name: "", unit_type: "", unit_price: 0, qty: 1, defQty: 1 }]);
  const [quoteAddons, setQuoteAddons] = useState([]);
  const [couponPct, setCouponPct] = useState(0);
  const [couponId, setCouponId] = useState(null);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("9:00 AM");

  const [client, setClient] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "", phone: user?.phone || "",
    address: "", suburb: "", state: "NSW", postcode: "", notes: "",
    cardName: "", cardNum: "", cardExp: "", cardCvv: "",
  });

  const visits = getVisits(freqId, period);
  const isNDIS = selCat?.name?.includes("NDIS");
  const itemsTotal = quoteItems.reduce((s, i) => s + Number(i.unit_price) * Number(i.qty), 0);
  const addonsTotal = quoteAddons.reduce((s, a) => s + Number(a.unit_price) * Number(a.qty), 0);
  const subtotal = itemsTotal + addonsTotal;
  const couponDisc = couponPct > 0 ? Math.round(subtotal * couponPct / 100) : 0;
  const afterDisc = subtotal - couponDisc;
  const gst = isNDIS ? 0 : Math.round(afterDisc * 0.10 * 100) / 100;
  const total = afterDisc + gst;

  useEffect(() => {
    if (!selCat) return;
    supabase.from("items").select("*").eq("category_id", selCat.id).eq("is_active", true).order("sort_order")
      .then(({ data }) => setBkItems(data || []));
    supabase.from("addon_items").select("*").eq("category_id", selCat.id).eq("is_active", true).order("sort_order")
      .then(({ data }) => setBkAddons(data || []));
    setQuoteItems([{ id: uid(), item_id: "", name: "", unit_type: "", unit_price: 0, qty: 1, defQty: 1 }]);
    setQuoteAddons([]);
  }, [selCat]);

  useEffect(() => {
    if (!visits) return;
    setQuoteItems(p => p.map(it => it.item_id && it.defQty ? { ...it, qty: it.defQty * visits } : it));
    setQuoteAddons(p => p.map(a => a.addon_id && a.defQty ? { ...a, qty: a.defQty * visits } : a));
  }, [visits]); // eslint-disable-line

  function updateItem(idx, field, val) {
    setQuoteItems(p => p.map((it, i) => {
      if (i !== idx) return it;
      if (field === "item_id") {
        const found = bkItems.find(c => c.id === val);
        const defQty = found?.default_quantity || 1;
        const v = getVisits(freqId, period) || 1;
        return found ? { ...it, item_id: val, name: found.name, unit_type: found.unit_type, unit_price: found.unit_price, qty: defQty * v, defQty } : { ...it, item_id: val };
      }
      return { ...it, [field]: val };
    }));
  }

  function updateAddon(idx, field, val) {
    setQuoteAddons(p => p.map((a, i) => {
      if (i !== idx) return a;
      if (field === "addon_id") {
        const found = bkAddons.find(c => c.id === val);
        const defQty = found?.default_quantity || 1;
        const v = getVisits(freqId, period) || 1;
        return found ? { ...a, addon_id: val, name: found.name, unit_type: found.unit_type, unit_price: found.unit_price, qty: defQty * v, defQty } : { ...a, addon_id: val };
      }
      return { ...a, [field]: val };
    }));
  }

  function addItem() { setQuoteItems(p => [...p, { id: uid(), item_id: "", name: "", unit_type: "", unit_price: 0, qty: 1, defQty: 1 }]); }
  function removeItem(idx) { setQuoteItems(p => p.filter((_, i) => i !== idx)); }
  function addAddon() { setQuoteAddons(p => [...p, { id: uid(), addon_id: "", name: "", unit_type: "", unit_price: 0, qty: 1, defQty: 1 }]); }
  function removeAddon(idx) { setQuoteAddons(p => p.filter((_, i) => i !== idx)); }
  const setC = k => e => setClient(p => ({ ...p, [k]: e.target.value }));

  const calFirstDay = new Date(viewYear, viewMonth, 1).getDay();
  const calDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 11, 1);

  function prevMonth() {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    if (prev >= minMonth) { setViewMonth(prev.getMonth()); setViewYear(prev.getFullYear()); }
  }
  function nextMonth() {
    const next = new Date(viewYear, viewMonth + 1, 1);
    if (next <= maxMonth) { setViewMonth(next.getMonth()); setViewYear(next.getFullYear()); }
  }

  const STEPS = ["Category", "Quote", "Schedule", "Details", "Payment", "Confirm"];
  const VALS = [
    null,
    () => !!selCat,
    () => quoteItems.some(i => i.item_id) && !!freqId && period > 0,
    () => !!date && !!time,
    () => !!(client.firstName && client.lastName && client.email && client.phone && client.address && client.suburb && client.postcode),
    () => !!(client.cardName && client.cardNum.length >= 16 && client.cardExp && client.cardCvv.length >= 3),
    () => true,
  ];
  const ERRS = ["", "Please select a category.", "Please add at least one item, frequency and period.", "Please select a date and time.", "Please fill all required fields.", "Please complete payment details.", ""];

  function next() {
    if (!VALS[step]()) { setError(ERRS[step]); window.scrollTo(0, 0); return; }
    setError("");
    if (step === 6) { submit(); return; }
    const ns = step + 1; setStep(ns); setMaxStep(m => Math.max(m, ns)); window.scrollTo(0, 0);
  }

  // ─────────────────────────────────────────────────────────────
  //  SUBMIT — creates guest Supabase auth account automatically
  // ─────────────────────────────────────────────────────────────
  async function submit() {
    setSubmitting(true);
    try {
      const fullName = [client.firstName, client.lastName].join(" ");
      const address = [client.address, client.suburb, client.state, client.postcode].filter(Boolean).join(", ");
      const email = client.email.trim().toLowerCase();

      // ── STEP A: Auto-create Supabase auth account for guest ──
      // We only do this if the user isn't already logged in.
      let userId = user?.id || null;
      let accountJustCreated = false;

      if (!user) {
        // Generate a secure random temp password — user will replace it via email link
        const tempPassword = crypto.randomUUID() + "!Aa1";

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            data: { first_name: client.firstName, last_name: client.lastName, phone: client.phone },
            // After clicking the email link, user lands on /set-password to set their real password
            emailRedirectTo: `${window.location.origin}/set-password`,
          },
        });

        if (signUpError) {
          // "User already registered" — that's fine, they may have booked before. Continue without re-creating.
          if (!signUpError.message?.toLowerCase().includes("already registered")) {
            throw signUpError;
          }
        } else {
          userId = signUpData?.user?.id || null;
          // identities array is empty when email is already confirmed (existing user), so only flag as new if not
          if (signUpData?.user?.identities?.length > 0) {
            accountJustCreated = true;
          }
        }
      }

      // ── STEP B: Upsert client record ──
      const { data: clientData, error: cErr } = await supabase.from("clients")
        .upsert(
          { full_name: fullName, email, phone: client.phone, address: client.address, city: client.suburb, state: client.state, zip: client.postcode, notes: client.notes },
          { onConflict: "email" }
        )
        .select().single();
      if (cErr) throw cErr;

      // ── STEP C: Insert booking ──
      const firstItem = quoteItems.find(i => i.item_id);
      const { data: bkData, error: bErr } = await supabase.from("bookings").insert({
        client_id: clientData.id,
        user_id: userId,          // links auth account to booking
        category_id: selCat?.id,
        item_id: firstItem?.item_id || null,
        addon_item_ids: quoteAddons.filter(a => a.addon_id).map(a => a.addon_id),
        coupon_id: couponId,
        frequency: freqId,
        scheduled_date: date.toISOString().split("T")[0],
        scheduled_time: time,
        quantity: visits,
        status: "pending",
        subtotal, discount_amount: couponDisc, total_price: total, notes: client.notes,
      }).select().single();
      if (bErr) throw bErr;

      if (couponId) await supabase.rpc("increment_coupon_uses", { coupon_id: couponId });

      // ── STEP D: Send booking confirmation email via Edge Function ──
      const bookingId = `YPC${bkData.id.slice(0, 6).toUpperCase()}`;
      const freq = FREQUENCIES.find(f => f.id === freqId);
      try {
        await fetch("https://nsvzbhnqmyqpsehueqhu.supabase.co/functions/v1/send-booking-email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}` },
                      body: JSON.stringify({
            type: "both",
            booking: {
              bookingId, clientName: fullName, clientEmail: email,
              phone: client.phone, service: firstItem?.name || selCat?.name,
              date: date.toISOString().split("T")[0], time, address,
              freq: freq?.label || freqId,
              extras: quoteAddons.filter(a => a.name).map(a => a.name),
              notes: client.notes, subtotal, discountAmount: couponDisc, gst, total, isNDIS,
              isNewAccount: accountJustCreated,  // ← tells Edge Function to generate setup link
            },
          }),
        });
      } catch (e) { console.warn("Booking email failed:", e); }

      const nb = {
        id: bookingId, clientId: clientData.id, clientName: fullName, clientEmail: email,
        service: firstItem?.name || selCat?.name, date: date.toISOString().split("T")[0],
        time, address, total, status: "Confirmed", freq: freq?.label || freqId, extras: [],
      };
      onComplete(nb);
      setConfirmedBooking(nb);
      setGuestAccountCreated(accountJustCreated);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Failed to save booking. Please try again.");
    } finally { setSubmitting(false); }
  }

  // ── CONFIRMATION SCREEN ──
  if (done && confirmedBooking) return (
    <div style={{ maxWidth: 580, margin: "32px auto", padding: 16, paddingBottom: mobile ? 90 : 16 }}>
      <div style={{ ...S.panel(mobile), padding: mobile ? "24px 16px" : "36px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, background: LIGHT_GREEN, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>✅</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: GREEN, marginBottom: 8 }}>Booking Confirmed!</h2>
          <p style={{ color: MUTED, fontSize: 14 }}>Confirmation sent to <strong style={{ color: BLUE }}>{client.email}</strong></p>
        </div>

        <div style={{ background: LIGHT_BLUE, borderRadius: 10, padding: "12px 16px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Booking ID</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: BLUE }}>{confirmedBooking.id}</div>
        </div>

        {/* ── NEW: Show "verify your email" notice only for new guest accounts ── */}
        {guestAccountCreated && (
          <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#7a5c00", marginBottom: 6 }}>📧 One more step — Activate your account</div>
            <p style={{ fontSize: 13, color: "#7a5c00", margin: "0 0 10px", lineHeight: 1.6 }}>
              We've automatically created an account for you so you can track your bookings.<br />
              <strong>Check your email ({client.email})</strong> and click the link to verify & set your password.
            </p>
            <button
              onClick={async () => {
                const { error } = await supabase.auth.resend({
                  type: "signup",
                  email: client.email,
                  options: { emailRedirectTo: `${window.location.origin}/set-password` },
                });
                alert(error ? `Could not resend: ${error.message}` : "✅ Verification email resent! Check your inbox.");
              }}
              style={{ background: "none", border: "none", color: BLUE, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline" }}
            >
              Didn't receive it? Resend email
            </button>
          </div>
        )}

        {[
          { title: "Service", rows: [["Category", selCat?.name], ["Service", confirmedBooking.service], ["Frequency", FREQUENCIES.find(f => f.id === freqId)?.label || freqId], ["Period", `${period} month${period > 1 ? "s" : ""}`], ["Total Visits", `${visits} visits`]] },
          { title: "Schedule", rows: [["Start Date", date?.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })], ["Start Time", time]] },
          { title: "Location", rows: [["Name", confirmedBooking.clientName], ["Address", confirmedBooking.address], ["Phone", client.phone]] },
          { title: "Pricing", rows: [["Subtotal", fmt(subtotal)], ...(couponDisc > 0 ? [["Discount", `-${fmt(couponDisc)}`]] : []), ["GST", isNDIS ? "GST Free" : fmt(gst)], ["Total (AUD)", fmt(total)]] },
        ].map(sec => (
          <div key={sec.title} style={{ background: BG, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{sec.title}</div>
            {sec.rows.map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 14 }}><span style={{ color: MUTED }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span></div>)}
          </div>
        ))}

        <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5c00", marginBottom: 20 }}>
          ⏰ Our team will call <strong>{client.phone}</strong> within 2 hours to confirm your appointment.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button style={{ ...S.btn(WHITE, BLUE, BLUE), padding: 14 }} onClick={() => { setDone(false); setStep(1); setMaxStep(1); setConfirmedBooking(null); setGuestAccountCreated(false); }}>+ New Booking</button>
          {user
            ? <button style={{ ...S.btn(BLUE, WHITE), padding: 14 }} onClick={() => window.location.href = "/client"}>My Bookings</button>
            : <button style={{ ...S.btn(GREEN, WHITE), padding: 14 }} onClick={() => window.location.href = "/login"}>Sign In / My Bookings</button>
          }
        </div>
      </div>
    </div>
  );

  // ── BOOKING FORM STEPS (unchanged from original) ──
  return (
    <div style={{ paddingBottom: mobile ? 100 : 0 }}>
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", padding: mobile ? "0 4px" : "0 28px" }}>
          {STEPS.map((label, i) => { const n = i + 1, active = step === n, done2 = step > n, can = n <= maxStep; return (
            <div key={n} onClick={() => can && setStep(n)} style={{ display: "flex", alignItems: "center", gap: 5, padding: mobile ? "12px 6px" : "16px 12px 16px 0", borderBottom: `3px solid ${active ? BLUE : done2 ? GREEN : "transparent"}`, color: active ? BLUE : done2 ? GREEN : "#bbb", cursor: can ? "pointer" : "default", fontSize: mobile ? 10 : 13, fontWeight: 700, marginRight: mobile ? 2 : 14, whiteSpace: "nowrap" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: active ? BLUE : done2 ? GREEN : "#e8ecf0", color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{done2 ? "✓" : n}</span>
              {!mobile || active ? label : ""}
            </div>
          );})}
        </div>
      </div>

      {error && <div style={{ maxWidth: 1100, margin: "10px auto 0", padding: "0 16px" }}><div style={{ background: "#fdecea", border: "1px solid #f5c6cb", borderRadius: 9, padding: "10px 14px", color: "#c0392b", fontSize: 14 }}>⚠️ {error}</div></div>}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: mobile ? 14 : "24px 28px", display: mobile ? "block" : "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        <div>
          {step === 1 && (
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Select Service Category</div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
                {categories.map(cat => { const a = selCat?.id === cat.id; return (
                  <div key={cat.id} onClick={() => setSelCat(cat)} style={{ border: `2px solid ${a ? BLUE : BORDER}`, borderRadius: 14, padding: "22px 16px", textAlign: "center", cursor: "pointer", background: a ? LIGHT_BLUE : WHITE }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>{cat.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: a ? BLUE : TEXT }}>{cat.name}</div>
                    {a && <div style={{ marginTop: 8 }}><span style={{ background: BLUE, color: WHITE, borderRadius: 50, padding: "2px 10px", fontSize: 10, fontWeight: 800 }}>✓ Selected</span></div>}
                  </div>
                );})}
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div style={S.panel(mobile)}>
                <div style={S.secTitle(mobile)}>Service Schedule</div>
                <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={S.sLbl}>Service Frequency *</div>
                    <select value={freqId} onChange={e => setFreqId(e.target.value)} style={S.inp}>
                      <option value="">Select frequency…</option>
                      {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={S.sLbl}>Service Period *</div>
                    <select value={period} onChange={e => setPeriod(Number(e.target.value))} style={S.inp}>
                      {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={S.sLbl}>Total Visits</div>
                    <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 9, padding: "11px 14px", background: LIGHT_BLUE, fontWeight: 900, fontSize: 22, color: BLUE, textAlign: "center" }}>
                      {visits > 0 ? visits : "—"}
                      {visits > 0 && <div style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>visits</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div style={S.panel(mobile)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={S.secTitle(mobile)}>Items</div>
                  <button onClick={addItem} style={{ ...S.btn(BLUE, WHITE), padding: "8px 16px", fontSize: 12 }}>+ Add Item</button>
                </div>
                {!mobile && (
                  <div style={{ display: "grid", gridTemplateColumns: "3fr 120px 120px 130px 100px", gap: 8, marginBottom: 8, padding: "0 14px" }}>
                    {["Item / Service","Unit Type","Qty","Unit Price ($)","Amount"].map(h => (
                      <div key={h} style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>{h}</div>
                    ))}
                  </div>
                )}
                {quoteItems.map((item, idx) => (
                  <div key={item.id} style={{ marginBottom: 10, background: BG, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: BLUE }}>Item #{idx + 1}</span>
                      {quoteItems.length > 1 && <button onClick={() => removeItem(idx)} style={{ background: "#fdecea", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 12, fontWeight: 800, borderRadius: 6, padding: "3px 10px" }}>✕ Remove</button>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "3fr 120px 120px 130px 100px", gap: 10, padding: "12px 14px", alignItems: "end" }}>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Item / Service</div>}
                        <select value={item.item_id} onChange={e => updateItem(idx, "item_id", e.target.value)} style={S.inp}>
                          <option value="">Select item…</option>
                          {bkItems.map(ci => <option key={ci.id} value={ci.id}>{ci.name}</option>)}
                        </select>
                      </div>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Unit Type</div>}
                        <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 9, padding: "11px 10px", fontSize: 12, color: MUTED, background: WHITE, minHeight: 44 }}>{item.unit_type || "—"}</div>
                      </div>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Qty</div>}
                        <input type="number" min={0} step={0.5} value={item.qty} onChange={e => updateItem(idx, "qty", e.target.value)} style={S.inp} />
                      </div>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Unit Price ($)</div>}
                        <input type="number" min={0} step={0.01} value={item.unit_price} onChange={e => updateItem(idx, "unit_price", e.target.value)} style={S.inp} />
                      </div>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Amount</div>}
                        <div style={{ background: LIGHT_BLUE, border: `1.5px solid ${BLUE}22`, borderRadius: 9, padding: "11px 10px", fontWeight: 900, fontSize: 13, color: BLUE, textAlign: "center" }}>{fmt(Number(item.unit_price) * Number(item.qty))}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                  <div style={{ background: LIGHT_BLUE, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 800, color: BLUE }}>Items Total: {fmt(itemsTotal)}</div>
                </div>
              </div>

              <div style={S.panel(mobile)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={S.secTitle(mobile)}>Add-on Items</div>
                  <button onClick={addAddon} style={{ ...S.btn(GREEN, WHITE), padding: "8px 16px", fontSize: 12 }}>+ Add Addon</button>
                </div>
                {quoteAddons.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px", color: MUTED, fontSize: 13, background: BG, borderRadius: 10, border: `1px dashed ${BORDER}` }}>No add-ons added yet.</div>
                )}
                {quoteAddons.map((addon, idx) => (
                  <div key={addon.id} style={{ marginBottom: 10, background: LIGHT_GREEN, borderRadius: 12, border: `1px solid ${GREEN}33`, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: `1px solid ${GREEN}22` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>Add-on #{idx + 1}</span>
                      <button onClick={() => removeAddon(idx)} style={{ background: "#fdecea", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 12, fontWeight: 800, borderRadius: 6, padding: "3px 10px" }}>✕ Remove</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "3fr 120px 120px 130px 100px", gap: 10, padding: "12px 14px", alignItems: "end" }}>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Add-on Item</div>}
                        <select value={addon.addon_id} onChange={e => updateAddon(idx, "addon_id", e.target.value)} style={S.inp}>
                          <option value="">Select add-on…</option>
                          {bkAddons.map(ca => <option key={ca.id} value={ca.id}>{ca.name}</option>)}
                        </select>
                      </div>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Unit Type</div>}
                        <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 9, padding: "11px 10px", fontSize: 12, color: MUTED, background: WHITE, minHeight: 44 }}>{addon.unit_type || "—"}</div>
                      </div>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Qty</div>}
                        <input type="number" min={0} step={0.5} value={addon.qty} onChange={e => updateAddon(idx, "qty", e.target.value)} style={S.inp} />
                      </div>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Unit Price ($)</div>}
                        <input type="number" min={0} step={0.01} value={addon.unit_price} onChange={e => updateAddon(idx, "unit_price", e.target.value)} style={S.inp} />
                      </div>
                      <div>
                        {mobile && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 4 }}>Amount</div>}
                        <div style={{ background: WHITE, border: `1.5px solid ${GREEN}44`, borderRadius: 9, padding: "11px 10px", fontWeight: 900, fontSize: 13, color: GREEN, textAlign: "center" }}>+{fmt(Number(addon.unit_price) * Number(addon.qty))}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {quoteAddons.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                    <div style={{ background: LIGHT_GREEN, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 800, color: GREEN }}>Add-ons Total: {fmt(addonsTotal)}</div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Choose Start Date & Time</div>
              <div style={{ background: LIGHT_BLUE, borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>📅 Service Period & Frequency</div>
                <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 6 }}>Frequency</div>
                    <select value={freqId} onChange={e => setFreqId(e.target.value)} style={S.inp}>
                      <option value="">Select…</option>
                      {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 6 }}>Period</div>
                    <select value={period} onChange={e => setPeriod(Number(e.target.value))} style={S.inp}>
                      {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, marginBottom: 6 }}>Total Visits</div>
                    <div style={{ border: `1.5px solid ${BLUE}44`, borderRadius: 9, padding: "11px 14px", background: WHITE, fontWeight: 900, fontSize: 20, color: BLUE, textAlign: "center" }}>
                      {visits > 0 ? visits : "—"}
                      {visits > 0 && <div style={{ fontSize: 10, color: MUTED, fontWeight: 500 }}>visits</div>}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>📅 Starting Month & Date</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, background: LIGHT_BLUE, borderRadius: 10, padding: "10px 16px" }}>
                <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: BLUE, fontWeight: 900, lineHeight: 1, padding: "0 8px" }}>‹</button>
                <div style={{ fontWeight: 900, fontSize: 16, color: BLUE }}>
                  {new Date(viewYear, viewMonth, 1).toLocaleString("default", { month: "long", year: "numeric" })}
                </div>
                <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: BLUE, fontWeight: 900, lineHeight: 1, padding: "0 8px" }}>›</button>
              </div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 14 }}>
                {Array.from({ length: 6 }, (_, i) => {
                  const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
                  const active = d.getMonth() === viewMonth && d.getFullYear() === viewYear;
                  return (
                    <div key={i} onClick={() => { setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }} style={{ border: `2px solid ${active ? BLUE : BORDER}`, borderRadius: 50, padding: "5px 14px", cursor: "pointer", background: active ? BLUE : WHITE, color: active ? WHITE : MUTED, fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {d.toLocaleString("default", { month: "short" })}{d.getFullYear() !== today.getFullYear() ? ` ${d.getFullYear()}` : ""}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: mobile ? 4 : 6, marginBottom: 4 }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: MUTED, fontWeight: 800, padding: "3px 0" }}>{d}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: mobile ? 4 : 6, marginBottom: 20 }}>
                {Array.from({ length: calFirstDay }, (_, i) => <div key={`b${i}`} />)}
                {Array.from({ length: calDaysInMonth }, (_, i) => {
                  const d = new Date(viewYear, viewMonth, i + 1);
                  const a = date && d.toDateString() === date.toDateString();
                  const past = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  return (
                    <div key={i} onClick={() => !past && setDate(d)} style={{ border: `2px solid ${a ? BLUE : BORDER}`, borderRadius: 8, padding: mobile ? "6px 2px" : "8px 4px", textAlign: "center", cursor: past ? "not-allowed" : "pointer", background: a ? BLUE : past ? "#f8f8f8" : WHITE, opacity: past ? 0.35 : 1 }}>
                      <div style={{ fontSize: mobile ? 9 : 10, color: a ? "rgba(255,255,255,0.85)" : MUTED, fontWeight: 700 }}>{d.toLocaleString("default", { month: "short" })}</div>
                      <div style={{ fontSize: mobile ? 13 : 16, fontWeight: 900, color: a ? WHITE : past ? "#ccc" : TEXT, lineHeight: 1.2 }}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>🕐 Start Time</div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(3,1fr)" : "repeat(auto-fill,minmax(100px,1fr))", gap: mobile ? 8 : 10 }}>
                {TIME_SLOTS.map(t => { const a = time === t; return <div key={t} onClick={() => setTime(t)} style={{ border: `2px solid ${a ? BLUE : BORDER}`, borderRadius: 10, padding: mobile ? "11px 6px" : 12, textAlign: "center", cursor: "pointer", background: a ? BLUE : WHITE, color: a ? WHITE : MUTED, fontWeight: a ? 800 : 500, fontSize: mobile ? 12 : 13 }}>{t}</div>; })}
              </div>
              {date && (
                <div style={{ marginTop: 16, background: LIGHT_GREEN, border: `1px solid ${GREEN}44`, borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: GREEN, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>✅ Schedule Confirmed</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
                    <div><span style={{ color: MUTED }}>Start: </span><strong>{date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</strong></div>
                    <div><span style={{ color: MUTED }}>Time: </span><strong>{time}</strong></div>
                    <div><span style={{ color: MUTED }}>Period: </span><strong>{period} month{period > 1 ? "s" : ""}</strong></div>
                    <div><span style={{ color: MUTED }}>Visits: </span><strong style={{ color: BLUE, fontSize: 15 }}>{visits}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Your Details</div>
              {/* ── NEW: info hint for guests ── */}
              {!user && (
                <div style={{ background: LIGHT_BLUE, border: `1px solid ${BLUE}33`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: BLUE, marginBottom: 16 }}>
                  💡 <strong>Your email will be used to create your account</strong> — you'll receive a link to set your password after booking.
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 12 : 16 }}>
                {[["First Name","firstName","text","Jane"],["Last Name","lastName","text","Smith"],["Email","email","email","jane@example.com"],["Phone","phone","tel","04XX XXX XXX"]].map(([l,k,t,ph]) => (
                  <div key={k}><div style={S.sLbl}>{l} *</div><input type={t} value={client[k]} onChange={setC(k)} placeholder={ph} style={S.inp} /></div>
                ))}
              </div>
              <div style={S.sLbl}>Street Address *</div>
              <input value={client.address} onChange={setC("address")} placeholder="123 Main Street" style={S.inp} />
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr 140px", gap: mobile ? 12 : 16, marginTop: 4 }}>
                <div><div style={S.sLbl}>Suburb *</div><input value={client.suburb} onChange={setC("suburb")} placeholder="Blacktown" style={S.inp} /></div>
                <div><div style={S.sLbl}>State</div><select value={client.state} onChange={setC("state")} style={S.inp}>{["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"].map(s => <option key={s}>{s}</option>)}</select></div>
                {!mobile && <div><div style={S.sLbl}>Postcode *</div><input value={client.postcode} onChange={setC("postcode")} maxLength={4} placeholder="2148" style={S.inp} /></div>}
              </div>
              {mobile && <div style={{ marginTop: 12 }}><div style={S.sLbl}>Postcode *</div><input value={client.postcode} onChange={setC("postcode")} maxLength={4} placeholder="2148" style={{ ...S.inp, width: 140 }} /></div>}
              <div style={S.sLbl}>Special Instructions</div>
              <textarea value={client.notes} onChange={setC("notes")} rows={3} placeholder="Key location, gate code, pets…" style={{ ...S.inp, resize: "vertical" }} />
            </div>
          )}

          {step === 5 && (
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Secure Payment</div>
              <div style={{ background: BG, borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span style={{ color: MUTED }}>Subtotal</span><span style={{ fontWeight: 700 }}>{fmt(subtotal)}</span></div>
                {couponDisc > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6, color: GREEN }}><span>Discount</span><span style={{ fontWeight: 700 }}>-{fmt(couponDisc)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span style={{ color: MUTED }}>GST</span><span style={{ fontWeight: 700 }}>{isNDIS ? "GST Free" : fmt(gst)}</span></div>
                <hr style={{ border: "none", borderTop: `1px dashed ${BORDER}`, margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 800 }}>Total (AUD)</span><span style={{ fontWeight: 900, fontSize: 22, color: BLUE }}>{fmt(total)}</span></div>
              </div>
              <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Name on Card *</div><input value={client.cardName} onChange={setC("cardName")} placeholder="Jane Smith" style={S.inp} /></div>
              <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Card Number *</div><input value={client.cardNum} onChange={e => setClient(p => ({ ...p, cardNum: e.target.value.replace(/\D/g, "").slice(0, 16) }))} placeholder="1234 5678 9012 3456" style={S.inp} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><div style={S.sLbl}>Expiry *</div><input value={client.cardExp} onChange={setC("cardExp")} placeholder="MM/YY" maxLength={5} style={S.inp} /></div>
                <div><div style={S.sLbl}>CVV *</div><input value={client.cardCvv} onChange={e => setClient(p => ({ ...p, cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="123" style={S.inp} /></div>
              </div>
              <div style={{ marginTop: 14, fontSize: 13, color: MUTED }}>🔒 Protected by 256-bit SSL</div>
            </div>
          )}

          {step === 6 && (
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Review & Confirm</div>
              {[
                { title: "Service", rows: [["Category", selCat?.name], ["Items", quoteItems.filter(i => i.name).map(i => i.name).join(", ") || "—"], ["Add-ons", quoteAddons.filter(a => a.name).map(a => a.name).join(", ") || "None"]] },
                { title: "Schedule", rows: [["Frequency", FREQUENCIES.find(f => f.id === freqId)?.label || "—"], ["Period", `${period} month${period > 1 ? "s" : ""}`], ["Total Visits", `${visits} visits`], ["Start Date", date ? date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"], ["Time", time]] },
                { title: "Location", rows: [["Name", [client.firstName, client.lastName].join(" ")], ["Address", [client.address, client.suburb, client.state, client.postcode].filter(Boolean).join(", ")], ["Email", client.email], ["Phone", client.phone]] },
                { title: "Pricing", rows: [["Subtotal", fmt(subtotal)], ["Discount", couponDisc > 0 ? `-${fmt(couponDisc)}` : "—"], ["GST", isNDIS ? "GST Free" : fmt(gst)], ["Total (AUD)", fmt(total)]] },
              ].map(sec => (
                <div key={sec.title} style={{ background: BG, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: BLUE, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{sec.title}</div>
                  {sec.rows.map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 14 }}><span style={{ color: MUTED }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span></div>)}
                </div>
              ))}
              {/* ── NEW: remind guest about account creation on final step ── */}
              {!user && (
                <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5c00", marginBottom: 12 }}>
                  📧 After confirming, we'll send a link to <strong>{client.email}</strong> to activate your account and set your password.
                </div>
              )}
              <div style={{ background: LIGHT_BLUE, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#1a3d60" }}>✅ By confirming you agree to Yahweh Property Care's Terms of Service.</div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingBottom: mobile ? 80 : 0 }}>
            {step > 1 ? <button style={S.btn(WHITE, BLUE, BLUE)} onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0); }}>← Back</button> : <span />}
            {step < 6
              ? <button style={S.btn(BLUE, WHITE)} onClick={next}>Continue →</button>
              : <button style={{ ...S.btn(GREEN, WHITE), opacity: submitting ? 0.7 : 1 }} onClick={next} disabled={submitting}>{submitting ? "Saving…" : `✅ Confirm & Pay ${fmt(total)}`}</button>}
          </div>
        </div>

        {!mobile && (
          <QuoteSidebar items={quoteItems} addons={quoteAddons} couponPct={couponPct} isNDIS={isNDIS} onApplyCoupon={(pct, id) => { setCouponPct(pct); setCouponId(id); }} />
        )}
      </div>
    </div>
  );
}

// ── CLIENT DASHBOARD ──
function ClientDash({ user, bookings, onLogout, onBook }) {
  const mobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("upcoming");
  const mine = bookings.filter(b => b.clientId === user.id || b.clientEmail === user.email);
  const upcoming = mine.filter(b => ["Confirmed","Pending"].includes(b.status));
  const past = mine.filter(b => ["Completed","Cancelled"].includes(b.status));
  const totalSpent = past.filter(b => b.status === "Completed").reduce((s, b) => s + b.total, 0);

  return (
    <div style={{ background: BG, minHeight: "100vh", paddingBottom: mobile ? 90 : 40 }}>
      <div style={{ background: `linear-gradient(135deg,${BLUE},#0d4a7a)`, padding: mobile ? "24px 16px 80px" : "32px 40px 90px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22, color: WHITE }}>{user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 700, textTransform: "uppercase" }}>Welcome back</div>
              <div style={{ fontSize: mobile ? 20 : 26, fontWeight: 900, color: WHITE }}>{user.name}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onBook} style={{ background: GREEN, color: WHITE, border: "none", borderRadius: 10, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ New Booking</button>
            {!mobile && <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", color: WHITE, border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Logout</button>}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: mobile ? "-40px 16px 0" : "-44px auto 0", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: mobile ? 10 : 16 }}>
          {[{ icon: "📋", label: "Total", value: mine.length, color: BLUE }, { icon: "✅", label: "Completed", value: past.filter(b => b.status === "Completed").length, color: GREEN }, { icon: "💰", label: "Spent", value: fmt(totalSpent), color: "#9b59b6" }].map(({ icon, label, value, color }) => (
            <div key={label} style={{ background: WHITE, borderRadius: 14, padding: mobile ? "14px 10px" : 20, boxShadow: "0 8px 32px rgba(27,117,187,0.12)", border: `1px solid ${BORDER}`, textAlign: "center" }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: mobile ? 18 : 22, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "16px" : "24px 0 0" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: WHITE, borderRadius: 12, padding: 6, border: `1px solid ${BORDER}` }}>
          {[["upcoming",`Upcoming (${upcoming.length})`],["past",`History (${past.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, background: activeTab === id ? BLUE : "transparent", color: activeTab === id ? WHITE : MUTED, border: "none", borderRadius: 9, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
        {activeTab === "upcoming" && (upcoming.length === 0
          ? <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "48px 24px", textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>📅</div><div style={{ fontWeight: 800, fontSize: 17, marginBottom: 12 }}>No upcoming bookings</div><button onClick={onBook} style={{ background: BLUE, color: WHITE, border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Book a Clean</button></div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{upcoming.map(b => <BookingCard key={b.id} b={b} mobile={mobile} />)}</div>
        )}
        {activeTab === "past" && (past.length === 0
          ? <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "48px 24px", textAlign: "center" }}><div style={{ fontSize: 48 }}>🧹</div><div style={{ fontWeight: 800, fontSize: 17, marginTop: 12 }}>No past bookings yet</div></div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{past.map(b => <BookingCard key={b.id} b={b} mobile={mobile} />)}</div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ b, mobile }) {
  return (
    <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <div style={{ background: b.status === "Completed" ? LIGHT_GREEN : b.status === "Cancelled" ? "#fdecea" : LIGHT_BLUE, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: BLUE }}>{b.service}</span>
        <StatusTag s={b.status} />
      </div>
      <div style={{ padding: mobile ? 14 : "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: MUTED }}>{b.date} · {b.time}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: BLUE }}>{fmt(b.total)}</div>
      </div>
    </div>
  );
}

// ── SET PASSWORD PAGE (handles email verification link) ──

function SetPasswordPage({ onDone }) {
  const mobile = useIsMobile();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);   // start true while we exchange token
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Exchange the PKCE code or hash token so a session is established
    async function boot() {
      // Handle hash-fragment flow (#access_token=... from older email templates)
      const hash = window.location.hash;
      if (hash.includes("access_token")) {
        // Supabase v2 picks this up automatically via createClient
        const { data: { session } } = await supabase.auth.getSession();
        if (session) { setReady(true); setLoading(false); return; }
      }
      // Handle PKCE flow (?code=...)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) { setReady(true); setLoading(false); return; }
      }
      // Fallback: check if session already exists (user navigated back)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setReady(true); } else { setErr("This link has expired or is invalid. Please request a new one."); }
      setLoading(false);
    }
    boot();
  }, []);

  async function handleSet() {
    if (pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (pass !== confirm) { setErr("Passwords don't match."); return; }
    setLoading(true); setErr("");
    const { error } = await supabase.auth.updateUser({ password: pass });
    if (error) { setErr(error.message); setLoading(false); return; }
    // Get session and save user to sessionStorage so /client works
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: clientData } = await supabase.from("clients").select("*").eq("email", session.user.email).single();
      const u = { id: session.user.id, name: clientData?.full_name || session.user.email, email: session.user.email, phone: clientData?.phone || "" };
      sessionStorage.setItem("user", JSON.stringify(u));
    }
    setDone(true);
    setTimeout(() => { if (onDone) onDone(); window.location.href = "/client"; }, 2000);
  }

  return (
    <div style={{ maxWidth: 420, margin: mobile ? "0 auto" : "56px auto", padding: 16 }}>
      <div style={{ background: WHITE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: mobile ? "24px 20px" : 36, boxShadow: "0 8px 40px rgba(27,117,187,0.10)", marginTop: mobile ? 8 : 0, textAlign: "center" }}>
        <img src="/logo.png" alt="Yahweh Property Care" style={{ height: 80, width: "auto", objectFit: "contain", mixBlendMode: "multiply", marginBottom: 16 }} />

        {loading && <Loader text="Verifying your link…" />}

        {!loading && done && (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontWeight: 900, color: GREEN, marginBottom: 8 }}>Password Set!</h2>
            <p style={{ color: MUTED, fontSize: 14 }}>Your account is active. Redirecting to your bookings…</p>
          </>
        )}

        {!loading && !done && !ready && (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⛔</div>
            <h2 style={{ fontWeight: 900, color: "#e74c3c", marginBottom: 8 }}>Link Expired</h2>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 20 }}>{err}</p>
            <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14 }} onClick={() => window.location.href = "/login"}>← Back to Login</button>
          </>
        )}

        {!loading && !done && ready && (
          <>
            <h2 style={{ fontWeight: 900, fontSize: 22, color: BLUE, marginBottom: 6 }}>Set Your Password</h2>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>Create a password to access your bookings anytime.</p>
            <div style={{ textAlign: "left" }}>
              <div style={{ marginBottom: 14 }}><div style={S.sLbl}>New Password *</div><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min. 6 characters" style={S.inp} /></div>
              <div style={{ marginBottom: 20 }}><div style={S.sLbl}>Confirm Password *</div><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" style={S.inp} onKeyDown={e => e.key === "Enter" && handleSet()} /></div>
            </div>
            {err && <div style={{ background: "#fdecea", borderRadius: 9, padding: "10px 14px", color: "#c0392b", fontSize: 13, marginBottom: 14 }}>{err}</div>}
            <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14, fontSize: 15 }} onClick={handleSet} disabled={loading}>
              {loading ? "Setting password…" : "Set Password & View Bookings"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── LOGIN ──
function LoginScreen({ onLogin, onAdmin, onGuest }) {
  const mobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // ── Catch Supabase email link redirects and forward to /set-password ──
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    if (
      hash.includes("access_token") ||
      hash.includes("type=recovery") ||
      params.get("code") ||
      params.get("type") === "recovery" ||
      params.get("type") === "signup"
    ) {
      window.location.href = "/set-password" + window.location.search + window.location.hash;
    }
  }, []);

  async function tryLogin() {
    setLoading(true); setErr("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { setErr(error.message); setLoading(false); return; }
    if (data.user) {
      const { data: clientData } = await supabase.from("clients").select("*").eq("email", data.user.email).single();
      onLogin({ id: data.user.id, name: clientData?.full_name || data.user.email, email: data.user.email, phone: clientData?.phone || "" });
    }
    setLoading(false);
  }

  async function sendReset() {
    setLoading(true); setErr("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/set-password` });
    if (error) { setErr(error.message); } else { setForgotSent(true); }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 420, margin: mobile ? "0 auto" : "56px auto", padding: 16 }}>
      <div style={{ background: WHITE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: mobile ? "24px 20px" : 36, boxShadow: "0 8px 40px rgba(27,117,187,0.10)", marginTop: mobile ? 8 : 0 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="/logo.png" alt="Yahweh Property Care" style={{ height: 100, width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} />
          <p style={{ color: MUTED, fontSize: 14, marginTop: 8 }}>{forgotMode ? "Reset your password" : "Sign in to manage your bookings"}</p>
        </div>

        {forgotSent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>Check your email!</div>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 20 }}>We sent a password reset link to <strong>{email}</strong></p>
            <button style={{ ...S.btn(WHITE, BLUE, BLUE), width: "100%", padding: 14 }} onClick={() => { setForgotMode(false); setForgotSent(false); }}>← Back to Login</button>
          </div>
        ) : forgotMode ? (
          <>
            <div style={{ marginBottom: 16 }}><div style={S.sLbl}>Email</div><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={S.inp} /></div>
            {err && <div style={{ background: "#fdecea", borderRadius: 9, padding: "10px 14px", color: "#c0392b", fontSize: 13, marginBottom: 14 }}>{err}</div>}
            <button style={{ ...S.btn(BLUE, WHITE), width: "100%", marginBottom: 12, padding: 14 }} onClick={sendReset} disabled={loading}>{loading ? "Sending…" : "Send Reset Link"}</button>
            <button style={{ ...S.btn(WHITE, BLUE, BLUE), width: "100%", padding: 14 }} onClick={() => setForgotMode(false)}>← Back to Login</button>
          </>
        ) : (
          <>
            {[["Email","email","email","you@example.com",setEmail,email],["Password","pass","password","••••••••",setPass,pass]].map(([l,id,t,p,fn,v]) => (
              <div key={id} style={{ marginBottom: 16 }}><div style={S.sLbl}>{l}</div><input type={t} value={v} onChange={e => fn(e.target.value)} placeholder={p} style={S.inp} onKeyDown={e => e.key === "Enter" && tryLogin()} /></div>
            ))}
            <div style={{ textAlign: "right", marginTop: -8, marginBottom: 16 }}>
              <span onClick={() => setForgotMode(true)} style={{ fontSize: 13, color: BLUE, cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
            </div>
            {err && <div style={{ background: "#fdecea", border: "1px solid #f5c6cb", borderRadius: 9, padding: "10px 14px", color: "#c0392b", fontSize: 13, marginBottom: 14 }}>{err}</div>}
            <button style={{ ...S.btn(BLUE, WHITE), width: "100%", marginBottom: 12, fontSize: 15, padding: 14 }} onClick={tryLogin} disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
            <button style={{ ...S.btn(WHITE, BLUE, BLUE), width: "100%", marginBottom: 16, padding: 14 }} onClick={onGuest}>Continue as Guest</button>
            <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: "16px 0" }} />
            <button onClick={onAdmin} style={{ width: "100%", background: BG, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 9, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔐 Admin Login</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── ADMIN LOGIN ──
function AdminLogin({ onLogin, onBack }) {
  const mobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  function tryLogin() {
    if (email.trim().toLowerCase() === SUPER_ADMIN.email.toLowerCase() && pass === SUPER_ADMIN.password) {
      const d = { id: "super", name: "Ron_admin", email: SUPER_ADMIN.email, role: "superadmin", password: SUPER_ADMIN.password };
      sessionStorage.setItem("adminUser", JSON.stringify(d)); onLogin(d); return;
    }
    try {
      const stored = JSON.parse(sessionStorage.getItem("adminList") || "[]");
      const merged = [...HARDCODED_ADMINS];
      stored.forEach(sa => { if (!merged.find(a => a.id === sa.id)) merged.push(sa); else { const i = merged.findIndex(a => a.id === sa.id); merged[i] = sa; } });
      const found = merged.find(a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === pass);
      if (found) { sessionStorage.setItem("adminUser", JSON.stringify(found)); onLogin(found); return; }
    } catch (e) {}
    setErr("Invalid email or password.");
  }
  return (
    <div style={{ maxWidth: 380, margin: mobile ? "0 auto" : "56px auto", padding: 16 }}>
      <div style={{ background: WHITE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: mobile ? "24px 20px" : 36, textAlign: "center", boxShadow: "0 8px 40px rgba(27,117,187,0.10)", marginTop: mobile ? 8 : 0 }}>
        <div style={{ width: 72, height: 72, background: LIGHT_BLUE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>🔐</div>
        <h2 style={{ fontWeight: 900, fontSize: 20, color: BLUE, marginBottom: 6 }}>Admin Login</h2>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>Yahweh Property Care</p>
        <div style={{ textAlign: "left", marginBottom: 14 }}><div style={S.sLbl}>Email</div><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" style={S.inp} onKeyDown={e => e.key === "Enter" && tryLogin()} /></div>
        <div style={{ textAlign: "left", marginBottom: 14 }}><div style={S.sLbl}>Password</div><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={S.inp} onKeyDown={e => e.key === "Enter" && tryLogin()} /></div>
        {err && <div style={{ color: "#e74c3c", fontSize: 13, marginBottom: 12, background: "#fdecea", borderRadius: 8, padding: "8px 12px" }}>{err}</div>}
        <button style={{ ...S.btn(BLUE, WHITE), width: "100%", marginBottom: 10, padding: 14 }} onClick={tryLogin}>Login</button>
        <button style={{ ...S.btn(WHITE, BLUE, BLUE), width: "100%", padding: 14 }} onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD (unchanged — keeping your full original) ──
function AdminDash({ bookings, setBookings, clients, setClients, categories, setCategories, onLogout }) {
  const mobile = useIsMobile();
  const adminUser = (() => { try { return JSON.parse(sessionStorage.getItem("adminUser")); } catch { return null; } })();
  const isSuperAdmin = adminUser?.role === "superadmin";
  const [tab, setTab] = useState("bookings");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [admins, setAdmins] = useState(() => { try { return JSON.parse(sessionStorage.getItem("adminList") || "[]"); } catch { return []; } });
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", password: "" });
  const [resetModal, setResetModal] = useState(null);
  const [resetForm, setResetForm] = useState({ newPw: "", confirm: "" });

  const [catModal, setCatModal] = useState(null);
  const [selCat, setSelCat] = useState(null);
  const [adminItems, setAdminItems] = useState([]);
  const [adminAddons, setAdminAddons] = useState([]);
  const [itemModal, setItemModal] = useState(null);
  const [addonModal, setAddonModal] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [freqs, setFreqs] = useState([]);
  const [freqModal, setFreqModal] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [couponModal, setCouponModal] = useState(null);

  const allAdmins = (() => {
    const merged = [...HARDCODED_ADMINS];
    admins.forEach(a => { if (!merged.find(m => m.id === a.id)) merged.push(a); else { const i = merged.findIndex(m => m.id === a.id); merged[i] = a; } });
    return merged;
  })();

  const TABS = [
    ...(isSuperAdmin ? [{ id: "admins", label: "Manage Admins", icon: "⭐" }] : []),
    { id: "bookings",   label: "Bookings",   icon: "📋" },
    { id: "clients",    label: "Clients",    icon: "👥" },
    { id: "categories", label: "Categories", icon: "📁" },
    { id: "items",      label: "Items",      icon: "🛠" },
    { id: "addons",     label: "Add-ons",    icon: "✨" },
    { id: "frequency",  label: "Frequency",  icon: "💸" },
    { id: "coupons",    label: "Coupons",    icon: "🏷️" },
  ];

  useEffect(() => {
    supabase.from("frequency_discounts").select("*").order("id").then(({ data }) => data && setFreqs(data));
    supabase.from("coupons").select("*").order("code").then(({ data }) => data && setCoupons(data));
  }, []);

  useEffect(() => {
    if (!selCat) return;
    setItemsLoading(true);
    Promise.all([
      supabase.from("items").select("*").eq("category_id", selCat.id).order("sort_order"),
      supabase.from("addon_items").select("*").eq("category_id", selCat.id).order("sort_order"),
    ]).then(([ir, ar]) => { setAdminItems(ir.data || []); setAdminAddons(ar.data || []); setItemsLoading(false); });
  }, [selCat]);

  const filtBks = bookings.filter(b => {
    const ms = filter === "All" || b.status === filter;
    const mq = !search || [b.service, b.id, b.clientName || ""].some(x => x.toLowerCase().includes(search.toLowerCase()));
    return ms && mq;
  });
  const revenue = bookings.filter(b => b.status === "Completed").reduce((s, b) => s + b.total, 0);
  const SC = { Pending: "#e67e22", Confirmed: BLUE, Completed: GREEN, Cancelled: "#e74c3c" };

  async function updBk(id, status) {
    const dbId = bookings.find(b => b.id === id)?.db_id;
    if (dbId) await supabase.from("bookings").update({ status: status.toLowerCase() }).eq("id", dbId);
    setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
  }
  async function delBk(id) {
    setConfirm({ msg: `Delete booking ${id}?`, action: async () => {
      const dbId = bookings.find(b => b.id === id)?.db_id;
      if (dbId) await supabase.from("bookings").delete().eq("id", dbId);
      setBookings(p => p.filter(b => b.id !== id)); setConfirm(null);
    }});
  }
  async function delClient(id) {
    setConfirm({ msg: "Delete this client?", action: async () => {
      await supabase.from("bookings").delete().eq("client_id", id);
      await supabase.from("clients").delete().eq("id", id);
      setClients(p => p.filter(c => c.id !== id)); setBookings(p => p.filter(b => b.clientId !== id)); setConfirm(null);
    }});
  }
  async function saveCat(d) {
    if (d.id) { await supabase.from("service_categories").update({ name: d.name, icon: d.icon, description: d.description }).eq("id", d.id); setCategories(p => p.map(c => c.id === d.id ? { ...c, ...d } : c)); }
    else { const { data } = await supabase.from("service_categories").insert({ name: d.name, icon: d.icon || "🧹", description: d.description, is_active: true }).select().single(); if (data) setCategories(p => [...p, data]); }
    setCatModal(null);
  }
  async function delCat(id) {
    setConfirm({ msg: "Delete this category?", action: async () => {
      await supabase.from("service_categories").delete().eq("id", id);
      setCategories(p => p.filter(c => c.id !== id)); if (selCat?.id === id) setSelCat(null); setConfirm(null);
    }});
  }
  async function saveItem(d) {
    const p = { name: d.name, unit_type: d.unit_type, unit_price: Number(d.unit_price), default_quantity: Number(d.default_quantity) || 1, description: d.description || "", is_active: d.is_active !== false };
    if (d.id) { await supabase.from("items").update(p).eq("id", d.id); setAdminItems(prev => prev.map(i => i.id === d.id ? { ...i, ...p } : i)); }
    else { const { data } = await supabase.from("items").insert({ category_id: selCat.id, ...p }).select().single(); if (data) setAdminItems(prev => [...prev, data]); }
    setItemModal(null);
  }
  async function delItem(id) {
    setConfirm({ msg: "Delete this item?", action: async () => { await supabase.from("items").delete().eq("id", id); setAdminItems(p => p.filter(i => i.id !== id)); setConfirm(null); }});
  }
  async function saveAddon(d) {
    const p = { name: d.name, unit_type: d.unit_type, unit_price: Number(d.unit_price), default_quantity: Number(d.default_quantity) || 1, description: d.description || "", is_active: d.is_active !== false };
    if (d.id) { await supabase.from("addon_items").update(p).eq("id", d.id); setAdminAddons(prev => prev.map(a => a.id === d.id ? { ...a, ...p } : a)); }
    else { const { data } = await supabase.from("addon_items").insert({ category_id: selCat.id, ...p }).select().single(); if (data) setAdminAddons(prev => [...prev, data]); }
    setAddonModal(null);
  }
  async function delAddon(id) {
    setConfirm({ msg: "Delete this add-on?", action: async () => { await supabase.from("addon_items").delete().eq("id", id); setAdminAddons(p => p.filter(a => a.id !== id)); setConfirm(null); }});
  }
  async function saveFreq(d) {
    await supabase.from("frequency_discounts").update({ discount_percent: Number(d.discount_percent), label: d.label }).eq("id", d.id);
    setFreqs(p => p.map(f => f.id === d.id ? { ...f, ...d, discount_percent: Number(d.discount_percent) } : f));
    setFreqModal(null);
  }
  async function saveCoupon(d) {
    if (d.id) {
      await supabase.from("coupons").update({ code: d.code.toUpperCase(), discount_value: Number(d.discount_value), discount_type: d.discount_type }).eq("id", d.id);
      setCoupons(p => p.map(c => c.id === d.id ? { ...c, ...d, code: d.code.toUpperCase(), discount_value: Number(d.discount_value) } : c));
    } else {
      if (coupons.find(c => c.code === d.code.toUpperCase())) { alert("Code exists!"); return; }
      const { data } = await supabase.from("coupons").insert({ code: d.code.toUpperCase(), discount_type: d.discount_type || "percent", discount_value: Number(d.discount_value), is_active: true }).select().single();
      if (data) setCoupons(p => [...p, data]);
    }
    setCouponModal(null);
  }
  async function toggleCoupon(id) {
    const cp = coupons.find(c => c.id === id);
    await supabase.from("coupons").update({ is_active: !cp.is_active }).eq("id", id);
    setCoupons(p => p.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
  }
  async function delCoupon(id) {
    setConfirm({ msg: "Delete this coupon?", action: async () => { await supabase.from("coupons").delete().eq("id", id); setCoupons(p => p.filter(c => c.id !== id)); setConfirm(null); }});
  }
  function inviteAdmin() {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.password) { alert("All fields required"); return; }
    if (allAdmins.find(a => a.email.toLowerCase() === inviteForm.email.toLowerCase())) { alert("Email already exists"); return; }
    const newAdmin = { id: "a" + uid(), name: inviteForm.name, email: inviteForm.email, password: inviteForm.password, role: "admin" };
    const updated = [...admins, newAdmin];
    setAdmins(updated); sessionStorage.setItem("adminList", JSON.stringify(updated));
    setInviteForm({ name: "", email: "", password: "" }); setInviteModal(false);
    alert(`✅ Admin "${newAdmin.name}" created!\nAdd to HARDCODED_ADMINS:\n{ id:"${newAdmin.id}", name:"${newAdmin.name}", email:"${newAdmin.email}", password:"${newAdmin.password}", role:"admin" }`);
  }
  function delAdmin(id) {
    if (id === "super") { alert("Cannot delete Super Admin!"); return; }
    setConfirm({ msg: "Delete this admin?", action: () => {
      const updated = admins.filter(a => a.id !== id);
      setAdmins(updated); sessionStorage.setItem("adminList", JSON.stringify(updated)); setConfirm(null);
    }});
  }
  function resetAdminPw() {
    if (!resetForm.newPw || resetForm.newPw !== resetForm.confirm) { alert("Passwords don't match"); return; }
    const updated = admins.map(a => a.id === resetModal.id ? { ...a, password: resetForm.newPw } : a);
    setAdmins(updated); sessionStorage.setItem("adminList", JSON.stringify(updated));
    setResetModal(null); setResetForm({ newPw: "", confirm: "" });
    alert("✅ Password reset! Also update HARDCODED_ADMINS in App.js.");
  }

  function CatForm({ data, onSave }) {
    const [f, setF] = useState({ name: "", icon: "🧹", description: "", ...data });
    return <>
      <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Name *</div><input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Window Cleaning" style={S.inp} /></div>
      <div style={{ marginBottom: 14 }}>
        <div style={S.sLbl}>Icon</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CAT_ICONS.map(ic => <div key={ic} onClick={() => setF(p => ({ ...p, icon: ic }))} style={{ width: 44, height: 44, borderRadius: 10, border: `2px solid ${f.icon === ic ? BLUE : BORDER}`, background: f.icon === ic ? LIGHT_BLUE : WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer" }}>{ic}</div>)}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}><div style={S.sLbl}>Description</div><input value={f.description || ""} onChange={e => setF(p => ({ ...p, description: e.target.value }))} placeholder="Optional" style={S.inp} /></div>
      <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14 }} onClick={() => onSave(f)}>Save Category</button>
    </>;
  }

  function ItemForm({ data, onSave, label }) {
    const [f, setF] = useState({ name: "", unit_type: "Per Visit", unit_price: 0, default_quantity: 1, description: "", ...data });
    return <>
      <div style={{ marginBottom: 14 }}><div style={S.sLbl}>{label} Name *</div><input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} style={S.inp} /></div>
      <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Description</div><textarea value={f.description || ""} onChange={e => setF(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...S.inp, resize: "vertical" }} /></div>
      <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Unit Type *</div><select value={f.unit_type} onChange={e => setF(p => ({ ...p, unit_type: e.target.value }))} style={S.inp}>{UNIT_TYPES.map(u => <option key={u}>{u}</option>)}</select></div>
      <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Unit Price ($) *</div><input type="number" min={0} step={0.01} value={f.unit_price} onChange={e => setF(p => ({ ...p, unit_price: e.target.value }))} style={S.inp} /></div>
      <div style={{ marginBottom: 20 }}>
        <div style={S.sLbl}>Default Quantity *</div>
        <input type="number" min={0} step={0.5} value={f.default_quantity} onChange={e => setF(p => ({ ...p, default_quantity: e.target.value }))} style={S.inp} />
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Pre-filled in booking. Multiplied by total visits automatically.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button style={{ ...S.btn(BG, MUTED, BORDER), padding: 14 }} onClick={() => onSave({ ...f, is_active: false })}>Save Inactive</button>
        <button style={{ ...S.btn(BLUE, WHITE), padding: 14 }} onClick={() => onSave({ ...f, is_active: true })}>Save {label}</button>
      </div>
    </>;
  }

  function FreqForm({ data, onSave }) {
    const [f, setF] = useState({ ...data });
    return <>
      <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Label</div><input value={f.label || ""} onChange={e => setF(p => ({ ...p, label: e.target.value }))} style={S.inp} /></div>
      <div style={{ marginBottom: 20 }}><div style={S.sLbl}>Discount (%)</div><input type="number" min={0} max={100} value={f.discount_percent || 0} onChange={e => setF(p => ({ ...p, discount_percent: e.target.value }))} style={S.inp} /></div>
      <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14 }} onClick={() => onSave(f)}>Save</button>
    </>;
  }

  function CouponForm({ data, onSave }) {
    const [f, setF] = useState({ code: "", discount_type: "percent", discount_value: 10, ...data });
    return <>
      <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Code *</div><input value={f.code} onChange={e => setF(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" style={S.inp} /></div>
      <div style={{ marginBottom: 14 }}>
        <div style={S.sLbl}>Type</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["percent","% Percentage"],["flat","$ Flat"]].map(([v, l]) => (
            <div key={v} onClick={() => setF(p => ({ ...p, discount_type: v }))} style={{ flex: 1, border: `2px solid ${f.discount_type === v ? BLUE : BORDER}`, borderRadius: 9, padding: "10px", cursor: "pointer", background: f.discount_type === v ? LIGHT_BLUE : WHITE, color: f.discount_type === v ? BLUE : MUTED, fontWeight: 700, fontSize: 13, textAlign: "center" }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}><div style={S.sLbl}>Value *</div><input type="number" min={0} value={f.discount_value} onChange={e => setF(p => ({ ...p, discount_value: e.target.value }))} style={S.inp} /></div>
      <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14 }} onClick={() => onSave(f)}>Save Coupon</button>
    </>;
  }

  const NavContent = () => (
    <>
      <div style={{ padding: "12px 20px 16px", borderBottom: `1px solid ${BORDER}`, marginBottom: 12 }}>
        {isSuperAdmin
          ? <div style={{ background: `linear-gradient(135deg,${BLUE},#2196f3)`, borderRadius: 8, padding: "6px 12px" }}><span style={{ fontSize: 11, color: WHITE, fontWeight: 800 }}>⭐ Super Admin — {adminUser?.name}</span></div>
          : <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>👤 {adminUser?.name}</div>}
      </div>
      {TABS.map(({ id, label, icon }) => (
        <div key={id} onClick={() => { setTab(id); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", cursor: "pointer", background: tab === id ? LIGHT_BLUE : "transparent", color: tab === id ? BLUE : id === "admins" ? GREEN : MUTED, borderRight: tab === id ? `3px solid ${BLUE}` : "3px solid transparent", fontWeight: tab === id ? 700 : 500, fontSize: 14, marginBottom: 2 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>{label}
          {id === "admins" && <span style={{ marginLeft: "auto", background: GREEN, color: WHITE, borderRadius: 50, padding: "1px 8px", fontSize: 10, fontWeight: 800 }}>SA</span>}
        </div>
      ))}
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${BORDER}`, marginTop: 12 }}>
        <button onClick={onLogout} style={{ ...S.btn(WHITE, MUTED, BORDER), width: "100%", padding: "10px", fontSize: 13 }}>Logout</button>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 82px)" }}>
      {confirm && <ConfirmDel msg={confirm.msg} onYes={confirm.action} onNo={() => setConfirm(null)} />}
      {catModal && <Modal title={catModal.data?.id ? "Edit Category" : "New Category"} onClose={() => setCatModal(null)}><CatForm data={catModal.data} onSave={saveCat} /></Modal>}
      {itemModal && <Modal title={itemModal.data?.id ? "Edit Item" : "New Item"} onClose={() => setItemModal(null)}><ItemForm data={itemModal.data} onSave={saveItem} label="Item" /></Modal>}
      {addonModal && <Modal title={addonModal.data?.id ? "Edit Add-on" : "New Add-on"} onClose={() => setAddonModal(null)}><ItemForm data={addonModal.data} onSave={saveAddon} label="Add-on" /></Modal>}
      {freqModal && <Modal title="Edit Frequency Discount" onClose={() => setFreqModal(null)}><FreqForm data={freqModal.data} onSave={saveFreq} /></Modal>}
      {couponModal && <Modal title={couponModal.data?.id ? "Edit Coupon" : "New Coupon"} onClose={() => setCouponModal(null)}><CouponForm data={couponModal.data} onSave={saveCoupon} /></Modal>}
      {inviteModal && <Modal title="Invite New Admin" onClose={() => setInviteModal(false)}>
        {[["Full Name","name","text","John Smith"],["Email","email","email","john@example.com"],["Password","password","text","StrongPass123"]].map(([l,k,t,p]) => (
          <div key={k} style={{ marginBottom: 14 }}><div style={S.sLbl}>{l}</div><input type={t} value={inviteForm[k]} onChange={e => setInviteForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} style={S.inp} /></div>
        ))}
        <div style={{ background: "#fff8e1", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#7a5c00", marginBottom: 14 }}>⚠️ Add to HARDCODED_ADMINS in App.js after creating.</div>
        <button style={{ ...S.btn(GREEN, WHITE), width: "100%", padding: 14 }} onClick={inviteAdmin}>Create Admin</button>
      </Modal>}
      {resetModal && <Modal title={`Reset Password — ${resetModal.name}`} onClose={() => { setResetModal(null); setResetForm({ newPw: "", confirm: "" }); }}>
        {[["New Password","newPw"],["Confirm","confirm"]].map(([l,k]) => (
          <div key={k} style={{ marginBottom: 14 }}><div style={S.sLbl}>{l}</div><input type="password" value={resetForm[k]} onChange={e => setResetForm(f => ({ ...f, [k]: e.target.value }))} placeholder="••••••••" style={S.inp} /></div>
        ))}
        <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14 }} onClick={resetAdminPw}>Reset Password</button>
      </Modal>}

      {mobile && menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, background: WHITE, overflowY: "auto", paddingTop: 60 }}><NavContent /></div>
        </div>
      )}
      {!mobile && <div style={{ width: 230, background: WHITE, borderRight: `1px solid ${BORDER}`, padding: "24px 0", flexShrink: 0 }}><NavContent /></div>}

      <div style={{ flex: 1, overflowY: "auto", background: BG }}>
        <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: mobile ? "14px 16px" : "18px 28px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
          {mobile && <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>☰</button>}
          <h2 style={{ fontSize: mobile ? 16 : 20, fontWeight: 900 }}>{TABS.find(t => t.id === tab)?.label}</h2>
        </div>

        <div style={{ padding: mobile ? "12px 16px" : "24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mobile ? 10 : 14, marginBottom: 24 }}>
            {[{ icon: "📋", label: "Bookings", value: bookings.length, color: BLUE, bg: LIGHT_BLUE }, { icon: "💰", label: "Revenue", value: fmt(revenue), color: GREEN, bg: LIGHT_GREEN }, { icon: "⏳", label: "Pending", value: bookings.filter(b => b.status === "Pending").length, color: "#e67e22", bg: "#fff8f0" }, { icon: "👥", label: "Clients", value: clients.length, color: BLUE, bg: LIGHT_BLUE }].map(({ icon, label, value, color, bg }) => (
              <div key={label} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: mobile ? 14 : 20, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                <div><div style={{ fontSize: mobile ? 20 : 22, fontWeight: 900, color }}>{value}</div><div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{label}</div></div>
              </div>
            ))}
          </div>

          {tab === "admins" && isSuperAdmin && <>
            <div style={{ background: `linear-gradient(135deg,${BLUE},#2196f3)`, borderRadius: 14, padding: "20px 24px", marginBottom: 20, color: WHITE }}>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.8, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Super Admin Panel</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Manage Admin Accounts</div>
            </div>
            <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5c00", marginBottom: 16 }}>
              ⚠️ After creating, add to <strong>HARDCODED_ADMINS</strong> in App.js.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button style={S.btn(GREEN, WHITE)} onClick={() => setInviteModal(true)}>+ Invite New Admin</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {allAdmins.map(a => (
                <div key={a.id} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <Avatar name={a.name} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{a.name}</div>
                    <div style={{ fontSize: 13, color: MUTED }}>{a.email}</div>
                    <span style={{ background: HARDCODED_ADMINS.find(h => h.id === a.id) ? LIGHT_GREEN : LIGHT_BLUE, color: HARDCODED_ADMINS.find(h => h.id === a.id) ? GREEN : BLUE, borderRadius: 50, padding: "2px 10px", fontSize: 11, fontWeight: 700, marginTop: 4, display: "inline-block" }}>
                      {HARDCODED_ADMINS.find(h => h.id === a.id) ? "✅ Hardcoded" : "⚠️ Session only"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setResetModal(a); setResetForm({ newPw: "", confirm: "" }); }} style={{ ...S.btn(LIGHT_BLUE, BLUE), padding: "8px 14px", fontSize: 12 }}>🔒 Reset PW</button>
                    <button onClick={() => delAdmin(a.id)} style={{ ...S.btn("#fdecea", "#e74c3c"), padding: "8px 14px", fontSize: 12 }}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {tab === "bookings" && <>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search…" style={{ ...S.inp, flex: 1, padding: "10px 14px" }} />
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
              {["All","Pending","Confirmed","Completed","Cancelled"].map(s => { const a = filter === s; const col = SC[s] || BLUE; return <button key={s} onClick={() => setFilter(s)} style={{ background: a ? col : WHITE, color: a ? WHITE : MUTED, border: `1.5px solid ${a ? col : BORDER}`, borderRadius: 50, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{s}</button>; })}
            </div>
            {filtBks.length === 0 && <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 32, color: MUTED, textAlign: "center" }}>No bookings found.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtBks.map(b => (
                <div key={b.id} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: BG }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: LIGHT_BLUE, color: BLUE, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 900 }}>{b.id}</span>
                      <StatusTag s={b.status} />
                    </div>
                    <span style={{ fontSize: 11, color: MUTED }}>{b.date} · {b.time}</span>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <Avatar name={b.clientName} size={36} />
                      <div><div style={{ fontWeight: 800, fontSize: 14 }}>{b.service}</div><div style={{ fontSize: 12, color: MUTED }}>{b.clientName || "Guest"}</div></div>
                      <div style={{ marginLeft: "auto", fontWeight: 900, fontSize: 18, color: BLUE }}>{fmt(b.total)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {["Confirmed","Completed","Cancelled"].filter(s => s !== b.status).map(s => (
                        <button key={s} onClick={() => updBk(b.id, s)} style={{ background: STATUS_CONFIG[s]?.bg || BG, color: STATUS_CONFIG[s]?.color || MUTED, border: `1px solid ${STATUS_CONFIG[s]?.color || MUTED}33`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>→ {s}</button>
                      ))}
                      <button onClick={() => delBk(b.id)} style={{ background: "#fdecea", color: "#e74c3c", border: "1px solid #f5c6cb", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {tab === "clients" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clients.length === 0 && <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 32, color: MUTED, textAlign: "center" }}>No clients yet.</div>}
              {clients.map(c => { const cbks = bookings.filter(b => b.clientId === c.id); return (
                <div key={c.id} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <Avatar name={c.name} size={44} />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 15 }}>{c.name}</div><div style={{ fontSize: 12, color: MUTED }}>{c.email}</div><div style={{ fontSize: 12, color: MUTED }}>{c.phone}</div></div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: BG, borderRadius: 10, padding: 10, textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 900, color: BLUE }}>{cbks.length}</div><div style={{ fontSize: 11, color: MUTED }}>Bookings</div></div>
                    <div style={{ flex: 1, background: BG, borderRadius: 10, padding: 10, textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 900, color: GREEN }}>{fmt(cbks.reduce((s, b) => s + b.total, 0))}</div><div style={{ fontSize: 11, color: MUTED }}>Revenue</div></div>
                  </div>
                  <button onClick={() => delClient(c.id)} style={{ ...S.btn("#fdecea", "#e74c3c"), width: "100%", padding: "9px", fontSize: 13 }}>🗑 Delete</button>
                </div>
              );})}
            </div>
          )}

          {tab === "categories" && <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button style={S.btn(BLUE, WHITE)} onClick={() => setCatModal({ data: {} })}>+ New Category</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ background: `linear-gradient(135deg,${LIGHT_BLUE},${WHITE})`, padding: "20px 16px", textAlign: "center", borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>{cat.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{cat.name}</div>
                  </div>
                  <div style={{ padding: "12px 14px", display: "flex", gap: 8 }}>
                    <button onClick={() => setCatModal({ data: cat })} style={{ ...S.btn(LIGHT_BLUE, BLUE), flex: 1, padding: "8px", fontSize: 12 }}>✏️ Edit</button>
                    <button onClick={() => delCat(cat.id)} style={{ ...S.btn("#fdecea", "#e74c3c"), flex: 1, padding: "8px", fontSize: 12 }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {tab === "items" && <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Select Category</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {categories.map(cat => (
                  <div key={cat.id} onClick={() => setSelCat(cat)} style={{ border: `2px solid ${selCat?.id === cat.id ? BLUE : BORDER}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", background: selCat?.id === cat.id ? LIGHT_BLUE : WHITE, color: selCat?.id === cat.id ? BLUE : MUTED, fontWeight: 700, fontSize: 13 }}>{cat.icon} {cat.name}</div>
                ))}
              </div>
            </div>
            {selCat && <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{selCat.name} — Items</div>
                <button style={S.btn(BLUE, WHITE)} onClick={() => setItemModal({ data: {} })}>+ New Item</button>
              </div>
              {itemsLoading ? <Loader /> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {adminItems.length === 0 && <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 32, color: MUTED, textAlign: "center" }}>No items yet.</div>}
                  {adminItems.map(item => (
                    <div key={item.id} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{item.unit_type} · Default qty: {item.default_quantity}</div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 16, color: GREEN }}>{fmt(item.unit_price)}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setItemModal({ data: item })} style={{ ...S.btn(LIGHT_BLUE, BLUE), padding: "7px 12px", fontSize: 12 }}>✏️</button>
                        <button onClick={() => delItem(item.id)} style={{ ...S.btn("#fdecea", "#e74c3c"), padding: "7px 12px", fontSize: 12 }}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>}
          </>}

          {tab === "addons" && <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Select Category</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {categories.map(cat => (
                  <div key={cat.id} onClick={() => setSelCat(cat)} style={{ border: `2px solid ${selCat?.id === cat.id ? GREEN : BORDER}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", background: selCat?.id === cat.id ? LIGHT_GREEN : WHITE, color: selCat?.id === cat.id ? GREEN : MUTED, fontWeight: 700, fontSize: 13 }}>{cat.icon} {cat.name}</div>
                ))}
              </div>
            </div>
            {selCat && <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{selCat.name} — Add-ons</div>
                <button style={S.btn(GREEN, WHITE)} onClick={() => setAddonModal({ data: {} })}>+ New Add-on</button>
              </div>
              {itemsLoading ? <Loader /> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {adminAddons.length === 0 && <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 32, color: MUTED, textAlign: "center" }}>No add-ons yet.</div>}
                  {adminAddons.map(a => (
                    <div key={a.id} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{a.unit_type} · Default qty: {a.default_quantity}</div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 16, color: GREEN }}>+{fmt(a.unit_price)}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setAddonModal({ data: a })} style={{ ...S.btn(LIGHT_GREEN, GREEN), padding: "7px 12px", fontSize: 12 }}>✏️</button>
                        <button onClick={() => delAddon(a.id)} style={{ ...S.btn("#fdecea", "#e74c3c"), padding: "7px 12px", fontSize: 12 }}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>}
          </>}

          {tab === "frequency" && <>
            <div style={{ background: LIGHT_BLUE, borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: BLUE, fontWeight: 600 }}>
              💡 Set discount % for each frequency. Applied at checkout.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
              {freqs.map(f => (
                <div key={f.id} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ background: f.discount_percent > 0 ? `linear-gradient(135deg,${LIGHT_GREEN},${WHITE})` : BG, padding: "20px", borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{f.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: f.discount_percent > 0 ? GREEN : MUTED, marginTop: 4 }}>{f.discount_percent > 0 ? `${f.discount_percent}% off` : "No discount"}</div>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <button onClick={() => setFreqModal({ data: f })} style={{ ...S.btn(LIGHT_BLUE, BLUE), width: "100%", padding: "9px", fontSize: 13 }}>✏️ Edit Discount</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {tab === "coupons" && <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button style={S.btn(BLUE, WHITE)} onClick={() => setCouponModal({ data: {} })}>+ New Coupon</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
              {coupons.map(c => (
                <div key={c.id} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ background: c.is_active ? `linear-gradient(135deg,${LIGHT_BLUE},${WHITE})` : "#fafafa", padding: "20px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 22, color: c.is_active ? BLUE : MUTED, letterSpacing: 2 }}>{c.code}</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: c.is_active ? GREEN : MUTED, marginTop: 4 }}>{c.discount_type === "percent" ? `${c.discount_value}% off` : `$${c.discount_value} off`}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Used {c.uses_count || 0} times</div>
                    </div>
                    <div style={{ fontSize: 36 }}>🏷️</div>
                  </div>
                  <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => toggleCoupon(c.id)} style={{ background: c.is_active ? LIGHT_GREEN : "#fdecea", color: c.is_active ? GREEN : "#e74c3c", border: "none", borderRadius: 50, padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{c.is_active ? "● Active" : "○ Inactive"}</button>
                    <button onClick={() => setCouponModal({ data: c })} style={{ ...S.btn(LIGHT_BLUE, BLUE), padding: "7px 12px", fontSize: 12 }}>✏️</button>
                    <button onClick={() => delCoupon(c.id)} style={{ ...S.btn("#fdecea", "#e74c3c"), padding: "7px 12px", fontSize: 12 }}>🗑</button>
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

// ── ROUTE GUARDS ──
function PrivateRoute({ user, children }) { return user ? children : <Navigate to="/login" replace />; }
function AdminRoute({ children }) {
  const adminUser = (() => { try { return JSON.parse(sessionStorage.getItem("adminUser")); } catch { return null; } })();
  return adminUser ? children : <Navigate to="/admin-login" replace />;
}

// ── ROOT ──
export default function App() {
  const mobile = useIsMobile();
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem("user")); } catch { return null; } });
  const [adminUser, setAdminUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem("adminUser")); } catch { return null; } });
  const isAdmin = !!adminUser;
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Supabase auth listener — keeps user session in sync ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user && !user) {
        const { data: clientData } = await supabase.from("clients").select("*").eq("email", session.user.email).single();
        const u = { id: session.user.id, name: clientData?.full_name || session.user.email, email: session.user.email, phone: clientData?.phone || "" };
        setUser(u);
        sessionStorage.setItem("user", JSON.stringify(u));
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        sessionStorage.removeItem("user");
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, bkRes, clRes] = await Promise.all([
        supabase.from("service_categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("bookings").select("*, client:clients(full_name,email,phone), item:items(name)").order("scheduled_date", { ascending: false }),
        supabase.from("clients").select("*").order("full_name"),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (bkRes.data) setBookings(bkRes.data.map(b => ({
        id: `YPC${b.id.slice(0, 6).toUpperCase()}`, db_id: b.id,
        clientId: b.client_id, clientName: b.client?.full_name || "Guest", clientEmail: b.client?.email || "",
        service: b.item?.name || "—", date: b.scheduled_date, time: b.scheduled_time,
        total: b.total_price || 0, status: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "Pending",
        freq: b.frequency || "once", extras: [],
      })));
      if (clRes.data) setClients(clRes.data.map(c => ({ id: c.id, name: c.full_name, email: c.email, phone: c.phone || "", password: "" })));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader text="Loading Yahweh Property Care…" />
    </div>
  );

  return (
    <BrowserRouter>
      <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: BG, minHeight: "100vh", color: TEXT }}>
        <header style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: mobile ? "0 16px" : "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: mobile ? 70 : 90, position: "sticky", top: 0, zIndex: 200, boxShadow: "0 2px 12px rgba(27,117,187,0.06)" }}>
          <div onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }}><Logo small={mobile} /></div>
          <nav style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12 }}>
            {!mobile && <>
              {user && !isAdmin && <button onClick={() => window.location.href = "/client"} style={{ background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>👤 My Bookings</button>}
              {!isAdmin && <button style={S.btn(GREEN, WHITE)} onClick={() => window.location.href = "/book"}>+ Book a Clean</button>}
              {!user && !isAdmin && <button style={S.btn(WHITE, BLUE, BLUE)} onClick={() => window.location.href = "/login"}>Login</button>}
              {user && !isAdmin && <button style={S.btn(WHITE, BLUE, BLUE)} onClick={() => { setUser(null); sessionStorage.removeItem("user"); supabase.auth.signOut(); window.location.href = "/login"; }}>Logout</button>}
              {isAdmin && <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: adminUser?.role === "superadmin" ? `linear-gradient(135deg,${BLUE},#2196f3)` : LIGHT_BLUE, borderRadius: 8, padding: "6px 14px" }}>
                  <span style={{ fontSize: 12, color: adminUser?.role === "superadmin" ? WHITE : BLUE, fontWeight: 800 }}>{adminUser?.role === "superadmin" ? "⭐ Super Admin" : "👤 Admin"}: {adminUser?.name}</span>
                </div>
                <button style={S.btn(WHITE, BLUE, BLUE)} onClick={() => { setAdminUser(null); sessionStorage.removeItem("adminUser"); window.location.href = "/login"; }}>Logout</button>
              </div>}
            </>}
            <a href="tel:1300925355" style={{ color: GREEN, fontWeight: 800, textDecoration: "none", fontSize: mobile ? 13 : 14 }}>📞{!mobile && " 1300 925 355"}</a>
          </nav>
        </header>

        <Routes>
          <Route path="/login" element={<LoginScreen onLogin={u => { setUser(u); sessionStorage.setItem("user", JSON.stringify(u)); window.location.href = "/client"; }} onAdmin={() => window.location.href = "/admin-login"} onGuest={() => window.location.href = "/book"} />} />
          <Route path="/admin-login" element={<AdminLogin onLogin={u => { setAdminUser(u); window.location.href = "/admin"; }} onBack={() => window.location.href = "/login"} />} />
          <Route path="/book" element={<BookingApp user={user} categories={categories} onComplete={nb => setBookings(p => [...p, nb])} />} />
          <Route path="/client" element={<PrivateRoute user={user}><ClientDash user={user} bookings={bookings} onLogout={() => { setUser(null); sessionStorage.removeItem("user"); supabase.auth.signOut(); window.location.href = "/login"; }} onBook={() => window.location.href = "/book"} /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDash bookings={bookings} setBookings={setBookings} clients={clients} setClients={setClients} categories={categories} setCategories={setCategories} onLogout={() => { setAdminUser(null); sessionStorage.removeItem("adminUser"); window.location.href = "/login"; }} /></AdminRoute>} />
          {/* ── NEW: set-password route for email verification link ── */}
          <Route path="/set-password" element={<SetPasswordPage onDone={() => {}} />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {mobile && <MobileBottomNav user={user} isAdmin={isAdmin} />}
      </div>
    </BrowserRouter>
  );
}
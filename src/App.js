import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabase";

// ── THEME ──
const BLUE = "#1b75bb", GREEN = "#7eb842", LIGHT_BLUE = "#e8f3fb", LIGHT_GREEN = "#f0f9e8";
const BORDER = "#e0e7ef", MUTED = "#7a90a8", TEXT = "#1a2533", BG = "#f5f7fa", WHITE = "#ffffff";

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => { const fn = () => setM(window.innerWidth < 768); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
  return m;
}

function checkSuperAdmin(u) { return !!(u && u.role === "superadmin"); }
const fmt = n => `A$${Number(n).toFixed(2)}`;

const S = {
  panel: m => ({ background: WHITE, borderRadius: m ? 12 : 16, border: `1px solid ${BORDER}`, padding: m ? 16 : "28px 32px", marginBottom: m ? 12 : 20, boxShadow: "0 2px 12px rgba(27,117,187,0.06)" }),
  secTitle: m => ({ fontSize: m ? 15 : 19, fontWeight: 800, color: TEXT, marginBottom: m ? 14 : 20, paddingBottom: m ? 10 : 14, borderBottom: `2px solid ${BORDER}` }),
  inp: { width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 9, padding: "12px 14px", fontSize: 15, outline: "none", fontFamily: "inherit", color: TEXT, background: WHITE, boxSizing: "border-box" },
  btn: (bg, col, border) => ({ background: bg, color: col, border: border ? `1.5px solid ${border}` : "none", borderRadius: 9, padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }),
  sLbl: { fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8, marginTop: 16 },
};

const STATUS_CONFIG = {
  Pending: { color: "#e67e22", bg: "#fff8f0" },
  Confirmed: { color: BLUE, bg: LIGHT_BLUE },
  Completed: { color: GREEN, bg: LIGHT_GREEN },
  Cancelled: { color: "#e74c3c", bg: "#fdecea" },
};

const TIME_SLOTS = ["7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ── SUPER ADMIN (hardcoded for security) ──
const SUPER_ADMIN = { id: "super", name: "Ron_admin", email: "ron.web108@gmail.com", password: "Ron@!two3@#", role: "superadmin" };
const HARDCODED_ADMINS = [
  { id: "a001", name: "Alex Yogarajah", email: "alex@yahwehpc.com.au", password: "Yahweh219@#", role: "admin" },
];

// ── PRICE CALC ──
function calcPrice(svc, beds, baths, freq, extras, couponPct) {
  if (!svc) return { subtotal: 0, discAmt: 0, couponDisc: 0, gst: 0, total: 0 };
  const isNDIS = svc.id === "ndis";
  const roomAdd = svc.hasRooms ? (beds - 1) * 20 + (baths - 1) * 15 : 0;
  const extTotal = extras.reduce((s, e) => s + Number(e.price), 0);
  const sub = Number(svc.base) + roomAdd + extTotal;
  const disc = freq?.disc > 0 ? Math.round(sub * freq.disc / 100) : 0;
  const coup = couponPct > 0 ? Math.round((sub - disc) * couponPct / 100) : 0;
  const afterDisc = sub - disc - coup;
  const gst = isNDIS ? 0 : Math.round(afterDisc * 0.10 * 100) / 100;
  return { subtotal: sub, discAmt: disc, couponDisc: coup, gst, total: afterDisc + gst };
}

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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: WHITE, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
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
      <div style={{ width: 40, height: 40, border: `4px solid ${BORDER}`, borderTop: `4px solid ${BLUE}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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

// ── SIDEBAR ──
function Sidebar({ bk, coupon, setCoupon, couponPct, onApply, couponMsg }) {
  const { svc, beds, baths, freq, extras } = bk;
  const { subtotal, discAmt, couponDisc, gst, total } = calcPrice(svc, beds, baths, freq, extras, couponPct);
  const isNDIS = svc?.id === "ndis";
  return (
    <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", position: "sticky", top: 82, boxShadow: "0 4px 24px rgba(27,117,187,0.10)" }}>
      <div style={{ background: `linear-gradient(135deg,${BLUE},#2196f3)`, padding: "20px 22px", color: WHITE }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Service Summary</div>
        <div style={{ fontSize: 30, fontWeight: 900 }}>{fmt(total)}</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{isNDIS ? "GST Free (NDIS)" : "Inc. 10% GST"}</div>
      </div>
      <div style={{ padding: 20 }}>
        {!svc ? <div style={{ color: MUTED, fontSize: 13, textAlign: "center", padding: "20px 0" }}>Select a service to see pricing</div> : <>
          {[["Cleaning Type", svc.name], ["Your Home", svc.hasRooms ? `${beds} bed, ${baths} bath` : "Flat rate"], ["Frequency", freq?.label || ""], ["Extras", extras.length ? extras.map(e => e.name).join(", ") : "—"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9, fontSize: 13 }}>
              <span style={{ color: MUTED }}>{k}</span>
              <span style={{ fontWeight: 600, color: TEXT, textAlign: "right", maxWidth: "55%", fontSize: 12 }}>{v}</span>
            </div>
          ))}
          <div style={{ background: BG, borderRadius: 10, padding: "14px 16px", marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span style={{ color: MUTED }}>Sub Total</span><span style={{ fontWeight: 700 }}>{fmt(subtotal)}</span></div>
            {discAmt > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: GREEN }}><span>Discount</span><span style={{ fontWeight: 700 }}>-{fmt(discAmt)}</span></div>}
            {couponDisc > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: GREEN }}><span>Promo</span><span style={{ fontWeight: 700 }}>-{fmt(couponDisc)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: isNDIS ? GREEN : MUTED }}><span>GST (10%)</span><span style={{ fontWeight: 700 }}>{isNDIS ? "GST Free" : fmt(gst)}</span></div>
            <hr style={{ border: "none", borderTop: `1px dashed ${BORDER}`, margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 800, fontSize: 15 }}>Total (AUD)</span><span style={{ fontWeight: 900, fontSize: 22, color: BLUE }}>{fmt(total)}</span></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Discount code" style={{ ...S.inp, flex: 1, fontSize: 13, padding: "9px 12px" }} />
            <button onClick={onApply} style={S.btn(BLUE, WHITE)}>Apply</button>
          </div>
          {couponMsg && <div style={{ fontSize: 12, marginTop: 6, color: couponMsg.ok ? GREEN : "#e74c3c", fontWeight: 600 }}>{couponMsg.text}</div>}
        </>}
      </div>
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED, borderTop: `1px solid ${BORDER}` }}>
        <a href="tel:1300925355" style={{ color: GREEN, fontWeight: 800, textDecoration: "none" }}>📞 1300 925 355</a>
      </div>
    </div>
  );
}

function MobilePriceStrip({ total, step, onNext, onBack }) {
  return (
    <div style={{ position: "fixed", bottom: 56, left: 0, right: 0, background: WHITE, borderTop: `1px solid ${BORDER}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 200, boxShadow: "0 -2px 10px rgba(0,0,0,0.06)" }}>
      <div>
        <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>Total (AUD)</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: BLUE }}>{fmt(total)}</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {step > 1 && <button style={{ ...S.btn(WHITE, BLUE, BLUE), padding: "10px 16px", fontSize: 13 }} onClick={onBack}>← Back</button>}
        <button style={{ ...S.btn(step < 5 ? BLUE : GREEN, WHITE), padding: "10px 20px", fontSize: 13 }} onClick={onNext}>
          {step < 5 ? "Continue →" : `Pay ${fmt(total)}`}
        </button>
      </div>
    </div>
  );
}

// ── BOOKING APP ──
function BookingApp({ user, services, extras, coupons, freqs, onComplete }) {
  const mobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponPct, setCouponPct] = useState(0);
  const [couponId, setCouponId] = useState(null);
  const [couponMsg, setCouponMsg] = useState(null);
  const [done, setDone] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const defFreq = freqs.find(f => f.id === "weekly") || freqs[0] || { id: "once", label: "One Time", disc: 0 };
  const [bk, setBk] = useState({
    svc: services[0] || null, beds: 1, baths: 1, freq: defFreq, extras: [],
    date: null, time: "9:00 AM",
    firstName: user ? user.name.split(" ")[0] : "",
    lastName: user ? user.name.split(" ").slice(1).join(" ") : "",
    email: user ? user.email : "", phone: user ? user.phone || "" : "",
    address: "", suburb: "", state: "NSW", postcode: "", notes: "",
    cardName: "", cardNum: "", cardExp: "", cardCvv: "",
  });

  const { subtotal, discAmt, gst, total } = calcPrice(bk.svc, bk.beds, bk.baths, bk.freq, bk.extras, couponPct);
  const isNDIS = bk.svc?.id === "ndis";
  const set = k => e => setBk(p => ({ ...p, [k]: e.target.value }));
  const setV = (k, v) => setBk(p => ({ ...p, [k]: v }));
  const togExtra = ex => { const has = bk.extras.find(e => e.id === ex.id); setV("extras", has ? bk.extras.filter(e => e.id !== ex.id) : [...bk.extras, ex]); };

  async function applyC() {
    const cp = coupons.find(c => c.code === coupon && c.active);
    if (cp) {
      setCouponPct(cp.disc);
      setCouponId(cp.id || null);
      setCouponMsg({ ok: true, text: `✓ ${cp.disc}% discount applied!` });
    } else {
      setCouponMsg({ ok: false, text: "✗ Invalid or inactive code." });
    }
  }

  const VALS = [null, () => !!bk.svc, () => !!bk.date && !!bk.time, () => !!(bk.firstName && bk.lastName && bk.email && bk.phone && bk.address && bk.suburb && bk.postcode), () => !!(bk.cardName && bk.cardNum.length >= 16 && bk.cardExp && bk.cardCvv.length >= 3), () => true];
  const ERRS = ["", "Please select a cleaning service.", "Please select a date and time.", "Please fill all required fields.", "Please complete payment details.", ""];

  function next() {
    if (!VALS[step]()) { setError(ERRS[step]); window.scrollTo(0, 0); return; }
    setError("");
    if (step === 5) { submit(); return; }
    const ns = step + 1; setStep(ns); setMaxStep(m => Math.max(m, ns)); window.scrollTo(0, 0);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const fullName = [bk.firstName, bk.lastName].join(" ");
      const address = [bk.address, bk.suburb, bk.state, bk.postcode].filter(Boolean).join(", ");

      // 1. Upsert client
      const { data: clientData, error: clientErr } = await supabase
        .from("clients")
        .upsert({ full_name: fullName, email: bk.email, phone: bk.phone, address: bk.address, city: bk.suburb, state: bk.state, zip: bk.postcode, notes: bk.notes }, { onConflict: "email" })
        .select().single();
      if (clientErr) throw clientErr;

      // 2. Insert booking
      const { data: bookingData, error: bookingErr } = await supabase
        .from("bookings")
        .insert({
          client_id: clientData.id,
          service_id: bk.svc.db_id || null,
          extras: bk.extras.map(e => e.id),
          coupon_id: couponId,
          frequency: bk.freq.id,
          scheduled_date: bk.date.toISOString().split("T")[0],
          scheduled_time: bk.time,
          status: "pending",
          subtotal,
          discount_amount: discAmt + (calcPrice(bk.svc, bk.beds, bk.baths, bk.freq, bk.extras, couponPct).couponDisc || 0),
          total_price: total,
          notes: bk.notes,
        })
        .select().single();
      if (bookingErr) throw bookingErr;

      // 3. Increment coupon use
      if (couponId) {
        await supabase.rpc("increment_coupon_uses", { coupon_id: couponId });
      }

      const bookingId = `YPC${bookingData.id.slice(0, 6).toUpperCase()}`;
      const { couponDisc } = calcPrice(bk.svc, bk.beds, bk.baths, bk.freq, bk.extras, couponPct);

      // 4. Send emails via Edge Function
      try {
        const emailPayload = {
          type: "both",
          booking: {
            bookingId,
            clientName: fullName,
            clientEmail: bk.email,
            phone: bk.phone,
            service: bk.svc.name,
            date: bk.date.toISOString().split("T")[0],
            time: bk.time,
            address,
            freq: bk.freq.label,
            extras: bk.extras.map(e => e.name),
            notes: bk.notes,
            subtotal,
            discountAmount: discAmt + couponDisc,
            gst,
            total,
            isNDIS: bk.svc.id === "ndis",
          },
        };
        console.log("Sending email payload:", emailPayload);
        const emailRes = await fetch(
          "https://nsvzbhnqmyqpsehueqhu.supabase.co/functions/v1/send-booking-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(emailPayload),
          }
        );
        const emailResult = await emailRes.json();
        console.log("Email result:", emailResult);
      } catch (emailErr) {
        console.warn("Email sending failed (booking still saved):", emailErr);
      }

      const nb = {
        id: bookingId,
        clientId: clientData.id,
        clientName: fullName,
        clientEmail: bk.email,
        service: bk.svc.name,
        date: bk.date.toISOString().split("T")[0],
        time: bk.time,
        address,
        total,
        status: "Confirmed",
        freq: bk.freq.label,
        extras: bk.extras.map(e => e.name),
      };

      onComplete(nb);
      setDone(true);
    } catch (err) {
      console.error("Booking error:", err);
      setError("Failed to save booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date();
  const dates = Array.from({ length: 21 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + i); return d; });
  const STEPS = ["Services", "Schedule", "Location", "Payment", "Confirm"];

  if (done) return (
    <div style={{ maxWidth: 540, margin: mobile ? "0 auto" : "48px auto", padding: 16, paddingBottom: mobile ? 90 : 16 }}>
      <div style={{ ...S.panel(mobile), textAlign: "center", padding: mobile ? "24px 20px" : "52px 36px" }}>
        <div style={{ width: 72, height: 72, background: LIGHT_GREEN, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>✅</div>
        <h2 style={{ fontSize: mobile ? 22 : 26, fontWeight: 900, color: GREEN, marginBottom: 8 }}>Booking Confirmed!</h2>
        <p style={{ color: MUTED, marginBottom: 20, fontSize: 14 }}>Confirmation sent to <strong style={{ color: BLUE }}>{bk.email}</strong></p>
        <div style={{ background: BG, borderRadius: 12, padding: 16, textAlign: "left", marginBottom: 16 }}>
          {[["Service", bk.svc.name], ["Date", bk.date ? bk.date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"], ["Time", bk.time], ["GST", isNDIS ? "GST Free" : fmt(gst)], ["Total (AUD)", fmt(total)]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}><span style={{ color: MUTED }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
          ))}
        </div>
        <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5c00", marginBottom: 20 }}>⏰ Our team will call <strong>{bk.phone}</strong> within 2 hours.</div>
        <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14 }} onClick={() => { setDone(false); setStep(1); setMaxStep(1); }}>Book Another Clean</button>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: mobile ? 130 : 0 }}>
      {/* Step progress bar */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", padding: mobile ? "0 8px" : "0 28px" }}>
          {STEPS.map((label, i) => { const n = i + 1, active = step === n, done2 = step > n, can = n <= maxStep; return (
            <div key={n} onClick={() => can && setStep(n)} style={{ display: "flex", alignItems: "center", gap: 6, padding: mobile ? "12px 8px" : "16px 14px 16px 0", borderBottom: `3px solid ${active ? BLUE : done2 ? GREEN : "transparent"}`, color: active ? BLUE : done2 ? GREEN : "#bbb", cursor: can ? "pointer" : "default", fontSize: mobile ? 11 : 13, fontWeight: 700, marginRight: mobile ? 4 : 16, whiteSpace: "nowrap" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: active ? BLUE : done2 ? GREEN : "#e8ecf0", color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{done2 ? "✓" : n}</span>
              {!mobile || active ? label : ""}
            </div>
          );})}
        </div>
      </div>

      {error && <div style={{ maxWidth: 1080, margin: "10px auto 0", padding: "0 16px" }}><div style={{ background: "#fdecea", border: "1px solid #f5c6cb", borderRadius: 9, padding: "10px 14px", color: "#c0392b", fontSize: 14 }}>⚠️ {error}</div></div>}

      {mobile && bk.svc && (
        <div onClick={() => setShowSummary(!showSummary)} style={{ margin: "12px 16px 0", background: LIGHT_BLUE, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 13, color: BLUE, fontWeight: 700 }}>📋 View Summary — {fmt(total)}</div>
          <span style={{ color: BLUE }}>›</span>
        </div>
      )}

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: mobile ? 16 : "24px 28px", display: mobile ? "block" : "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <div>
          {step === 1 && <>
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>What kind of clean?</div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(130px,1fr))", gap: mobile ? 10 : 12 }}>
                {services.map(svc => { const a = bk.svc?.id === svc.id; return (
                  <div key={svc.id} onClick={() => setV("svc", svc)} style={{ border: `2px solid ${a ? BLUE : BORDER}`, borderRadius: 12, padding: mobile ? "14px 10px" : "20px 12px", textAlign: "center", cursor: "pointer", background: a ? LIGHT_BLUE : WHITE }}>
                    <div style={{ fontSize: mobile ? 26 : 32, marginBottom: 8 }}>{svc.icon}</div>
                    <div style={{ fontSize: mobile ? 12 : 13, fontWeight: 700, color: a ? BLUE : TEXT }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: a ? BLUE : MUTED, marginTop: 3 }}>from {fmt(svc.base)}</div>
                    {a && <div style={{ marginTop: 6 }}><span style={{ background: BLUE, color: WHITE, borderRadius: 50, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>✓</span></div>}
                  </div>
                );})}
              </div>
            </div>

            {bk.svc?.hasRooms && (
              <div style={S.panel(mobile)}>
                <div style={S.secTitle(mobile)}>Bedrooms & Bathrooms</div>
                {[{ label: "🛏 Bedrooms", key: "beds", max: 8 }, { label: "🛁 Bathrooms", key: "baths", max: 6 }].map(r => (
                  <div key={r.key} style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{r.label}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Array.from({ length: r.max }, (_, i) => i + 1).map(n => (
                        <div key={n} onClick={() => setV(r.key, n)} style={{ width: 44, height: 44, borderRadius: 10, border: `2px solid ${bk[r.key] === n ? BLUE : BORDER}`, background: bk[r.key] === n ? BLUE : WHITE, color: bk[r.key] === n ? WHITE : TEXT, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 800, fontSize: 16 }}>{n}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>How often?</div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill,minmax(170px,1fr))", gap: mobile ? 10 : 12 }}>
                {freqs.map(f => { const a = bk.freq.id === f.id; return (
                  <div key={f.id} onClick={() => setV("freq", f)} style={{ border: `2px solid ${a ? GREEN : BORDER}`, borderRadius: 12, padding: mobile ? 14 : "16px 18px", cursor: "pointer", background: a ? LIGHT_GREEN : WHITE }}>
                    <div style={{ fontWeight: 800, fontSize: mobile ? 13 : 14, color: a ? GREEN : TEXT }}>{f.label}</div>
                    {f.disc > 0 && <div style={{ marginTop: 5 }}><span style={{ background: GREEN, color: WHITE, borderRadius: 50, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>{f.disc}% off</span></div>}
                  </div>
                );})}
              </div>
            </div>

            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Extra services</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {extras.map(ex => { const a = bk.extras.some(e => e.id === ex.id); return (
                  <div key={ex.id} onClick={() => togExtra(ex)} style={{ border: `2px solid ${a ? BLUE : BORDER}`, borderRadius: 12, padding: 14, cursor: "pointer", background: a ? LIGHT_BLUE : WHITE, display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{ex.icon}</span>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: a ? BLUE : TEXT }}>{ex.name}</div><div style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>+{fmt(ex.price)}</div></div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: a ? BLUE : BORDER, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, flexShrink: 0 }}>{a && "✓"}</div>
                  </div>
                );})}
              </div>
            </div>
          </>}

          {step === 2 && (
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Choose date & time</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: mobile ? 4 : 6, marginBottom: 20 }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: MUTED, fontWeight: 800, padding: "3px 0" }}>{d}</div>)}
                {dates.map((d, i) => { const a = bk.date && d.toDateString() === bk.date.toDateString(); const past = d < today && d.toDateString() !== today.toDateString(); return (
                  <div key={i} onClick={() => !past && setV("date", d)} style={{ border: `2px solid ${a ? BLUE : BORDER}`, borderRadius: 8, padding: mobile ? "8px 2px" : "10px 4px", textAlign: "center", cursor: past ? "not-allowed" : "pointer", background: a ? BLUE : past ? "#f8f8f8" : WHITE, opacity: past ? 0.4 : 1 }}>
                    <div style={{ fontSize: 9, color: a ? "rgba(255,255,255,0.8)" : MUTED }}>{d.toLocaleString("default", { month: "short" })}</div>
                    <div style={{ fontSize: mobile ? 13 : 16, fontWeight: 900, color: a ? WHITE : past ? "#ccc" : TEXT }}>{d.getDate()}</div>
                  </div>
                );})}
              </div>
              <div style={S.sLbl}>Preferred time</div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(3,1fr)" : "repeat(auto-fill,minmax(100px,1fr))", gap: mobile ? 8 : 10 }}>
                {TIME_SLOTS.map(t => { const a = bk.time === t; return <div key={t} onClick={() => setV("time", t)} style={{ border: `2px solid ${a ? BLUE : BORDER}`, borderRadius: 10, padding: mobile ? "11px 6px" : 12, textAlign: "center", cursor: "pointer", background: a ? BLUE : WHITE, color: a ? WHITE : MUTED, fontWeight: a ? 800 : 500, fontSize: mobile ? 12 : 13 }}>{t}</div>; })}
              </div>
              {bk.date && <div style={{ marginTop: 16, background: LIGHT_GREEN, border: `1px solid ${GREEN}44`, borderRadius: 10, padding: "12px 14px", color: GREEN, fontSize: 13, fontWeight: 700 }}>✅ {bk.date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} at {bk.time}</div>}
            </div>
          )}

          {step === 3 && (
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Your details</div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 12 : 16 }}>
                {[["First Name", "firstName", "text", "Jane"], ["Last Name", "lastName", "text", "Smith"], ["Email", "email", "email", "jane@example.com"], ["Phone", "phone", "tel", "04XX XXX XXX"]].map(([l, k, t, ph]) => (
                  <div key={k}><div style={S.sLbl}>{l} *</div><input type={t} value={bk[k]} onChange={set(k)} placeholder={ph} style={S.inp} /></div>
                ))}
              </div>
              <div style={S.sLbl}>Street Address *</div>
              <input value={bk.address} onChange={set("address")} placeholder="123 Main Street" style={S.inp} />
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr 140px", gap: mobile ? 12 : 16, marginTop: 4 }}>
                <div><div style={S.sLbl}>Suburb *</div><input value={bk.suburb} onChange={set("suburb")} placeholder="Blacktown" style={S.inp} /></div>
                <div><div style={S.sLbl}>State</div><select value={bk.state} onChange={set("state")} style={S.inp}>{["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"].map(s => <option key={s}>{s}</option>)}</select></div>
                {!mobile && <div><div style={S.sLbl}>Postcode *</div><input value={bk.postcode} onChange={set("postcode")} maxLength={4} placeholder="2148" style={S.inp} /></div>}
              </div>
              {mobile && <div style={{ marginTop: 12 }}><div style={S.sLbl}>Postcode *</div><input value={bk.postcode} onChange={set("postcode")} maxLength={4} placeholder="2148" style={{ ...S.inp, width: 140 }} /></div>}
              <div style={S.sLbl}>Special Instructions</div>
              <textarea value={bk.notes} onChange={set("notes")} rows={3} placeholder="Key location, gate code, pets…" style={{ ...S.inp, resize: "vertical" }} />
            </div>
          )}

          {step === 4 && (
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Secure Payment</div>
              <div style={{ background: BG, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}><span style={{ color: MUTED }}>Service</span><span style={{ fontWeight: 700 }}>{bk.svc.name}</span></div>
                {discAmt > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: GREEN, marginBottom: 6 }}><span>Discount</span><span style={{ fontWeight: 700 }}>-{fmt(discAmt)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span style={{ color: MUTED }}>GST</span><span style={{ fontWeight: 700 }}>{isNDIS ? "GST Free" : fmt(gst)}</span></div>
                <hr style={{ border: "none", borderTop: `1px dashed ${BORDER}`, margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 800 }}>Total (AUD)</span><span style={{ fontWeight: 900, fontSize: 22, color: BLUE }}>{fmt(total)}</span></div>
              </div>
              <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Name on card *</div><input value={bk.cardName} onChange={set("cardName")} placeholder="Jane Smith" style={S.inp} /></div>
              <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Card number *</div><input value={bk.cardNum} onChange={e => setV("cardNum", e.target.value.replace(/\D/g, "").slice(0, 16))} placeholder="1234 5678 9012 3456" style={S.inp} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><div style={S.sLbl}>Expiry *</div><input value={bk.cardExp} onChange={set("cardExp")} placeholder="MM/YY" maxLength={5} style={S.inp} /></div>
                <div><div style={S.sLbl}>CVV *</div><input value={bk.cardCvv} onChange={e => setV("cardCvv", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" maxLength={4} style={S.inp} /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED }}>🔒 Protected by 256-bit SSL</div>
            </div>
          )}

          {step === 5 && (
            <div style={S.panel(mobile)}>
              <div style={S.secTitle(mobile)}>Review & Confirm</div>
              {[
                { title: "Service", rows: [["Service", bk.svc.name], ["Property", bk.svc.hasRooms ? `${bk.beds} bed, ${bk.baths} bath` : "Flat rate"], ["Frequency", bk.freq.label], ["Extras", bk.extras.length ? bk.extras.map(e => e.name).join(", ") : "None"]] },
                { title: "Schedule", rows: [["Date", bk.date ? bk.date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"], ["Time", bk.time]] },
                { title: "Location", rows: [["Name", [bk.firstName, bk.lastName].join(" ")], ["Address", [bk.address, bk.suburb, bk.state, bk.postcode].filter(Boolean).join(", ")], ["Email", bk.email], ["Phone", bk.phone]] },
                { title: "Pricing", rows: [["Subtotal", fmt(subtotal)], ["Discount", discAmt > 0 ? `-${fmt(discAmt)}` : "—"], ["GST", isNDIS ? "GST Free" : fmt(gst)], ["Total (AUD)", fmt(total)]] },
              ].map(sec => (
                <div key={sec.title} style={{ background: BG, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: BLUE, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{sec.title}</div>
                  {sec.rows.map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 14 }}><span style={{ color: MUTED }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span></div>)}
                </div>
              ))}
              <div style={{ background: LIGHT_BLUE, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#1a3d60" }}>✅ By confirming you agree to Yahweh Property Care's Terms of Service.</div>
            </div>
          )}

          {!mobile && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {step > 1 ? <button style={S.btn(WHITE, BLUE, BLUE)} onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0); }}>← Back</button> : <span />}
              {step < 5
                ? <button style={S.btn(BLUE, WHITE)} onClick={next}>Continue →</button>
                : <button style={{ ...S.btn(GREEN, WHITE), fontSize: 15, opacity: submitting ? 0.7 : 1 }} onClick={next} disabled={submitting}>{submitting ? "Saving…" : `✅ Confirm & Pay ${fmt(total)}`}</button>}
            </div>
          )}
        </div>
        {!mobile && <Sidebar bk={bk} coupon={coupon} setCoupon={setCoupon} couponPct={couponPct} onApply={applyC} couponMsg={couponMsg} />}
      </div>
      {mobile && <MobilePriceStrip total={total} step={step} onNext={next} onBack={() => { setStep(s => s - 1); window.scrollTo(0, 0); }} />}
    </div>
  );
}

// ── CLIENT DASHBOARD ──
function ClientDash({ user, bookings, onLogout, onBook }) {
  const mobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("upcoming");
  const mine = bookings.filter(b => b.clientId === user.id || b.clientEmail === user.email);
  const upcoming = mine.filter(b => ["Confirmed", "Pending"].includes(b.status));
  const past = mine.filter(b => ["Completed", "Cancelled"].includes(b.status));
  const totalSpent = past.filter(b => b.status === "Completed").reduce((s, b) => s + b.total, 0);
  const nextBooking = [...upcoming].sort((a, b) => new Date(a.date) - new Date(b.date))[0]; // eslint-disable-line no-unused-vars

  return (
    <div style={{ background: BG, minHeight: "100vh", paddingBottom: mobile ? 90 : 40 }}>
      <div style={{ background: `linear-gradient(135deg,${BLUE} 0%,#1565a8 60%,#0d4a7a 100%)`, padding: mobile ? "24px 16px 80px" : "32px 40px 90px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: mobile ? 52 : 64, height: mobile ? 52 : 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: mobile ? 20 : 26, color: WHITE, flexShrink: 0 }}>
                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Welcome back</div>
                <div style={{ fontSize: mobile ? 20 : 26, fontWeight: 900, color: WHITE }}>{user.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onBook} style={{ background: GREEN, color: WHITE, border: "none", borderRadius: 10, padding: mobile ? "10px 16px" : "12px 22px", fontSize: mobile ? 13 : 14, fontWeight: 700, cursor: "pointer" }}>+ New Booking</button>
              {!mobile && <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", color: WHITE, border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Logout</button>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: mobile ? "-40px 16px 0" : "-44px auto 0", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: mobile ? 10 : 16 }}>
          {[{ icon: "📋", label: "Total Bookings", value: mine.length, color: BLUE }, { icon: "✅", label: "Completed", value: past.filter(b => b.status === "Completed").length, color: GREEN }, { icon: "💰", label: "Total Spent", value: fmt(totalSpent), color: "#9b59b6" }].map(({ icon, label, value, color }) => (
            <div key={label} style={{ background: WHITE, borderRadius: 14, padding: mobile ? "14px 12px" : 20, boxShadow: "0 8px 32px rgba(27,117,187,0.12)", border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: mobile ? 22 : 28, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: mobile ? 18 : 24, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: mobile ? 11 : 13, fontWeight: 700, color: TEXT, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "16px 16px 0" : "24px 0 0" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: WHITE, borderRadius: 12, padding: 6, border: `1px solid ${BORDER}` }}>
          {[["upcoming", `Upcoming (${upcoming.length})`], ["past", `History (${past.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, background: activeTab === id ? BLUE : "transparent", color: activeTab === id ? WHITE : MUTED, border: "none", borderRadius: 9, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{label}</button>
          ))}
        </div>

        {activeTab === "upcoming" && (upcoming.length === 0
          ? <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: TEXT, marginBottom: 6 }}>No upcoming bookings</div>
              <button onClick={onBook} style={{ background: BLUE, color: WHITE, border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 12 }}>Book a Clean</button>
            </div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{upcoming.map(b => <BookingCard key={b.id} b={b} mobile={mobile} />)}</div>
        )}

        {activeTab === "past" && (past.length === 0
          ? <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧹</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: TEXT, marginBottom: 6 }}>No past bookings yet</div>
            </div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{past.map(b => <BookingCard key={b.id} b={b} mobile={mobile} />)}</div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ b, mobile }) {
  return (
    <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(27,117,187,0.06)" }}>
      <div style={{ background: b.status === "Completed" ? LIGHT_GREEN : b.status === "Cancelled" ? "#fdecea" : LIGHT_BLUE, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: BLUE }}>{b.service}</span>
        <StatusTag s={b.status} />
      </div>
      <div style={{ padding: mobile ? 14 : "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
          <div style={{ fontSize: 13, color: MUTED }}>{b.date} · {b.time}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: BLUE }}>{fmt(b.total)}</div>
        </div>
        {b.extras && b.extras.length > 0 && <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}><span style={{ fontWeight: 700, color: GREEN }}>Extras: </span>{b.extras.join(", ")}</div>}
      </div>
    </div>
  );
}

// ── ADMIN FORMS ──
function SvcForm({ data, onSave }) {
  const [f, setF] = useState({ ...data });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return <>
    {[["Service Name", "name", "text", "e.g. Window Cleaning"], ["Base Price ($)", "base", "number", "119"]].map(([l, k, t, p]) => (
      <div key={k} style={{ marginBottom: 14 }}><div style={S.sLbl}>{l}</div><input type={t} value={f[k] || ""} onChange={set(k)} placeholder={p} style={S.inp} /></div>
    ))}
    <div style={{ marginBottom: 20 }}>
      <div style={S.sLbl}>Room-based pricing?</div>
      <div style={{ display: "flex", gap: 10 }}>
        {[["Yes", true], ["No", false]].map(([l, v]) => (
          <div key={l} onClick={() => setF(p => ({ ...p, hasRooms: v }))} style={{ border: `2px solid ${f.hasRooms === v ? BLUE : BORDER}`, borderRadius: 9, padding: "9px 24px", cursor: "pointer", background: f.hasRooms === v ? LIGHT_BLUE : WHITE, color: f.hasRooms === v ? BLUE : MUTED, fontWeight: 700, fontSize: 13 }}>{l}</div>
        ))}
      </div>
    </div>
    <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14 }} onClick={() => onSave(f)}>Save Service</button>
  </>;
}

function ExtraForm({ data, onSave }) {
  const [f, setF] = useState({ ...data });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return <>
    {[["Add-on Name", "name", "text", "e.g. Steam Cleaning"], ["Price ($)", "price", "number", "50"]].map(([l, k, t, p]) => (
      <div key={k} style={{ marginBottom: 14 }}><div style={S.sLbl}>{l}</div><input type={t} value={f[k] || ""} onChange={set(k)} placeholder={p} style={S.inp} /></div>
    ))}
    <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14, marginTop: 6 }} onClick={() => onSave(f)}>Save Add-on</button>
  </>;
}

function CouponForm({ data, onSave }) {
  const [f, setF] = useState({ ...data });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return <>
    <div style={{ marginBottom: 14 }}><div style={S.sLbl}>Coupon Code</div><input value={f.code || ""} onChange={e => setF(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" style={S.inp} /></div>
    <div style={{ marginBottom: 20 }}><div style={S.sLbl}>Discount (%)</div><input type="number" min={1} max={100} value={f.disc || ""} onChange={set("disc")} placeholder="10" style={S.inp} /></div>
    <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14 }} onClick={() => onSave(f)}>Save Coupon</button>
  </>;
}

function ClientForm({ data, onSave }) {
  const [f, setF] = useState({ ...data });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return <>
    {[["Full Name", "name", "text", "Jane Smith"], ["Email", "email", "email", "jane@example.com"], ["Phone", "phone", "tel", "04XX XXX XXX"], ["Password", "password", "text", "pass123"]].map(([l, k, t, p]) => (
      <div key={k} style={{ marginBottom: 14 }}><div style={S.sLbl}>{l}</div><input type={t} value={f[k] || ""} onChange={set(k)} placeholder={p} style={S.inp} /></div>
    ))}
    <button style={{ ...S.btn(BLUE, WHITE), width: "100%", padding: 14, marginTop: 6 }} onClick={() => onSave(f)}>Save Client</button>
  </>;
}

// ── ADMIN DASHBOARD ──
function AdminDash({ bookings, setBookings, clients, setClients, services, setServices, extras, setExtras, coupons, setCoupons, freqs, setFreqs, onLogout }) {
  const mobile = useIsMobile();
  const adminUser = (() => { try { const a = sessionStorage.getItem("adminUser"); return a ? JSON.parse(a) : null; } catch (e) { return null; } })();
  const isSuperAdmin = checkSuperAdmin(adminUser); // eslint-disable-line no-unused-vars
  const [tab, setTab] = useState("bookings");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [svcModal, setSvcModal] = useState(null);
  const [extraModal, setExtraModal] = useState(null);
  const [couponModal, setCouponModal] = useState(null);
  const [clientModal, setClientModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false); // eslint-disable-line no-unused-vars

  const SC = { Pending: "#e67e22", Confirmed: BLUE, Completed: GREEN, Cancelled: "#e74c3c" };
  const TABS = [
    { id: "bookings", label: "Bookings", icon: "📋" },
    { id: "clients", label: "Clients", icon: "👥" },
    { id: "services", label: "Services", icon: "🏠" },
    { id: "extras", label: "Add-ons", icon: "✨" },
    { id: "coupons", label: "Coupons", icon: "🏷️" },
    { id: "discounts", label: "Discounts", icon: "💸" },
  ];

  const filtBks = bookings.filter(b => {
    const ms = filter === "All" || b.status === filter;
    const mq = !search || [b.service, b.id, b.clientName || ""].some(x => x.toLowerCase().includes(search.toLowerCase()));
    return ms && mq;
  });

  const revenue = bookings.filter(b => b.status === "Completed").reduce((s, b) => s + b.total, 0);

  // ── Supabase write helpers ──
  async function updBk(id, status) {
    const dbId = bookings.find(b => b.id === id)?.db_id;
    if (dbId) await supabase.from("bookings").update({ status: status.toLowerCase() }).eq("id", dbId);
    setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
  }

  async function delBk(id) {
    setConfirm({ msg: `Delete booking ${id}?`, action: async () => {
      const dbId = bookings.find(b => b.id === id)?.db_id;
      if (dbId) await supabase.from("bookings").delete().eq("id", dbId);
      setBookings(p => p.filter(b => b.id !== id));
      setConfirm(null);
    }});
  }

  async function delClient(id) {
    setConfirm({ msg: "Delete this client and their bookings?", action: async () => {
      await supabase.from("bookings").delete().eq("client_id", id);
      await supabase.from("clients").delete().eq("id", id);
      setClients(p => p.filter(c => c.id !== id));
      setBookings(p => p.filter(b => b.clientId !== id));
      setConfirm(null);
    }});
  }

  async function saveSvc(d) {
    setSaving(true);
    if (d.db_id) {
      await supabase.from("services").update({ name: d.name, base_price: Number(d.base), has_rooms: d.hasRooms }).eq("id", d.db_id);
      setServices(p => p.map(s => s.id === d.id ? { ...d, base: Number(d.base) } : s));
    } else {
      const { data } = await supabase.from("services").insert({ name: d.name, base_price: Number(d.base), has_rooms: d.hasRooms, is_active: true }).select().single();
      if (data) setServices(p => [...p, { id: data.id, db_id: data.id, name: data.name, base: data.base_price, hasRooms: data.has_rooms, icon: "🧹" }]);
    }
    setSvcModal(null); setSaving(false);
  }

  async function delSvc(id) {
    setConfirm({ msg: "Delete this service?", action: async () => {
      const dbId = services.find(s => s.id === id)?.db_id;
      if (dbId) await supabase.from("services").delete().eq("id", dbId);
      setServices(p => p.filter(s => s.id !== id));
      setConfirm(null);
    }});
  }

  async function saveExtra(d) {
    setSaving(true);
    if (d.db_id) {
      await supabase.from("extras").update({ name: d.name, price: Number(d.price) }).eq("id", d.db_id);
      setExtras(p => p.map(e => e.id === d.id ? { ...d, price: Number(d.price) } : e));
    } else {
      const { data } = await supabase.from("extras").insert({ name: d.name, price: Number(d.price), is_active: true }).select().single();
      if (data) setExtras(p => [...p, { id: data.id, db_id: data.id, name: data.name, price: data.price, icon: "✨" }]);
    }
    setExtraModal(null); setSaving(false);
  }

  async function delExtra(id) {
    setConfirm({ msg: "Delete this add-on?", action: async () => {
      const dbId = extras.find(e => e.id === id)?.db_id;
      if (dbId) await supabase.from("extras").delete().eq("id", dbId);
      setExtras(p => p.filter(e => e.id !== id));
      setConfirm(null);
    }});
  }

  async function saveCoupon(d) {
    setSaving(true);
    if (d._edit) {
      const orig = coupons.find(c => c.code === d._orig);
      if (orig?.db_id) await supabase.from("coupons").update({ code: d.code, discount_value: Number(d.disc) }).eq("id", orig.db_id);
      setCoupons(p => p.map(c => c.code === d._orig ? { ...c, code: d.code, disc: Number(d.disc) } : c));
    } else {
      if (coupons.find(c => c.code === d.code)) { alert("Code exists"); setSaving(false); return; }
      const { data } = await supabase.from("coupons").insert({ code: d.code.toUpperCase(), discount_type: "percent", discount_value: Number(d.disc), is_active: true }).select().single();
      if (data) setCoupons(p => [...p, { db_id: data.id, code: data.code, disc: data.discount_value, active: true }]);
    }
    setCouponModal(null); setSaving(false);
  }

  async function delCoupon(code) {
    setConfirm({ msg: `Delete coupon ${code}?`, action: async () => {
      const dbId = coupons.find(c => c.code === code)?.db_id;
      if (dbId) await supabase.from("coupons").delete().eq("id", dbId);
      setCoupons(p => p.filter(c => c.code !== code));
      setConfirm(null);
    }});
  }

  async function toggleCoupon(code) {
    const cp = coupons.find(c => c.code === code);
    if (cp?.db_id) await supabase.from("coupons").update({ is_active: !cp.active }).eq("id", cp.db_id);
    setCoupons(p => p.map(c => c.code === code ? { ...c, active: !c.active } : c));
  }

  const NavContent = () => (
    <>
      <div style={{ padding: "0 20px 16px", borderBottom: `1px solid ${BORDER}`, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>👤 {adminUser?.name}</div>
      </div>
      {TABS.map(({ id, label, icon }) => (
        <div key={id} onClick={() => { setTab(id); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", cursor: "pointer", background: tab === id ? LIGHT_BLUE : "transparent", color: tab === id ? BLUE : MUTED, borderRight: tab === id ? `3px solid ${BLUE}` : "3px solid transparent", fontWeight: tab === id ? 700 : 500, fontSize: 14, marginBottom: 2 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>{label}
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
      {svcModal && <Modal title={svcModal.mode === "add" ? "Add Service" : "Edit Service"} onClose={() => setSvcModal(null)}><SvcForm data={svcModal.data} onSave={saveSvc} /></Modal>}
      {extraModal && <Modal title={extraModal.mode === "add" ? "Add Add-on" : "Edit Add-on"} onClose={() => setExtraModal(null)}><ExtraForm data={extraModal.data} onSave={saveExtra} /></Modal>}
      {couponModal && <Modal title={couponModal.mode === "add" ? "Add Coupon" : "Edit Coupon"} onClose={() => setCouponModal(null)}><CouponForm data={couponModal.data} onSave={saveCoupon} /></Modal>}
      {clientModal && <Modal title={clientModal.mode === "add" ? "Add Client" : "Edit Client"} onClose={() => setClientModal(null)}><ClientForm data={clientModal.data} onSave={() => setClientModal(null)} /></Modal>}

      {mobile && menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, background: WHITE, overflowY: "auto", paddingTop: 60 }}><NavContent /></div>
        </div>
      )}

      {!mobile && <div style={{ width: 230, background: WHITE, borderRight: `1px solid ${BORDER}`, padding: "24px 0", flexShrink: 0 }}><NavContent /></div>}

      <div style={{ flex: 1, overflowY: "auto", background: BG, paddingBottom: mobile ? 70 : 0 }}>
        <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: mobile ? "14px 16px" : "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {mobile && <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT, fontSize: 22 }}>☰</button>}
            <h2 style={{ fontSize: mobile ? 16 : 20, fontWeight: 900 }}>{TABS.find(t => t.id === tab)?.label}</h2>
          </div>
        </div>

        <div style={{ padding: mobile ? "12px 16px" : "24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mobile ? 10 : 14, marginBottom: mobile ? 16 : 28 }}>
            {[{ icon: "📋", label: "Bookings", value: bookings.length, color: BLUE, bg: LIGHT_BLUE }, { icon: "💰", label: "Revenue", value: fmt(revenue), color: GREEN, bg: LIGHT_GREEN }, { icon: "⏳", label: "Pending", value: bookings.filter(b => b.status === "Pending").length, color: "#e67e22", bg: "#fff8f0" }, { icon: "👥", label: "Clients", value: clients.length, color: BLUE, bg: LIGHT_BLUE }].map(({ icon, label, value, color, bg }) => (
              <div key={label} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: mobile ? 14 : 20, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: mobile ? 40 : 48, height: mobile ? 40 : 48, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: mobile ? 18 : 22, flexShrink: 0 }}>{icon}</div>
                <div><div style={{ fontSize: mobile ? 20 : 24, fontWeight: 900, color, lineHeight: 1 }}>{value}</div><div style={{ fontSize: mobile ? 11 : 12, color: MUTED, marginTop: 3 }}>{label}</div></div>
              </div>
            ))}
          </div>

          {/* BOOKINGS */}
          {tab === "bookings" && <>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search bookings…" style={{ ...S.inp, flex: 1, padding: "10px 14px" }} />
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
                    <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>{b.address}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {["Confirmed","Completed","Cancelled"].filter(s => s !== b.status).map(s => (
                        <button key={s} onClick={() => updBk(b.id, s)} style={{ background: STATUS_CONFIG[s]?.bg || BG, color: STATUS_CONFIG[s]?.color || MUTED, border: `1px solid ${STATUS_CONFIG[s]?.color || MUTED}33`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>→ {s}</button>
                      ))}
                      <button onClick={() => delBk(b.id)} style={{ background: "#fdecea", color: "#e74c3c", border: "1px solid #f5c6cb", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑 Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* CLIENTS */}
          {tab === "clients" && <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button style={S.btn(BLUE, WHITE)} onClick={() => setClientModal({ mode: "add", data: {} })}>+ Add Client</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clients.map(c => { const cbks = bookings.filter(b => b.clientId === c.id); return (
                <div key={c.id} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <Avatar name={c.name} size={44} />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14 }}>{c.name}</div><div style={{ fontSize: 12, color: MUTED }}>{c.email}</div><div style={{ fontSize: 12, color: MUTED }}>{c.phone}</div></div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: BG, borderRadius: 10, padding: 10, textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 900, color: BLUE }}>{cbks.length}</div><div style={{ fontSize: 11, color: MUTED }}>Bookings</div></div>
                    <div style={{ flex: 1, background: BG, borderRadius: 10, padding: 10, textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 900, color: GREEN }}>{fmt(cbks.reduce((s, b) => s + b.total, 0))}</div><div style={{ fontSize: 11, color: MUTED }}>Revenue</div></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => delClient(c.id)} style={{ ...S.btn("#fdecea", "#e74c3c"), flex: 1, padding: "9px", fontSize: 13 }}>🗑 Delete</button>
                  </div>
                </div>
              );})}
            </div>
          </>}

          {/* SERVICES */}
          {tab === "services" && <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button style={S.btn(BLUE, WHITE)} onClick={() => setSvcModal({ mode: "add", data: { name: "", base: 100, hasRooms: false } })}>+ Add Service</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
              {services.map(svc => (
                <div key={svc.id} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ background: `linear-gradient(135deg,${LIGHT_BLUE},${WHITE})`, padding: 18, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 48, height: 48, background: WHITE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{svc.icon}</div>
                    <div><div style={{ fontWeight: 800, fontSize: 15 }}>{svc.name}</div><div style={{ color: GREEN, fontWeight: 800, fontSize: 17, marginTop: 2 }}>from {fmt(svc.base)}</div></div>
                  </div>
                  <div style={{ padding: "12px 14px", display: "flex", gap: 8 }}>
                    <button onClick={() => setSvcModal({ mode: "edit", data: { ...svc } })} style={{ ...S.btn(LIGHT_BLUE, BLUE), flex: 1, padding: "9px", fontSize: 13 }}>✏️ Edit</button>
                    <button onClick={() => delSvc(svc.id)} style={{ ...S.btn("#fdecea", "#e74c3c"), flex: 1, padding: "9px", fontSize: 13 }}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* EXTRAS */}
          {tab === "extras" && <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button style={S.btn(BLUE, WHITE)} onClick={() => setExtraModal({ mode: "add", data: { name: "", price: 50 } })}>+ Add Add-on</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
              {extras.map(ex => (
                <div key={ex.id} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ background: `linear-gradient(135deg,${LIGHT_GREEN},${WHITE})`, padding: 16, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, background: WHITE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{ex.icon}</div>
                    <div><div style={{ fontWeight: 800, fontSize: 13 }}>{ex.name}</div><div style={{ color: GREEN, fontWeight: 900, fontSize: 18 }}>+{fmt(ex.price)}</div></div>
                  </div>
                  <div style={{ padding: "10px 12px", display: "flex", gap: 6 }}>
                    <button onClick={() => setExtraModal({ mode: "edit", data: { ...ex } })} style={{ ...S.btn(LIGHT_BLUE, BLUE), flex: 1, padding: "8px", fontSize: 12 }}>✏️ Edit</button>
                    <button onClick={() => delExtra(ex.id)} style={{ ...S.btn("#fdecea", "#e74c3c"), flex: 1, padding: "8px", fontSize: 12 }}>🗑 Del</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* COUPONS */}
          {tab === "coupons" && <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button style={S.btn(BLUE, WHITE)} onClick={() => setCouponModal({ mode: "add", data: { code: "", disc: 10 } })}>+ Add Coupon</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
              {coupons.map(c => (
                <div key={c.code} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ background: c.active ? `linear-gradient(135deg,${LIGHT_BLUE},${WHITE})` : "#fafafa", padding: 20, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><div style={{ fontWeight: 900, color: c.active ? BLUE : MUTED, fontSize: 20, letterSpacing: 2, marginBottom: 4 }}>{c.code}</div><div style={{ fontSize: 26, fontWeight: 900, color: c.active ? GREEN : MUTED }}>{c.disc}% off</div></div>
                    <div style={{ fontSize: 36 }}>🏷️</div>
                  </div>
                  <div style={{ padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <button onClick={() => toggleCoupon(c.code)} style={{ background: c.active ? LIGHT_GREEN : "#fdecea", color: c.active ? GREEN : "#e74c3c", border: "none", borderRadius: 50, padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{c.active ? "● Active" : "○ Inactive"}</button>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setCouponModal({ mode: "edit", data: { code: c.code, disc: c.disc, active: c.active, _edit: true, _orig: c.code } })} style={{ ...S.btn(LIGHT_BLUE, BLUE), padding: "7px 12px", fontSize: 12 }}>✏️</button>
                      <button onClick={() => delCoupon(c.code)} style={{ ...S.btn("#fdecea", "#e74c3c"), padding: "7px 10px", fontSize: 12 }}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* DISCOUNTS */}
          {tab === "discounts" && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Frequency Discounts</div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
                {freqs.map(f => (
                  <div key={f.id} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><div style={{ fontWeight: 800, fontSize: 15 }}>{f.label}</div><div style={{ fontSize: 22, fontWeight: 900, color: f.disc > 0 ? GREEN : MUTED }}>{f.disc > 0 ? `${f.disc}% off` : "No discount"}</div></div>
                    <div style={{ fontSize: 28 }}>{f.disc > 0 ? "💸" : "💰"}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: LIGHT_GREEN, borderRadius: 12, border: `1px solid ${GREEN}33`, padding: "16px 20px", marginTop: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: GREEN }}>💙 NDIS Cleaning — GST Free</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AUTH ──
function LoginScreen({ clients, onLogin, onAdmin, onGuest }) {
  const mobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  function tryLogin() {
    const u = clients.find(c => c.email === email && c.password === pass);
    if (u) onLogin(u); else setErr("Invalid credentials.");
  }
  return (
    <div style={{ maxWidth: 420, margin: mobile ? "0 auto" : "56px auto", padding: 16 }}>
      <div style={{ background: WHITE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: mobile ? "24px 20px" : 36, boxShadow: "0 8px 40px rgba(27,117,187,0.10)", marginTop: mobile ? 8 : 0 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="/logo.png" alt="Yahweh Property Care" style={{ height: 100, width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} />
          <p style={{ color: MUTED, fontSize: 14, marginTop: 8 }}>Sign in to manage your bookings</p>
        </div>
        {[["Email", "email", "email", "you@example.com", setEmail, email], ["Password", "pass", "password", "••••••••", setPass, pass]].map(([l, id, t, p, fn, v]) => (
          <div key={id} style={{ marginBottom: 16 }}><div style={S.sLbl}>{l}</div><input type={t} value={v} onChange={e => fn(e.target.value)} placeholder={p} style={S.inp} onKeyDown={e => e.key === "Enter" && tryLogin()} /></div>
        ))}
        {err && <div style={{ background: "#fdecea", border: "1px solid #f5c6cb", borderRadius: 9, padding: "10px 14px", color: "#c0392b", fontSize: 13, marginBottom: 14 }}>{err}</div>}
        <button style={{ ...S.btn(BLUE, WHITE), width: "100%", marginBottom: 12, fontSize: 15, padding: 14 }} onClick={tryLogin}>Sign In</button>
        <button style={{ ...S.btn(WHITE, BLUE, BLUE), width: "100%", marginBottom: 16, padding: 14 }} onClick={onGuest}>Continue as Guest</button>
        <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: "16px 0" }} />
        <button onClick={onAdmin} style={{ width: "100%", background: BG, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 9, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔐 Admin Login</button>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin, onBack }) {
  const mobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  function tryLogin() {
    if (email.trim().toLowerCase() === SUPER_ADMIN.email.toLowerCase() && pass === SUPER_ADMIN.password) {
      const adminData = { id: "super", name: "Ron_admin", email: SUPER_ADMIN.email, role: "superadmin" };
      sessionStorage.setItem("adminUser", JSON.stringify(adminData));
      onLogin(adminData); return;
    }
    const found = HARDCODED_ADMINS.find(a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === pass);
    if (found) { sessionStorage.setItem("adminUser", JSON.stringify(found)); onLogin(found); return; }
    setErr("Invalid email or password.");
  }
  return (
    <div style={{ maxWidth: 380, margin: mobile ? "0 auto" : "56px auto", padding: 16 }}>
      <div style={{ background: WHITE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: mobile ? "24px 20px" : 36, textAlign: "center", boxShadow: "0 8px 40px rgba(27,117,187,0.10)", marginTop: mobile ? 8 : 0 }}>
        <div style={{ width: 72, height: 72, background: LIGHT_BLUE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>🔐</div>
        <h2 style={{ fontWeight: 900, fontSize: 20, color: BLUE, marginBottom: 6 }}>Admin Login</h2>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>Yahweh Property Care</p>
        <div style={{ textAlign: "left", marginBottom: 14 }}><div style={S.sLbl}>Email Address</div><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" style={S.inp} onKeyDown={e => e.key === "Enter" && tryLogin()} /></div>
        <div style={{ textAlign: "left", marginBottom: 14 }}><div style={S.sLbl}>Password</div><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={S.inp} onKeyDown={e => e.key === "Enter" && tryLogin()} /></div>
        {err && <div style={{ color: "#e74c3c", fontSize: 13, marginBottom: 12, background: "#fdecea", borderRadius: 8, padding: "8px 12px" }}>{err}</div>}
        <button style={{ ...S.btn(BLUE, WHITE), width: "100%", marginBottom: 10, padding: 14 }} onClick={tryLogin}>Login to Dashboard</button>
        <button style={{ ...S.btn(WHITE, BLUE, BLUE), width: "100%", padding: 14 }} onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

function PrivateRoute({ user, children }) { return user ? children : <Navigate to="/login" replace />; }
function AdminRoute({ children }) {
  const adminUser = (() => { try { const a = sessionStorage.getItem("adminUser"); return a ? JSON.parse(a) : null; } catch (e) { return null; } })();
  return adminUser ? children : <Navigate to="/admin-login" replace />;
}

// ── DATA ICONS MAP (local services keep icons) ──
const SVC_ICONS = { "House Cleaning": "🏠", "Commercial": "🏢", "End of Lease": "🔑", "NDIS Cleaning": "💙", "Office Cleaning": "💼", "Carpet Cleaning": "🧹", "Strata Cleaning": "🏘️", "Deep Clean": "✨" };
const EXTRA_ICONS = { "Oven Cleaning": "🔥", "Fridge Cleaning": "❄️", "Interior Windows": "🪟", "Inside Cabinets": "🗄️", "Deep Clean": "✨", "Balcony Cleaning": "🌿", "Laundry": "👕", "Wall Washing": "🪣" };

// ── ROOT ──
export default function App() {
  const mobile = useIsMobile();
  const [user, setUser] = useState(() => { try { const u = sessionStorage.getItem("user"); return u ? JSON.parse(u) : null; } catch (e) { return null; } });
  const [adminUser, setAdminUser] = useState(() => { try { const a = sessionStorage.getItem("adminUser"); return a ? JSON.parse(a) : null; } catch (e) { return null; } });
  const isAdmin = !!adminUser;

  // ── Data state ──
  const [services, setServices] = useState([]);
  const [extras, setExtras] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [freqs, setFreqs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load all data from Supabase ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [svcRes, extRes, cpnRes, frqRes, bkRes, clRes] = await Promise.all([
        supabase.from("services").select("*").eq("is_active", true).order("name"),
        supabase.from("extras").select("*").eq("is_active", true).order("name"),
        supabase.from("coupons").select("*").order("code"),
        supabase.from("frequency_discounts").select("*").eq("is_active", true).order("discount_percent"),
        supabase.from("bookings").select("*, client:clients(full_name,email,phone), service:services(name)").order("scheduled_date", { ascending: false }),
        supabase.from("clients").select("*").order("full_name"),
      ]);

      if (svcRes.data) setServices(svcRes.data.map(s => ({ id: s.id, db_id: s.id, name: s.name, base: s.base_price, hasRooms: s.has_rooms, icon: SVC_ICONS[s.name] || "🧹" })));
      if (extRes.data) setExtras(extRes.data.map(e => ({ id: e.id, db_id: e.id, name: e.name, price: e.price, icon: EXTRA_ICONS[e.name] || "✨" })));
      if (cpnRes.data) setCoupons(cpnRes.data.map(c => ({ db_id: c.id, code: c.code, disc: c.discount_value, active: c.is_active, id: c.id })));
      if (frqRes.data) setFreqs(frqRes.data.map(f => ({ id: f.frequency, label: f.label, disc: f.discount_percent })));
      if (bkRes.data) setBookings(bkRes.data.map(b => ({
        id: `YPC${b.id.slice(0, 6).toUpperCase()}`,
        db_id: b.id,
        clientId: b.client_id,
        clientName: b.client?.full_name || "Guest",
        clientEmail: b.client?.email || "",
        service: b.service?.name || "—",
        date: b.scheduled_date,
        time: b.scheduled_time,
        address: "",
        total: b.total_price || 0,
        status: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "Pending",
        freq: b.frequency || "one_time",
        extras: Array.isArray(b.extras) ? b.extras : [],
      })));
      if (clRes.data) setClients(clRes.data.map(c => ({ id: c.id, name: c.full_name, email: c.email, phone: c.phone || "", password: "" })));
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
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
              {!isAdmin && <button style={{ ...S.btn(GREEN, WHITE), display: "flex", alignItems: "center", gap: 6 }} onClick={() => window.location.href = "/book"}>+ Book a Clean</button>}
              {!user && !isAdmin && <button style={S.btn(WHITE, BLUE, BLUE)} onClick={() => window.location.href = "/login"}>Login</button>}
              {user && !isAdmin && <button style={S.btn(WHITE, BLUE, BLUE)} onClick={() => { setUser(null); sessionStorage.removeItem("user"); window.location.href = "/login"; }}>Logout</button>}
              {isAdmin && <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: LIGHT_BLUE, borderRadius: 8, padding: "6px 14px" }}><span style={{ fontSize: 12, color: BLUE, fontWeight: 800 }}>👤 {adminUser?.name}</span></div>
                <button style={S.btn(WHITE, BLUE, BLUE)} onClick={() => { setAdminUser(null); sessionStorage.removeItem("adminUser"); window.location.href = "/login"; }}>Logout</button>
              </div>}
            </>}
            <a href="tel:1300925355" style={{ color: GREEN, fontWeight: 800, textDecoration: "none", fontSize: mobile ? 13 : 14 }}>📞{!mobile && " 1300 925 355"}</a>
          </nav>
        </header>

        <Routes>
          <Route path="/login" element={<LoginScreen clients={clients} onLogin={u => { setUser(u); sessionStorage.setItem("user", JSON.stringify(u)); window.location.href = "/client"; }} onAdmin={() => window.location.href = "/admin-login"} onGuest={() => window.location.href = "/book"} />} />
          <Route path="/admin-login" element={<AdminLogin onLogin={u => { setAdminUser(u); window.location.href = "/admin"; }} onBack={() => window.location.href = "/login"} />} />
          <Route path="/book" element={<BookingApp user={user} services={services} extras={extras} coupons={coupons} freqs={freqs} onComplete={nb => setBookings(p => [...p, nb])} />} />
          <Route path="/client" element={<PrivateRoute user={user}><ClientDash user={user} bookings={bookings} onLogout={() => { setUser(null); sessionStorage.removeItem("user"); window.location.href = "/login"; }} onBook={() => window.location.href = "/book"} /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDash bookings={bookings} setBookings={setBookings} clients={clients} setClients={setClients} services={services} setServices={setServices} extras={extras} setExtras={setExtras} coupons={coupons} setCoupons={setCoupons} freqs={freqs} setFreqs={setFreqs} onLogout={() => { setAdminUser(null); sessionStorage.removeItem("adminUser"); window.location.href = "/login"; }} /></AdminRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {mobile && <MobileBottomNav user={user} isAdmin={isAdmin} />}
      </div>
    </BrowserRouter>
  );
}
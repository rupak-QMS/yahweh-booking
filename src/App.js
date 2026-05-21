import { useState } from "react";

const BLUE = "#1b75bb";
const GREEN = "#7eb842";
const BL = "#e8f4fd";
const GL = "#f0f9e8";
const BORDER = "#dde3ea";
const MUTED = "#6b7a8d";
const TEXT = "#1a2533";
const BG = "#f4f7fb";
const WHITE = "#ffffff";

const btn = (bg, col, border) => ({
  background: bg, color: col,
  border: border ? `1.5px solid ${border}` : "none",
  borderRadius: 9, padding: "10px 22px",
  fontSize: 13, fontWeight: 700, cursor: "pointer",
  transition: "opacity .15s",
});
const inp = (w) => ({
  width: w || "100%", border: `1.5px solid ${BORDER}`,
  borderRadius: 9, padding: "10px 13px", fontSize: 14,
  outline: "none", fontFamily: "inherit", color: TEXT,
  background: WHITE, boxSizing: "border-box",
});
const card = { background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 24 };
const sLbl = { fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 9, marginTop: 18 };
const badge = (color) => ({ background: color + "22", color, borderRadius: 50, padding: "3px 11px", fontSize: 11, fontWeight: 700, border: `1px solid ${color}44` });

const DEF_SERVICES = [
  { id: "house", name: "House Cleaning", icon: "🏠", base: 119, hasRooms: true },
  { id: "commercial", name: "Commercial", icon: "🏢", base: 149, hasRooms: false },
  { id: "lease", name: "End of Lease", icon: "🔑", base: 199, hasRooms: true },
  { id: "ndis", name: "NDIS Cleaning", icon: "💙", base: 99, hasRooms: true },
  { id: "office", name: "Office Cleaning", icon: "💼", base: 139, hasRooms: false },
  { id: "carpet", name: "Carpet Cleaning", icon: "🧹", base: 89, hasRooms: false },
  { id: "strata", name: "Strata Cleaning", icon: "🏘️", base: 129, hasRooms: false },
  { id: "deep", name: "Deep Clean", icon: "✨", base: 179, hasRooms: true },
];

const DEF_EXTRAS = [
  { id: "oven", name: "Oven Cleaning", icon: "🔥", price: 65 },
  { id: "fridge", name: "Fridge Cleaning", icon: "❄️", price: 50 },
  { id: "windows", name: "Interior Windows", icon: "🪟", price: 79 },
  { id: "cabinets", name: "Inside Cabinets", icon: "🗄️", price: 40 },
  { id: "deepclean", name: "Deep Clean", icon: "✨", price: 159 },
  { id: "balcony", name: "Balcony", icon: "🌿", price: 45 },
  { id: "laundry", name: "Laundry", icon: "👕", price: 35 },
  { id: "walls", name: "Wall Washing", icon: "🪣", price: 55 },
];

const DEF_COUPONS = [
  { code: "YAHWEH10", disc: 10, active: true },
  { code: "YPC10", disc: 10, active: true },
  { code: "WELCOME15", disc: 15, active: true },
  { code: "NDIS20", disc: 20, active: true },
];

const FREQS = [
  { id: "once", label: "One Time", disc: 0 },
  { id: "weekly", label: "Weekly", disc: 10 },
  { id: "fortnightly", label: "Fortnightly", disc: 10 },
  { id: "monthly", label: "Monthly", disc: 5 },
];

const TIME_SLOTS = ["7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM"];

const DEF_CLIENTS = [
  { id: "c1", name: "Sarah Mitchell", email: "sarah@example.com", password: "pass123", phone: "0411111111" },
  { id: "c2", name: "James Lee", email: "james@example.com", password: "pass123", phone: "0422222222" },
];

const DEF_BOOKINGS = [
  { id:"YPC1001", clientId:"c1", clientName:"Sarah Mitchell", clientEmail:"sarah@example.com", service:"House Cleaning", date:"2026-05-25", time:"9:00 AM", address:"12 Rose St, Blacktown NSW 2148", total:107.10, status:"Confirmed", freq:"Weekly", extras:[] },
  { id:"YPC1002", clientId:"c1", clientName:"Sarah Mitchell", clientEmail:"sarah@example.com", service:"Carpet Cleaning", date:"2026-04-10", time:"10:00 AM", address:"12 Rose St, Blacktown NSW 2148", total:89.00, status:"Completed", freq:"One Time", extras:["Oven Cleaning"] },
  { id:"YPC1003", clientId:"c2", clientName:"James Lee", clientEmail:"james@example.com", service:"Office Cleaning", date:"2026-05-28", time:"8:00 AM", address:"45 Market St, Sydney NSW 2000", total:139.00, status:"Pending", freq:"Fortnightly", extras:[] },
  { id:"YPC1004", clientId:"c2", clientName:"James Lee", clientEmail:"james@example.com", service:"End of Lease", date:"2026-03-15", time:"7:00 AM", address:"88 Hill Rd, Parramatta NSW 2150", total:199.00, status:"Completed", freq:"One Time", extras:["Deep Clean"] },
];

function calcPrice(svc, beds, baths, freq, extras, couponPct) {
  if (!svc) return { subtotal:0, discAmt:0, couponDisc:0, total:0 };
  const roomAdd = svc.hasRooms ? (beds-1)*20+(baths-1)*15 : 0;
  const extTotal = extras.reduce((s,e)=>s+e.price,0);
  const sub = svc.base + roomAdd + extTotal;
  const disc = freq.disc>0 ? Math.round(sub*freq.disc/100) : 0;
  const coup = couponPct>0 ? Math.round((sub-disc)*couponPct/100) : 0;
  return { subtotal:sub, discAmt:disc, couponDisc:coup, total:sub-disc-coup };
}

function uid() { return Math.random().toString(36).slice(2,8); }

function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <svg width="42" height="42" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
        <circle cx="44" cy="44" r="42" fill={BLUE}/>
        <path d="M14 56 Q26 48 38 56 Q50 64 62 56 Q74 48 80 56" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none"/>
        <path d="M14 64 Q26 56 38 64 Q50 72 62 64 Q74 56 80 64" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none"/>
        <text x="14" y="60" fontFamily="Arial Black,sans-serif" fontSize="42" fontWeight="900" fill="#fff">Y</text>
      </svg>
      <div>
        <div style={{ fontWeight:900, fontSize:20, lineHeight:1, color:TEXT }}>Ya<span style={{ color:GREEN }}>hweh</span></div>
        <div style={{ fontSize:9, color:MUTED, letterSpacing:2, textTransform:"uppercase", fontWeight:700 }}>Property Care</div>
      </div>
    </div>
  );
}

function StatusTag({ status }) {
  const m = { Pending:"#e67e22", Confirmed:BLUE, Completed:GREEN, Cancelled:"#e74c3c" };
  return <span style={badge(m[status]||MUTED)}>{status}</span>;
}

function SRow({ k, v, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:14 }}>
      <span style={{ color:MUTED }}>{k}</span>
      <span style={{ fontWeight:600, color:color||TEXT }}>{v}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ ...card, width:"100%", maxWidth:480, maxHeight:"80vh", overflowY:"auto", padding:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontWeight:800, fontSize:17, color:TEXT }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:MUTED }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ msg, onYes, onNo }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ ...card, maxWidth:360, padding:28, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
        <p style={{ fontSize:15, color:TEXT, marginBottom:20 }}>{msg}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button style={btn("#e74c3c","#fff")} onClick={onYes}>Yes, Delete</button>
          <button style={btn(BG,TEXT,BORDER)} onClick={onNo}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── SUMMARY SIDEBAR ──
function SummaryBar({ booking, coupon, setCoupon, couponPct, onApply, couponMsg }) {
  const { svc, beds, baths, freq, extras } = booking;
  const { subtotal, discAmt, couponDisc, total } = calcPrice(svc,beds,baths,freq,extras,couponPct);
  return (
    <div style={{ background:WHITE, borderRadius:14, border:`1px solid ${BORDER}`, overflow:"hidden", position:"sticky", top:76 }}>
      <div style={{ background:`linear-gradient(135deg,${BLUE},#2196f3)`, padding:"14px 18px", color:"#fff", fontWeight:800, fontSize:15 }}>🧾 Booking Summary</div>
      <div style={{ padding:18 }}>
        {!svc ? <div style={{ color:MUTED, fontSize:13, textAlign:"center", padding:"20px 0" }}>Select a service to see pricing</div> : <>
          <SRow k="Service" v={svc.name}/>
          {svc.hasRooms && <SRow k="Property" v={`${beds} bed, ${baths} bath`}/>}
          <SRow k="Frequency" v={freq.label}/>
          {extras.map(e=><SRow key={e.id} k={e.name} v={`+$${e.price}`} color={GREEN}/>)}
          <hr style={{ border:"none", borderTop:`1px dashed ${BORDER}`, margin:"10px 0" }}/>
          <SRow k="Subtotal" v={`$${subtotal.toFixed(2)}`}/>
          {discAmt>0 && <SRow k={`${freq.disc}% off`} v={`-$${discAmt.toFixed(2)}`} color={GREEN}/>}
          {couponDisc>0 && <SRow k="Promo" v={`-$${couponDisc.toFixed(2)}`} color={GREEN}/>}
          <hr style={{ border:"none", borderTop:`1px dashed ${BORDER}`, margin:"10px 0" }}/>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:800, fontSize:15 }}>Total</span>
            <span style={{ fontWeight:900, fontSize:24, color:BLUE }}>${total.toFixed(2)}</span>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Promo code" style={{ ...inp(), flex:1, fontSize:13, padding:"8px 10px" }}/>
            <button onClick={onApply} style={btn(BLUE,"#fff")}>Apply</button>
          </div>
          {couponMsg && <div style={{ fontSize:12, marginTop:6, color:couponMsg.ok?GREEN:"#e74c3c" }}>{couponMsg.text}</div>}
        </>}
      </div>
      <div style={{ padding:"10px 18px", borderTop:`1px solid ${BORDER}`, fontSize:13, color:MUTED }}>
        📞 <a href="tel:1300925355" style={{ color:GREEN, fontWeight:700, textDecoration:"none" }}>1300 925 355</a>
      </div>
    </div>
  );
}

// ── BOOKING FLOW ──
function BookingApp({ user, services, extras, coupons, onComplete }) {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponPct, setCouponPct] = useState(0);
  const [couponMsg, setCouponMsg] = useState(null);
  const [done, setDone] = useState(false);
  const [b, setB] = useState({
    svc: services[0]||null, beds:1, baths:1, freq:FREQS[1], extras:[],
    date:null, time:"9:00 AM",
    firstName:user?user.name.split(" ")[0]:"", lastName:user?user.name.split(" ")[1]||"":"",
    email:user?user.email:"", phone:user?user.phone:"",
    address:"", suburb:"", state:"NSW", postcode:"", notes:"",
    cardName:"", cardNum:"", cardExp:"", cardCvv:"",
  });

  const { subtotal, discAmt, couponDisc, total } = calcPrice(b.svc,b.beds,b.baths,b.freq,b.extras,couponPct);
  const set = k => e => setB(p=>({...p,[k]:e.target.value}));
  const setV = (k,v) => setB(p=>({...p,[k]:v}));
  const togExtra = ex => {
    const has = b.extras.find(e=>e.id===ex.id);
    setV("extras", has ? b.extras.filter(e=>e.id!==ex.id) : [...b.extras,ex]);
  };

  function applyC() {
    const cp = coupons.find(c=>c.code===coupon&&c.active);
    if (cp) { setCouponPct(cp.disc); setCouponMsg({ok:true,text:`✓ ${cp.disc}% off applied!`}); }
    else setCouponMsg({ok:false,text:"✗ Invalid or inactive code."});
  }

  const VALIDATES = [null,()=>!!b.svc,()=>!!b.date&&!!b.time,()=>!!(b.firstName&&b.lastName&&b.email&&b.phone&&b.address&&b.suburb&&b.postcode),()=>!!(b.cardName&&b.cardNum.length>=16&&b.cardExp&&b.cardCvv.length>=3),()=>true];
  const ERRS = ["","Please select a service.","Please select a date and time.","Please fill all required fields.","Please complete payment details.",""];

  function next() {
    if (!VALIDATES[step]()) { setError(ERRS[step]); return; }
    setError(""); const ns=step+1; setStep(ns); setMaxStep(m=>Math.max(m,ns));
  }

  function submit() {
    const nb = {
      id:"YPC"+Math.floor(Math.random()*9000+1000),
      clientId:user?user.id:"guest",
      clientName:[b.firstName,b.lastName].join(" "),
      clientEmail:b.email,
      service:b.svc.name,
      date:b.date?b.date.toISOString().split("T")[0]:"",
      time:b.time,
      address:[b.address,b.suburb,b.state,b.postcode].filter(Boolean).join(", "),
      total, status:"Confirmed", freq:b.freq.label,
      extras:b.extras.map(e=>e.name),
    };
    onComplete(nb); setDone(true);
  }

  const today = new Date();
  const dates = Array.from({length:21},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()+i); return d; });
  const DAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];
  const STEPS=["Services","Schedule","Location","Payment","Confirm"];

  if (done) return (
    <div style={{ maxWidth:540, margin:"48px auto", padding:"0 16px" }}>
      <div style={{ ...card, textAlign:"center", padding:"52px 36px" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
        <h2 style={{ fontSize:26, fontWeight:900, color:GREEN, marginBottom:8 }}>Booking Confirmed!</h2>
        <p style={{ color:MUTED, marginBottom:20 }}>Confirmation sent to <strong style={{ color:BLUE }}>{b.email}</strong></p>
        <div style={{ background:BG, borderRadius:12, padding:20, textAlign:"left", marginBottom:20 }}>
          <SRow k="Service" v={b.svc.name}/><SRow k="Date" v={b.date?b.date.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):"—"}/><SRow k="Time" v={b.time}/><SRow k="Total" v={`$${total.toFixed(2)}`} color={GREEN}/>
        </div>
        <div style={{ background:"#fff8e1", border:"1px solid #ffe082", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#7a5c00", marginBottom:24 }}>⏰ Our team will call <strong>{b.phone}</strong> within 2 hours.</div>
        <button style={btn(BLUE,"#fff")} onClick={()=>{setDone(false);setStep(1);setMaxStep(1);}}>Book Another Clean</button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Step nav */}
      <div style={{ background:WHITE, borderBottom:`1px solid ${BORDER}`, padding:"0 24px", display:"flex", overflowX:"auto" }}>
        {STEPS.map((label,i)=>{
          const n=i+1,active=step===n,done2=step>n,can=n<=maxStep;
          return (
            <div key={n} onClick={()=>can&&setStep(n)} style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 14px 13px 0", borderBottom:`3px solid ${active?BLUE:done2?GREEN:"transparent"}`, color:active?BLUE:done2?GREEN:"#bbb", cursor:can?"pointer":"default", fontSize:13, fontWeight:700, whiteSpace:"nowrap", marginRight:10, transition:"all .2s" }}>
              <span style={{ width:22, height:22, borderRadius:"50%", background:active?BLUE:done2?GREEN:"#e0e0e0", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900 }}>{done2?"✓":n}</span>
              {label}
            </div>
          );
        })}
      </div>

      {error && <div style={{ maxWidth:1080, margin:"12px auto 0", padding:"0 16px" }}><div style={{ background:"#fdecea", border:"1px solid #f5c6cb", borderRadius:9, padding:"10px 16px", color:"#c0392b", fontSize:14 }}>⚠️ {error}</div></div>}

      <div style={{ maxWidth:1080, margin:"0 auto", padding:"20px 16px", display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>
        <div>
          <div style={card}>
            {step===1 && <>
              <h2 style={{ fontSize:18, fontWeight:800, color:BLUE, marginBottom:18 }}>What kind of clean?</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:10 }}>
                {services.map(svc=>{
                  const a=b.svc?.id===svc.id;
                  return (
                    <div key={svc.id} onClick={()=>setV("svc",svc)} style={{ border:`2px solid ${a?BLUE:BORDER}`, borderRadius:12, padding:"14px 8px", textAlign:"center", cursor:"pointer", background:a?BL:WHITE, transition:"all .2s", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:24 }}>{svc.icon}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:a?BLUE:TEXT }}>{svc.name}</span>
                      <span style={{ fontSize:11, color:a?BLUE:MUTED }}>from ${svc.base}</span>
                    </div>
                  );
                })}
              </div>
              {b.svc?.hasRooms && <>
                <div style={sLbl}>Bedrooms & Bathrooms</div>
                {[{label:"🛏 Bedrooms",key:"beds",max:8},{label:"🛁 Bathrooms",key:"baths",max:6}].map(r=>(
                  <div key={r.key} style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
                    <span style={{ width:130, fontSize:14 }}>{r.label}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <button onClick={()=>setV(r.key,Math.max(1,b[r.key]-1))} style={{ width:32, height:32, borderRadius:"50%", border:`1.5px solid ${BLUE}`, background:WHITE, color:BLUE, fontSize:20, cursor:"pointer", fontWeight:900 }}>−</button>
                      <span style={{ fontWeight:900, fontSize:17, minWidth:24, textAlign:"center" }}>{b[r.key]}</span>
                      <button onClick={()=>setV(r.key,Math.min(r.max,b[r.key]+1))} style={{ width:32, height:32, borderRadius:"50%", border:`1.5px solid ${BLUE}`, background:WHITE, color:BLUE, fontSize:20, cursor:"pointer", fontWeight:900 }}>+</button>
                    </div>
                  </div>
                ))}
              </>}
              <div style={sLbl}>Frequency</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {FREQS.map(f=>{
                  const a=b.freq.id===f.id;
                  return (
                    <div key={f.id} onClick={()=>setV("freq",f)} style={{ border:`2px solid ${a?GREEN:BORDER}`, borderRadius:50, padding:"8px 18px", cursor:"pointer", background:a?GL:WHITE, color:a?GREEN:MUTED, fontWeight:a?700:500, fontSize:13, transition:"all .2s" }}>
                      {f.label}{f.disc>0&&<span style={{ background:GREEN, color:"#fff", borderRadius:50, padding:"2px 7px", fontSize:10, fontWeight:800, marginLeft:6 }}>{f.disc}%</span>}
                    </div>
                  );
                })}
              </div>
              <div style={sLbl}>Extras (optional)</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10 }}>
                {extras.map(ex=>{
                  const a=b.extras.some(e=>e.id===ex.id);
                  return (
                    <div key={ex.id} onClick={()=>togExtra(ex)} style={{ border:`2px solid ${a?BLUE:BORDER}`, borderRadius:12, padding:"12px 10px", cursor:"pointer", background:a?BL:WHITE, transition:"all .2s" }}>
                      <div style={{ fontSize:22, marginBottom:4 }}>{ex.icon}</div>
                      <div style={{ fontWeight:700, fontSize:12, color:a?BLUE:TEXT }}>{ex.name}</div>
                      <div style={{ fontSize:11, color:GREEN, fontWeight:700, marginTop:3 }}>+${ex.price}</div>
                    </div>
                  );
                })}
              </div>
            </>}

            {step===2 && <>
              <h2 style={{ fontSize:18, fontWeight:800, color:BLUE, marginBottom:18 }}>Choose date & time</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, marginBottom:8 }}>
                {DAYS.map(d=><div key={d} style={{ textAlign:"center", fontSize:10, color:MUTED, fontWeight:800, padding:"3px 0" }}>{d}</div>)}
                {dates.map((d,i)=>{
                  const a=b.date&&d.toDateString()===b.date.toDateString();
                  const past=d<today&&d.toDateString()!==today.toDateString();
                  return (
                    <div key={i} onClick={()=>!past&&setV("date",d)} style={{ border:`2px solid ${a?BLUE:BORDER}`, borderRadius:8, padding:"8px 3px", textAlign:"center", cursor:past?"not-allowed":"pointer", background:a?BL:WHITE, opacity:past?0.35:1, transition:"all .2s" }}>
                      <div style={{ fontSize:9, color:a?BLUE:MUTED }}>{d.toLocaleString("default",{month:"short"})}</div>
                      <div style={{ fontSize:14, fontWeight:900, color:a?BLUE:TEXT }}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
              <div style={sLbl}>Time</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))", gap:10 }}>
                {TIME_SLOTS.map(t=>{
                  const a=b.time===t;
                  return <div key={t} onClick={()=>setV("time",t)} style={{ border:`2px solid ${a?BLUE:BORDER}`, borderRadius:9, padding:"10px", textAlign:"center", cursor:"pointer", background:a?BL:WHITE, color:a?BLUE:MUTED, fontWeight:a?800:500, fontSize:13, transition:"all .2s" }}>{t}</div>;
                })}
              </div>
              {b.date&&<div style={{ marginTop:14, background:GL, border:`1px solid ${GREEN}44`, borderRadius:9, padding:"11px 16px", color:GREEN, fontSize:14, fontWeight:700 }}>✅ {b.date.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} at {b.time}</div>}
            </>}

            {step===3 && <>
              <h2 style={{ fontSize:18, fontWeight:800, color:BLUE, marginBottom:18 }}>Your details</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[["First Name","firstName","text","Jane"],["Last Name","lastName","text","Smith"],["Email","email","email","jane@example.com"],["Phone","phone","tel","04XX XXX XXX"]].map(([l,k,t,p])=>(
                  <div key={k}><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>{l} *</div><input type={t} value={b[k]} onChange={set(k)} placeholder={p} style={inp()}/></div>
                ))}
              </div>
              <div style={{ marginTop:14 }}><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Street Address *</div><input type="text" value={b.address} onChange={set("address")} placeholder="123 Main Street" style={inp()}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:14 }}>
                <div><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Suburb *</div><input value={b.suburb} onChange={set("suburb")} placeholder="Blacktown" style={inp()}/></div>
                <div><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>State</div><select value={b.state} onChange={set("state")} style={inp()}>{["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"].map(s=><option key={s}>{s}</option>)}</select></div>
                <div><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Postcode *</div><input value={b.postcode} onChange={set("postcode")} maxLength={4} placeholder="2148" style={inp()}/></div>
              </div>
              <div style={{ marginTop:14 }}><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Special instructions</div><textarea value={b.notes} onChange={set("notes")} rows={3} placeholder="Key location, gate code, pets…" style={{ ...inp(), resize:"vertical" }}/></div>
            </>}

            {step===4 && <>
              <h2 style={{ fontSize:18, fontWeight:800, color:BLUE, marginBottom:4 }}>Secure Payment</h2>
              <p style={{ color:MUTED, fontSize:13, marginBottom:18 }}>🔒 256-bit encrypted — your card details are safe</p>
              <div style={{ background:BG, borderRadius:11, padding:"16px 18px", marginBottom:20, border:`1px solid ${BORDER}` }}>
                <SRow k="Service" v={b.svc.name}/>{discAmt>0&&<SRow k={`${b.freq.disc}% discount`} v={`-$${discAmt.toFixed(2)}`} color={GREEN}/>}{couponDisc>0&&<SRow k="Promo" v={`-$${couponDisc.toFixed(2)}`} color={GREEN}/>}
                <hr style={{ border:"none", borderTop:`1px dashed ${BORDER}`, margin:"8px 0" }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontWeight:700 }}>Total to pay</span><span style={{ fontWeight:900, fontSize:22, color:BLUE }}>${total.toFixed(2)}</span></div>
              </div>
              {[["Name on card","cardName","text","Jane Smith"],["Card number","cardNum","text","1234 5678 9012 3456"]].map(([l,k,t,p])=>(
                <div key={k} style={{ marginBottom:14 }}><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>{l} *</div><input type={t} value={b[k]} onChange={k==="cardNum"?e=>setV(k,e.target.value.replace(/\D/g,"").slice(0,16)):set(k)} placeholder={p} style={inp()}/></div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Expiry *</div><input value={b.cardExp} onChange={set("cardExp")} placeholder="MM/YY" maxLength={5} style={inp()}/></div>
                <div><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>CVV *</div><input value={b.cardCvv} onChange={e=>setV("cardCvv",e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="123" maxLength={4} style={inp()}/></div>
              </div>
            </>}

            {step===5 && <>
              <h2 style={{ fontSize:18, fontWeight:800, color:BLUE, marginBottom:18 }}>Review & Confirm</h2>
              {[
                {title:"🧹 Service",rows:[["Service",b.svc.name],["Property",b.svc.hasRooms?`${b.beds} bed, ${b.baths} bath`:"N/A"],["Frequency",b.freq.label],["Extras",b.extras.length?b.extras.map(e=>e.name).join(", "):"None"]]},
                {title:"📅 Schedule",rows:[["Date",b.date?b.date.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):"—"],["Time",b.time]]},
                {title:"📍 Location",rows:[["Name",[b.firstName,b.lastName].join(" ")],["Address",[b.address,b.suburb,b.state,b.postcode].filter(Boolean).join(", ")],["Email",b.email],["Phone",b.phone]]},
                {title:"💰 Pricing",rows:[["Subtotal",`$${subtotal.toFixed(2)}`],["Discount",discAmt>0?`-$${discAmt.toFixed(2)}`:"—"],["Total",`$${total.toFixed(2)}`]]},
              ].map(sec=>(
                <div key={sec.title} style={{ background:BG, borderRadius:11, padding:"14px 18px", marginBottom:12, border:`1px solid ${BORDER}` }}>
                  <div style={{ fontSize:10, fontWeight:800, color:MUTED, textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>{sec.title}</div>
                  {sec.rows.map(([k,v])=><SRow key={k} k={k} v={v}/>)}
                </div>
              ))}
              <div style={{ background:BL, borderRadius:9, padding:"12px 16px", fontSize:13, color:"#1a3d60" }}>✅ By confirming you agree to Yahweh Property Care's Terms of Service.</div>
            </>}
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
            {step>1?<button style={btn(WHITE,BLUE,BLUE)} onClick={()=>setStep(s=>s-1)}>← Back</button>:<span/>}
            {step<5?<button style={btn(BLUE,"#fff")} onClick={next}>Continue →</button>:<button style={btn(GREEN,"#fff")} onClick={submit}>✅ Confirm & Pay ${total.toFixed(2)}</button>}
          </div>
        </div>
        <SummaryBar booking={b} coupon={coupon} setCoupon={setCoupon} couponPct={couponPct} onApply={applyC} couponMsg={couponMsg}/>
      </div>
    </div>
  );
}

// ── CLIENT DASHBOARD ──
function ClientDash({ user, bookings, onLogout, onBook }) {
  const mine = bookings.filter(b=>b.clientId===user.id||b.clientEmail===user.email);
  const upcoming = mine.filter(b=>["Confirmed","Pending"].includes(b.status));
  const past = mine.filter(b=>["Completed","Cancelled"].includes(b.status));
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div><h2 style={{ fontSize:22, fontWeight:900 }}>Welcome, <span style={{ color:BLUE }}>{user.name.split(" ")[0]}</span> 👋</h2><p style={{ color:MUTED, fontSize:13 }}>{user.email}</p></div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={btn(GREEN,"#fff")} onClick={onBook}>+ New Booking</button>
          <button style={btn(WHITE,BLUE,BLUE)} onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:26 }}>
        {[["📋","Total Bookings",mine.length,BLUE],["📅","Upcoming",upcoming.length,"#e67e22"],["✅","Completed",past.filter(b=>b.status==="Completed").length,GREEN]].map(([icon,label,val,color])=>(
          <div key={label} style={{ background:WHITE, borderRadius:13, border:`1px solid ${BORDER}`, padding:"18px 20px" }}>
            <div style={{ fontSize:26, marginBottom:6 }}>{icon}</div>
            <div style={{ fontSize:28, fontWeight:900, color }}>{val}</div>
            <div style={{ fontSize:13, color:MUTED }}>{label}</div>
          </div>
        ))}
      </div>
      {upcoming.length>0&&<><h3 style={{ fontSize:15, fontWeight:800, marginBottom:12, color:BLUE }}>Upcoming</h3><div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>{upcoming.map(b=><BkCard key={b.id} b={b}/>)}</div></>}
      <h3 style={{ fontSize:15, fontWeight:800, marginBottom:12, color:MUTED }}>Past Bookings</h3>
      {past.length===0?<div style={{ color:MUTED, fontSize:14 }}>No past bookings.</div>:<div style={{ display:"flex", flexDirection:"column", gap:10 }}>{past.map(b=><BkCard key={b.id} b={b}/>)}</div>}
    </div>
  );
}

function BkCard({ b }) {
  return (
    <div style={{ background:WHITE, borderRadius:11, border:`1px solid ${BORDER}`, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
      <div><div style={{ fontWeight:800, fontSize:15, marginBottom:3 }}>{b.service}</div><div style={{ fontSize:13, color:MUTED }}>{b.date} · {b.time}</div><div style={{ fontSize:12, color:MUTED }}>{b.address}</div>{b.extras&&b.extras.length>0&&<div style={{ fontSize:12, color:GREEN, marginTop:3 }}>+ {b.extras.join(", ")}</div>}</div>
      <div style={{ textAlign:"right" }}><StatusTag status={b.status}/><div style={{ fontWeight:900, fontSize:20, color:BLUE, marginTop:6 }}>${b.total.toFixed(2)}</div><div style={{ fontSize:12, color:MUTED }}>{b.freq}</div></div>
    </div>
  );
}

// ── ADMIN ──
function AdminDash({ bookings, setBookings, clients, setClients, services, setServices, extras, setExtras, coupons, setCoupons, onLogout }) {
  const [tab, setTab] = useState("bookings");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  // Modals
  const [svcModal, setSvcModal] = useState(null); // null | {mode:'add'|'edit', data}
  const [extraModal, setExtraModal] = useState(null);
  const [couponModal, setCouponModal] = useState(null);
  const [clientModal, setClientModal] = useState(null);

  const TABS = ["bookings","clients","services","extras","coupons"];
  const sColors = { Pending:"#e67e22", Confirmed:BLUE, Completed:GREEN, Cancelled:"#e74c3c" };

  const filteredBks = bookings.filter(b=>{
    const ms=filter==="All"||b.status===filter;
    const mq=!search||[b.service,b.id,b.clientName||""].some(x=>x.toLowerCase().includes(search.toLowerCase()));
    return ms&&mq;
  });

  const revenue = bookings.filter(b=>b.status==="Completed").reduce((s,b)=>s+b.total,0);

  // Booking actions
  function updateBkStatus(id,status){ setBookings(p=>p.map(b=>b.id===id?{...b,status}:b)); }
  function deleteBk(id){ setConfirm({ msg:`Delete booking ${id}?`, action:()=>{ setBookings(p=>p.filter(b=>b.id!==id)); setConfirm(null); }}); }

  // Client actions
  function deleteClient(id){ setConfirm({ msg:"Delete this client and all their bookings?", action:()=>{ setClients(p=>p.filter(c=>c.id!==id)); setBookings(p=>p.filter(b=>b.clientId!==id)); setConfirm(null); }}); }
  function saveClient(data) {
    if (data.id) setClients(p=>p.map(c=>c.id===data.id?data:c));
    else setClients(p=>[...p,{...data,id:"c"+uid()}]);
    setClientModal(null);
  }

  // Service actions
  function saveSvc(data) {
    if (data.id) setServices(p=>p.map(s=>s.id===data.id?data:s));
    else setServices(p=>[...p,{...data,id:"svc"+uid(),base:Number(data.base)}]);
    setSvcModal(null);
  }
  function deleteSvc(id){ setConfirm({ msg:"Delete this service?", action:()=>{ setServices(p=>p.filter(s=>s.id!==id)); setConfirm(null); }}); }

  // Extra actions
  function saveExtra(data) {
    if (data.id) setExtras(p=>p.map(e=>e.id===data.id?{...data,price:Number(data.price)}:e));
    else setExtras(p=>[...p,{...data,id:"ex"+uid(),price:Number(data.price)}]);
    setExtraModal(null);
  }
  function deleteExtra(id){ setConfirm({ msg:"Delete this add-on?", action:()=>{ setExtras(p=>p.filter(e=>e.id!==id)); setConfirm(null); }}); }

  // Coupon actions
  function saveCoupon(data) {
    if (data._edit) setCoupons(p=>p.map(c=>c.code===data._orig?{code:data.code,disc:Number(data.disc),active:data.active}:c));
    else { if(coupons.find(c=>c.code===data.code)){ alert("Code already exists"); return; } setCoupons(p=>[...p,{code:data.code.toUpperCase(),disc:Number(data.disc),active:true}]); }
    setCouponModal(null);
  }
  function deleteCoupon(code){ setConfirm({ msg:`Delete coupon ${code}?`, action:()=>{ setCoupons(p=>p.filter(c=>c.code!==code)); setConfirm(null); }}); }
  function toggleCoupon(code){ setCoupons(p=>p.map(c=>c.code===code?{...c,active:!c.active}:c)); }

  return (
    <div style={{ maxWidth:1080, margin:"0 auto", padding:"24px 16px" }}>
      {confirm && <ConfirmModal msg={confirm.msg} onYes={confirm.action} onNo={()=>setConfirm(null)}/>}
      {svcModal && <ServiceModal mode={svcModal.mode} data={svcModal.data} onSave={saveSvc} onClose={()=>setSvcModal(null)}/>}
      {extraModal && <ExtraModal mode={extraModal.mode} data={extraModal.data} onSave={saveExtra} onClose={()=>setExtraModal(null)}/>}
      {couponModal && <CouponModal mode={couponModal.mode} data={couponModal.data} onSave={saveCoupon} onClose={()=>setCouponModal(null)}/>}
      {clientModal && <ClientModal mode={clientModal.mode} data={clientModal.data} onSave={saveClient} onClose={()=>setClientModal(null)}/>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div><h2 style={{ fontSize:22, fontWeight:900, color:TEXT }}>🛠 Admin Dashboard</h2><p style={{ color:MUTED, fontSize:13 }}>Full control panel — Yahweh Property Care</p></div>
        <button style={btn(WHITE,BLUE,BLUE)} onClick={onLogout}>Logout</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:26 }}>
        {[["📋","Total Bookings",bookings.length,BLUE],["💰","Revenue","$"+revenue.toFixed(0),GREEN],["⏳","Pending",bookings.filter(b=>b.status==="Pending").length,"#e67e22"],["👥","Clients",clients.length,BLUE]].map(([icon,label,val,color])=>(
          <div key={label} style={{ background:WHITE, borderRadius:13, border:`1px solid ${BORDER}`, padding:"16px 18px" }}>
            <div style={{ fontSize:24, marginBottom:5 }}>{icon}</div>
            <div style={{ fontSize:24, fontWeight:900, color }}>{val}</div>
            <div style={{ fontSize:12, color:MUTED }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ background:tab===t?BLUE:WHITE, color:tab===t?"#fff":MUTED, border:`1.5px solid ${tab===t?BLUE:BORDER}`, borderRadius:50, padding:"8px 20px", fontSize:13, fontWeight:700, cursor:"pointer", textTransform:"capitalize", transition:"all .2s" }}>{t}</button>
        ))}
      </div>

      {/* BOOKINGS */}
      {tab==="bookings" && <>
        <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bookings…" style={{ ...inp(200), padding:"8px 12px" }}/>
          {["All","Pending","Confirmed","Completed","Cancelled"].map(s=>{
            const a=filter===s; const col=sColors[s]||BLUE;
            return <button key={s} onClick={()=>setFilter(s)} style={{ background:a?col+"22":WHITE, color:a?col:MUTED, border:`1.5px solid ${a?col:BORDER}`, borderRadius:50, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all .2s" }}>{s}</button>;
          })}
        </div>
        <div style={{ background:WHITE, borderRadius:14, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"0.7fr 1.2fr 1fr 0.7fr 0.8fr 1.4fr 0.5fr", background:BG, padding:"10px 16px", fontSize:11, fontWeight:800, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>
            {["Ref","Service / Client","Date","Total","Status","Actions","Del"].map(h=><span key={h}>{h}</span>)}
          </div>
          {filteredBks.length===0&&<div style={{ padding:"24px", color:MUTED, textAlign:"center" }}>No bookings found.</div>}
          {filteredBks.map((b,i)=>(
            <div key={b.id} style={{ display:"grid", gridTemplateColumns:"0.7fr 1.2fr 1fr 0.7fr 0.8fr 1.4fr 0.5fr", padding:"12px 16px", borderTop:i>0?`1px solid ${BORDER}`:"none", alignItems:"center", fontSize:13 }}>
              <span style={{ fontWeight:800, color:BLUE }}>{b.id}</span>
              <div><div style={{ fontWeight:700 }}>{b.service}</div><div style={{ fontSize:11, color:MUTED }}>{b.clientName||"Guest"}</div></div>
              <span style={{ color:MUTED, fontSize:12 }}>{b.date}</span>
              <span style={{ fontWeight:700 }}>${b.total.toFixed(2)}</span>
              <StatusTag status={b.status}/>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {["Confirmed","Completed","Cancelled"].filter(s=>s!==b.status).map(s=>(
                  <button key={s} onClick={()=>updateBkStatus(b.id,s)} style={{ background:sColors[s]+"22", color:sColors[s], border:`1px solid ${sColors[s]}44`, borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:700, cursor:"pointer" }}>→{s}</button>
                ))}
              </div>
              <button onClick={()=>deleteBk(b.id)} style={{ background:"#fdecea", color:"#e74c3c", border:"1px solid #f5c6cb", borderRadius:6, padding:"4px 8px", fontSize:12, cursor:"pointer", fontWeight:700 }}>🗑</button>
            </div>
          ))}
        </div>
      </>}

      {/* CLIENTS */}
      {tab==="clients" && <>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
          <button style={btn(BLUE,"#fff")} onClick={()=>setClientModal({mode:"add",data:{name:"",email:"",phone:"",password:""}})}>+ Add Client</button>
        </div>
        <div style={{ background:WHITE, borderRadius:14, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.5fr 2fr 1fr 1fr 1fr 0.8fr", background:BG, padding:"10px 16px", fontSize:11, fontWeight:800, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>
            {["Name","Email","Phone","Bookings","Revenue","Actions"].map(h=><span key={h}>{h}</span>)}
          </div>
          {clients.map((c,i)=>{
            const cbks = bookings.filter(b=>b.clientId===c.id);
            const crev = cbks.reduce((s,b)=>s+b.total,0);
            return (
              <div key={c.id} style={{ display:"grid", gridTemplateColumns:"1.5fr 2fr 1fr 1fr 1fr 0.8fr", padding:"12px 16px", borderTop:i>0?`1px solid ${BORDER}`:"none", fontSize:13, alignItems:"center" }}>
                <span style={{ fontWeight:700 }}>{c.name}</span>
                <span style={{ color:MUTED, fontSize:12 }}>{c.email}</span>
                <span style={{ color:MUTED, fontSize:12 }}>{c.phone}</span>
                <span style={{ fontWeight:700, color:BLUE }}>{cbks.length}</span>
                <span style={{ fontWeight:700, color:GREEN }}>${crev.toFixed(2)}</span>
                <div style={{ display:"flex", gap:5 }}>
                  <button onClick={()=>setClientModal({mode:"edit",data:{...c}})} style={{ background:BL, color:BLUE, border:"none", borderRadius:6, padding:"4px 8px", fontSize:12, cursor:"pointer", fontWeight:700 }}>✏️</button>
                  <button onClick={()=>deleteClient(c.id)} style={{ background:"#fdecea", color:"#e74c3c", border:"none", borderRadius:6, padding:"4px 8px", fontSize:12, cursor:"pointer", fontWeight:700 }}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      </>}

      {/* SERVICES */}
      {tab==="services" && <>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
          <button style={btn(BLUE,"#fff")} onClick={()=>setSvcModal({mode:"add",data:{name:"",icon:"🧹",base:100,hasRooms:false}})}>+ Add Service</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
          {services.map(svc=>(
            <div key={svc.id} style={{ background:WHITE, borderRadius:13, border:`1px solid ${BORDER}`, padding:"18px 20px" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{svc.icon}</div>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>{svc.name}</div>
              <div style={{ color:GREEN, fontWeight:700, fontSize:16, marginBottom:4 }}>from ${svc.base}</div>
              <div style={{ fontSize:12, color:MUTED, marginBottom:14 }}>{svc.hasRooms?"Includes room pricing":"Flat rate"}</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setSvcModal({mode:"edit",data:{...svc}})} style={{ ...btn(BL,BLUE), padding:"6px 14px", fontSize:12, flex:1 }}>✏️ Edit</button>
                <button onClick={()=>deleteSvc(svc.id)} style={{ ...btn("#fdecea","#e74c3c"), padding:"6px 14px", fontSize:12, flex:1 }}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* EXTRAS / ADD-ONS */}
      {tab==="extras" && <>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
          <button style={btn(BLUE,"#fff")} onClick={()=>setExtraModal({mode:"add",data:{name:"",icon:"🧽",price:50}})}>+ Add Add-on</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
          {extras.map(ex=>(
            <div key={ex.id} style={{ background:WHITE, borderRadius:13, border:`1px solid ${BORDER}`, padding:"18px 20px" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{ex.icon}</div>
              <div style={{ fontWeight:800, fontSize:14, marginBottom:3 }}>{ex.name}</div>
              <div style={{ color:GREEN, fontWeight:700, fontSize:18, marginBottom:14 }}>+${ex.price}</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setExtraModal({mode:"edit",data:{...ex}})} style={{ ...btn(BL,BLUE), padding:"6px 14px", fontSize:12, flex:1 }}>✏️ Edit</button>
                <button onClick={()=>deleteExtra(ex.id)} style={{ ...btn("#fdecea","#e74c3c"), padding:"6px 14px", fontSize:12, flex:1 }}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* COUPONS */}
      {tab==="coupons" && <>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
          <button style={btn(BLUE,"#fff")} onClick={()=>setCouponModal({mode:"add",data:{code:"",disc:10}})}>+ Add Coupon</button>
        </div>
        <div style={{ background:WHITE, borderRadius:14, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", background:BG, padding:"10px 18px", fontSize:11, fontWeight:800, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>
            {["Code","Discount","Status","Actions"].map(h=><span key={h}>{h}</span>)}
          </div>
          {coupons.map((c,i)=>(
            <div key={c.code} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"13px 18px", borderTop:i>0?`1px solid ${BORDER}`:"none", alignItems:"center", fontSize:14 }}>
              <span style={{ fontWeight:900, color:BLUE, fontSize:15, letterSpacing:1 }}>{c.code}</span>
              <span style={{ fontWeight:800, color:GREEN, fontSize:16 }}>{c.disc}% off</span>
              <span>
                <button onClick={()=>toggleCoupon(c.code)} style={{ ...badge(c.active?GREEN:"#e74c3c"), cursor:"pointer", border:`1px solid ${c.active?GREEN+"44":"#e74c3c44"}` }}>{c.active?"Active":"Inactive"}</button>
              </span>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setCouponModal({mode:"edit",data:{code:c.code,disc:c.disc,active:c.active,_edit:true,_orig:c.code}})} style={{ ...btn(BL,BLUE), padding:"5px 12px", fontSize:12 }}>✏️ Edit</button>
                <button onClick={()=>deleteCoupon(c.code)} style={{ ...btn("#fdecea","#e74c3c"), padding:"5px 12px", fontSize:12 }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

// ── MODALS ──
function ServiceModal({ mode, data, onSave, onClose }) {
  const [f, setF] = useState({ ...data });
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  return (
    <Modal title={mode==="add"?"Add New Service":"Edit Service"} onClose={onClose}>
      <div style={{ marginBottom:13 }}><div style={sLbl}>Service Name</div><input value={f.name} onChange={set("name")} placeholder="e.g. Window Cleaning" style={inp()}/></div>
      <div style={{ marginBottom:13 }}><div style={sLbl}>Icon (emoji)</div><input value={f.icon} onChange={set("icon")} placeholder="🧹" style={inp()}/></div>
      <div style={{ marginBottom:13 }}><div style={sLbl}>Base Price ($)</div><input type="number" value={f.base} onChange={set("base")} placeholder="119" style={inp()}/></div>
      <div style={{ marginBottom:20 }}><div style={sLbl}>Room-based pricing?</div>
        <div style={{ display:"flex", gap:10 }}>
          {[["Yes",true],["No",false]].map(([l,v])=>(
            <div key={l} onClick={()=>setF(p=>({...p,hasRooms:v}))} style={{ border:`2px solid ${f.hasRooms===v?BLUE:BORDER}`, borderRadius:9, padding:"8px 20px", cursor:"pointer", background:f.hasRooms===v?BL:WHITE, color:f.hasRooms===v?BLUE:MUTED, fontWeight:700, fontSize:13 }}>{l}</div>
          ))}
        </div>
      </div>
      <button style={{ ...btn(BLUE,"#fff"), width:"100%" }} onClick={()=>onSave(f)}>Save Service</button>
    </Modal>
  );
}

function ExtraModal({ mode, data, onSave, onClose }) {
  const [f, setF] = useState({ ...data });
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  return (
    <Modal title={mode==="add"?"Add New Add-on":"Edit Add-on"} onClose={onClose}>
      <div style={{ marginBottom:13 }}><div style={sLbl}>Add-on Name</div><input value={f.name} onChange={set("name")} placeholder="e.g. Steam Mop" style={inp()}/></div>
      <div style={{ marginBottom:13 }}><div style={sLbl}>Icon (emoji)</div><input value={f.icon} onChange={set("icon")} placeholder="✨" style={inp()}/></div>
      <div style={{ marginBottom:20 }}><div style={sLbl}>Price ($)</div><input type="number" value={f.price} onChange={set("price")} placeholder="50" style={inp()}/></div>
      <button style={{ ...btn(BLUE,"#fff"), width:"100%" }} onClick={()=>onSave(f)}>Save Add-on</button>
    </Modal>
  );
}

function CouponModal({ mode, data, onSave, onClose }) {
  const [f, setF] = useState({ ...data });
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  return (
    <Modal title={mode==="add"?"Add New Coupon":"Edit Coupon"} onClose={onClose}>
      <div style={{ marginBottom:13 }}><div style={sLbl}>Coupon Code</div><input value={f.code} onChange={e=>setF(p=>({...p,code:e.target.value.toUpperCase()}))} placeholder="SAVE20" style={inp()}/></div>
      <div style={{ marginBottom:20 }}><div style={sLbl}>Discount (%)</div><input type="number" min={1} max={100} value={f.disc} onChange={set("disc")} placeholder="10" style={inp()}/></div>
      <button style={{ ...btn(BLUE,"#fff"), width:"100%" }} onClick={()=>onSave(f)}>Save Coupon</button>
    </Modal>
  );
}

function ClientModal({ mode, data, onSave, onClose }) {
  const [f, setF] = useState({ ...data });
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  return (
    <Modal title={mode==="add"?"Add New Client":"Edit Client"} onClose={onClose}>
      {[["Full Name","name","text","Jane Smith"],["Email","email","email","jane@example.com"],["Phone","phone","tel","04XX XXX XXX"],["Password","password","text","pass123"]].map(([l,k,t,p])=>(
        <div key={k} style={{ marginBottom:13 }}><div style={sLbl}>{l}</div><input type={t} value={f[k]||""} onChange={set(k)} placeholder={p} style={inp()}/></div>
      ))}
      <button style={{ ...btn(BLUE,"#fff"), width:"100%", marginTop:6 }} onClick={()=>onSave(f)}>Save Client</button>
    </Modal>
  );
}

// ── AUTH ──
function LoginScreen({ clients, onLogin, onAdmin, onGuest }) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  function tryLogin(){
    const u=clients.find(c=>c.email===email&&c.password===pass);
    if(u) onLogin(u); else setErr("Invalid credentials. Try sarah@example.com / pass123");
  }
  return (
    <div style={{ maxWidth:420, margin:"56px auto", padding:"0 16px" }}>
      <div style={card}>
        <div style={{ textAlign:"center", marginBottom:28 }}><Logo/><p style={{ color:MUTED, fontSize:14, marginTop:10 }}>Sign in to manage your bookings</p></div>
        {[["Email","email","email","you@example.com",setEmail,email],["Password","pass","password","••••••••",setPass,pass]].map(([l,id,t,p,fn,v])=>(
          <div key={id} style={{ marginBottom:14 }}><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>{l}</div><input type={t} value={v} onChange={e=>fn(e.target.value)} placeholder={p} style={inp()} onKeyDown={e=>e.key==="Enter"&&tryLogin()}/></div>
        ))}
        {err&&<div style={{ background:"#fdecea", border:"1px solid #f5c6cb", borderRadius:8, padding:"10px 12px", color:"#c0392b", fontSize:13, marginBottom:12 }}>{err}</div>}
        <button style={{ ...btn(BLUE,"#fff"), width:"100%", marginBottom:10 }} onClick={tryLogin}>Sign In →</button>
        <button style={{ ...btn(WHITE,BLUE,BLUE), width:"100%", marginBottom:14 }} onClick={onGuest}>Continue as Guest</button>
        <hr style={{ border:"none", borderTop:`1px solid ${BORDER}`, margin:"14px 0" }}/>
        <button onClick={onAdmin} style={{ width:"100%", background:BG, color:MUTED, border:`1px solid ${BORDER}`, borderRadius:9, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer" }}>🛠 Admin Login</button>
        <p style={{ textAlign:"center", fontSize:12, color:MUTED, marginTop:14 }}>Demo: sarah@example.com / pass123</p>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin, onBack }) {
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  return (
    <div style={{ maxWidth:360, margin:"56px auto", padding:"0 16px" }}>
      <div style={{ ...card, padding:36, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🔐</div>
        <h2 style={{ fontWeight:900, fontSize:20, color:BLUE, marginBottom:20 }}>Admin Access</h2>
        <div style={{ marginBottom:14, textAlign:"left" }}><div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Admin Password</div><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" style={inp()} onKeyDown={e=>e.key==="Enter"&&(pass==="admin123"?onLogin():setErr("Wrong password. Try: admin123"))}/></div>
        {err&&<div style={{ color:"#e74c3c", fontSize:13, marginBottom:10 }}>{err}</div>}
        <button style={{ ...btn(BLUE,"#fff"), width:"100%", marginBottom:10 }} onClick={()=>pass==="admin123"?onLogin():setErr("Wrong password. Try: admin123")}>Access Dashboard →</button>
        <button style={{ ...btn(WHITE,BLUE,BLUE), width:"100%" }} onClick={onBack}>← Back</button>
        <p style={{ fontSize:12, color:MUTED, marginTop:14 }}>Demo: admin123</p>
      </div>
    </div>
  );
}

// ── ROOT ──
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState(DEF_BOOKINGS);
  const [clients, setClients] = useState(DEF_CLIENTS);
  const [services, setServices] = useState(DEF_SERVICES);
  const [extras, setExtras] = useState(DEF_EXTRAS);
  const [coupons, setCoupons] = useState(DEF_COUPONS);

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Header */}
      <header style={{ background:WHITE, borderBottom:`1px solid ${BORDER}`, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, position:"sticky", top:0, zIndex:200 }}>
        <Logo/>
        <nav style={{ display:"flex", alignItems:"center", gap:10 }}>
          {screen!=="login"&&screen!=="adminlogin"&&<>
            {user&&<button onClick={()=>setScreen("client")} style={{ background:"none", border:"none", color:MUTED, fontSize:13, cursor:"pointer", fontWeight:600 }}>My Bookings</button>}
            <button style={btn(GREEN,"#fff")} onClick={()=>setScreen("book")}>+ Book a Clean</button>
            {!user&&<button style={btn(WHITE,BLUE,BLUE)} onClick={()=>setScreen("login")}>Login</button>}
            {user&&<button style={btn(WHITE,BLUE,BLUE)} onClick={()=>{setUser(null);setScreen("login");}}>Logout</button>}
          </>}
          <a href="tel:1300925355" style={{ color:GREEN, fontWeight:800, textDecoration:"none", fontSize:14 }}>📞 1300 925 355</a>
        </nav>
      </header>

      {screen==="login" && <LoginScreen clients={clients} onLogin={u=>{setUser(u);setScreen("client");}} onAdmin={()=>setScreen("adminlogin")} onGuest={()=>setScreen("book")}/>}
      {screen==="adminlogin" && <AdminLogin onLogin={()=>setScreen("admin")} onBack={()=>setScreen("login")}/>}
      {screen==="book" && <BookingApp user={user} services={services} extras={extras} coupons={coupons} onComplete={nb=>{setBookings(p=>[...p,nb]);}}/>}
      {screen==="client" && user && <ClientDash user={user} bookings={bookings} onLogout={()=>{setUser(null);setScreen("login");}} onBook={()=>setScreen("book")}/>}
      {screen==="admin" && <AdminDash bookings={bookings} setBookings={setBookings} clients={clients} setClients={setClients} services={services} setServices={setServices} extras={extras} setExtras={setExtras} coupons={coupons} setCoupons={setCoupons} onLogout={()=>setScreen("login")}/>}
    </div>
  );
}
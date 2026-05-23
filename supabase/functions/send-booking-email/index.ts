const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "bookings@yahwehpc.com.au";
const ADMIN_EMAILS = ["alex@yahwehpc.com.au", "ron.web108@gmail.com"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = await req.json();
    const { type, booking } = body;

    if (!booking) return new Response(JSON.stringify({ error: "No booking data" }), { status: 400 });

    if (type === "client_confirmation") {
      await sendClientEmail(booking);
    } else if (type === "admin_alert") {
      await sendAdminEmail(booking);
    } else {
      await sendClientEmail(booking);
      await sendAdminEmail(booking);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});

// ── CLIENT CONFIRMATION EMAIL ──
async function sendClientEmail(b: any) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:linear-gradient(135deg,#1b75bb,#2196f3);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">✅</div>
      <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 8px;">Booking Confirmed!</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Thank you for choosing Yahweh Property Care</p>
    </div>
    <div style="background:#ffffff;padding:32px;border:1px solid #e0e7ef;border-top:none;">
      <p style="font-size:16px;color:#1a2533;margin:0 0 24px;">Hi <strong>${b.clientName}</strong>, your booking is confirmed! Here are your details:</p>
      <div style="background:#f5f7fa;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:800;color:#1b75bb;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px;">📋 Booking Details</div>
        ${row("Booking ID", b.bookingId)}
        ${row("Service", b.service)}
        ${row("Date", b.date)}
        ${row("Time", b.time)}
        ${row("Frequency", b.freq)}
        ${b.extras?.length ? row("Extras", b.extras.join(", ")) : ""}
      </div>
      <div style="background:#f5f7fa;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:800;color:#1b75bb;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px;">📍 Location</div>
        ${row("Address", b.address)}
      </div>
      <div style="background:#f5f7fa;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:800;color:#1b75bb;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px;">💰 Pricing</div>
        ${row("Subtotal", `A$${Number(b.subtotal).toFixed(2)}`)}
        ${Number(b.discountAmount) > 0 ? row("Discount", `-A$${Number(b.discountAmount).toFixed(2)}`) : ""}
        ${row("GST", b.isNDIS ? "GST Free (NDIS)" : `A$${Number(b.gst).toFixed(2)}`)}
        <div style="border-top:1px dashed #e0e7ef;margin:10px 0;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:800;font-size:15px;color:#1a2533;">Total (AUD)</span>
          <span style="font-weight:900;font-size:22px;color:#1b75bb;">A$${Number(b.total).toFixed(2)}</span>
        </div>
      </div>
      <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;padding:14px 18px;margin-bottom:24px;font-size:13px;color:#7a5c00;">
        ⏰ Our team will call <strong>${b.phone}</strong> within 2 hours to confirm your appointment.
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://yahweh-booking.vercel.app/client" style="background:#1b75bb;color:#ffffff;text-decoration:none;border-radius:10px;padding:14px 32px;font-size:15px;font-weight:700;display:inline-block;">View My Bookings</a>
      </div>
      <p style="font-size:13px;color:#7a90a8;text-align:center;">Questions? Call us at <a href="tel:1300925355" style="color:#7eb842;font-weight:700;text-decoration:none;">1300 925 355</a></p>
    </div>
    <div style="background:#1a2533;border-radius:0 0 16px 16px;padding:20px;text-align:center;">
      <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;">© 2026 Yahweh Property Care · <a href="https://yahwehpc.com.au" style="color:#7eb842;text-decoration:none;">yahwehpc.com.au</a></p>
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: b.clientEmail,
    subject: `✅ Booking Confirmed — ${b.service} on ${b.date}`,
    html,
  });
}

// ── ADMIN ALERT EMAIL ──
async function sendAdminEmail(b: any) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:linear-gradient(135deg,#7eb842,#5a9e2f);border-radius:16px 16px 0 0;padding:28px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🔔</div>
      <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0;">New Booking Received!</h1>
    </div>
    <div style="background:#ffffff;padding:28px;border:1px solid #e0e7ef;border-top:none;border-radius:0 0 16px 16px;">
      <div style="background:#f5f7fa;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:800;color:#7eb842;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px;">👤 Client</div>
        ${row("Name", b.clientName)}
        ${row("Email", b.clientEmail)}
        ${row("Phone", b.phone)}
      </div>
      <div style="background:#f5f7fa;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:800;color:#7eb842;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px;">📋 Booking</div>
        ${row("ID", b.bookingId)}
        ${row("Service", b.service)}
        ${row("Date", b.date)}
        ${row("Time", b.time)}
        ${row("Address", b.address)}
        ${row("Frequency", b.freq)}
        ${b.extras?.length ? row("Extras", b.extras.join(", ")) : ""}
        ${b.notes ? row("Notes", b.notes) : ""}
      </div>
      <div style="background:#e8f3fb;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:13px;color:#7a90a8;margin-bottom:4px;">Total Charged</div>
        <div style="font-size:32px;font-weight:900;color:#1b75bb;">A$${Number(b.total).toFixed(2)}</div>
      </div>
      <div style="text-align:center;margin-top:20px;">
        <a href="https://yahweh-booking.vercel.app/admin" style="background:#1b75bb;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 28px;font-size:14px;font-weight:700;display:inline-block;">Open Admin Dashboard</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  for (const adminEmail of ADMIN_EMAILS) {
    await sendEmail({
      to: adminEmail,
      subject: `🔔 New Booking — ${b.clientName} · ${b.service} · A$${Number(b.total).toFixed(2)}`,
      html,
    });
  }
}

// ── SEND VIA RESEND ──
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

// ── HTML ROW HELPER ──
function row(label: string, value: string) {
  return `
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
      <span style="color:#7a90a8;">${label}</span>
      <span style="font-weight:600;color:#1a2533;text-align:right;max-width:60%;">${value || "—"}</span>
    </div>`;
}
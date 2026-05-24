const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const FROM_EMAIL = "bookings@yahwehpc.com.au";
const ADMIN_EMAILS = ["alex@yahwehpc.com.au", "ron.web108@gmail.com"];
const APP_URL = "https://yahweh-booking.vercel.app";

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

    // ── Generate password setup link if email provided (new guest account) ──
    let setupLink = null;
    if (booking.clientEmail && booking.isNewAccount) {
      try {
        const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "apikey": SUPABASE_SERVICE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "recovery",
            email: booking.clientEmail,
            options: {
              redirect_to: `${APP_URL}/set-password`,
            },
          }),
        });
        const linkData = await linkRes.json();
        console.log("Link generation response:", JSON.stringify(linkData));
        // The action_link is nested in properties
        setupLink = linkData?.properties?.action_link || linkData?.action_link || null;
        console.log("Setup link:", setupLink);
      } catch (e) {
        console.warn("Could not generate setup link:", e);
      }
    }

    if (type === "admin_alert") {
      await sendAdminEmail(booking);
    } else {
      // Always send the combined client email
      await sendClientEmail(booking, setupLink);
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

// ── CLIENT EMAIL — booking details + optional password setup ──
async function sendClientEmail(b: any, setupLink: string | null) {
  const hasSetup = !!setupLink;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;background:#f4f7fb;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td align="center" style="padding:50px 40px;background:linear-gradient(135deg,#0978bd 0%,#7eb842 100%);">
              <div style="width:72px;height:72px;line-height:72px;border-radius:50%;background:rgba(255,255,255,0.15);font-size:40px;margin:0 auto 20px;">✅</div>
              <h1 style="margin:0;color:#ffffff;font-size:34px;font-weight:700;">Booking Confirmed!</h1>
              <p style="margin-top:12px;color:rgba(255,255,255,0.92);font-size:16px;line-height:26px;">Thank you for choosing Yahweh Property Care</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 30px;">

              <p style="font-size:16px;line-height:28px;color:#475569;margin:0 0 28px;">
                Hi <strong style="color:#0f172a;">${b.clientName}</strong>, your booking is confirmed! Here are your details:
              </p>

              <!-- BOOKING DETAILS -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbfd;border:1px solid #e5eef5;border-radius:16px;margin-bottom:20px;">
                <tr><td style="padding:24px;">
                  <div style="color:#0978bd;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">📋 Booking Details</div>
                  ${rowTable("Booking ID", `<strong>${b.bookingId}</strong>`)}
                  ${rowTable("Service", b.service)}
                  ${rowTable("Date", b.date)}
                  ${rowTable("Time", b.time)}
                  ${rowTable("Frequency", b.freq)}
                  ${b.extras?.length ? rowTable("Extras", b.extras.join(", ")) : ""}
                  ${b.notes ? rowTable("Notes", b.notes) : ""}
                </td></tr>
              </table>

              <!-- LOCATION -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbfd;border:1px solid #e5eef5;border-radius:16px;margin-bottom:20px;">
                <tr><td style="padding:24px;">
                  <div style="color:#0978bd;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">📍 Location</div>
                  ${rowTable("Address", b.address)}
                  ${rowTable("Phone", b.phone)}
                </td></tr>
              </table>

              <!-- PRICING -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbfd;border:1px solid #e5eef5;border-radius:16px;margin-bottom:20px;">
                <tr><td style="padding:24px;">
                  <div style="color:#0978bd;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">💰 Pricing</div>
                  ${rowTable("Subtotal", `A${Number(b.subtotal).toFixed(2)}`)}
                  ${Number(b.discountAmount) > 0 ? rowTable("Discount", `-A${Number(b.discountAmount).toFixed(2)}`) : ""}
                  ${rowTable("GST", b.isNDIS ? "GST Free (NDIS)" : `A${Number(b.gst).toFixed(2)}`)}
                  <div style="border-top:1px dashed #e0e7ef;margin:12px 0;"></div>
                  <table width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td style="font-size:15px;font-weight:800;color:#0f172a;">Total (AUD)</td>
                    <td align="right" style="font-size:26px;font-weight:900;color:#0978bd;">A${Number(b.total).toFixed(2)}</td>
                  </tr></table>
                </td></tr>
              </table>

              <!-- CALL NOTICE -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;margin-bottom:30px;">
                <tr><td style="padding:16px 22px;color:#166534;font-size:14px;line-height:24px;">
                  ⏰ Our team will call <strong>${b.phone}</strong> within 2 hours to confirm your appointment.
                </td></tr>
              </table>

              ${hasSetup ? `
              <!-- ACCOUNT SETUP SECTION — NEW GUEST -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbfd;border:1px solid #e5eef5;border-radius:16px;margin-bottom:30px;">
                <tr><td style="padding:32px;" align="center">

                  <div style="width:60px;height:60px;line-height:60px;border-radius:50%;background:rgba(9,120,189,0.08);font-size:32px;margin:0 auto 16px;">🔐</div>
                  <h2 style="margin:0 0 8px;color:#0f172a;font-size:24px;font-weight:700;">Your account is ready 🎉</h2>
                  <p style="font-size:15px;line-height:28px;color:#475569;margin:0 0 24px;">
                    Your customer portal is now ready. Set up your password to access your bookings anytime.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5eef5;border-radius:14px;margin-bottom:28px;">
                    <tr><td style="padding:22px;">
                      <div style="color:#0978bd;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">CUSTOMER PORTAL ACCESS</div>
                      <p style="margin:0;color:#475569;font-size:15px;line-height:32px;">
                        ✔ View your bookings<br>
                        ✔ Manage upcoming services<br>
                        ✔ Track job updates<br>
                        ✔ Download invoices<br>
                        ✔ Reschedule appointments
                      </p>
                    </td></tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px;">
                    <tr>
                      <td align="center" style="border-radius:14px;background:linear-gradient(135deg,#0978bd 0%,#7eb842 100%);box-shadow:0 8px 24px rgba(9,120,189,0.28);">
                        <a href="${setupLink}" style="display:inline-block;padding:18px 38px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;border-radius:14px;">
                          Set Up My Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size:13px;color:#94a3b8;margin:0;">This link expires in 24 hours. If you did not create this booking, you can safely ignore this email.</p>

                </td></tr>
              </table>
              ` : `
              <!-- RETURNING USER -->
              <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 30px;">
                <tr>
                  <td align="center" style="border-radius:14px;background:linear-gradient(135deg,#0978bd 0%,#7eb842 100%);box-shadow:0 8px 24px rgba(9,120,189,0.28);">
                    <a href="${APP_URL}/client" style="display:inline-block;padding:18px 38px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;border-radius:14px;">
                      View My Bookings
                    </a>
                  </td>
                </tr>
              </table>
              `}

              <p style="font-size:14px;color:#64748b;text-align:center;margin:0;">
                Questions? Call us at <a href="tel:1300925355" style="color:#7eb842;font-weight:700;text-decoration:none;">1300 925 355</a>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background:#f8fafc;padding:30px 25px;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#0f172a;">Yahweh Property Care</p>
              <p style="margin:0;font-size:13px;line-height:24px;color:#64748b;">
                Professional Cleaning & Property Services<br>
                © 2026 Yahweh Property Care. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  await sendEmail({
    to: b.clientEmail,
    subject: `✅ Booking Confirmed — ${b.service} on ${b.date}`,
    html,
  });
}

// ── ADMIN ALERT EMAIL (unchanged) ──
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
        ${row("New Account", b.isNewAccount ? "✅ Yes — account created" : "Returning client")}
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
        <a href="${APP_URL}/admin" style="background:#1b75bb;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 28px;font-size:14px;font-weight:700;display:inline-block;">Open Admin Dashboard</a>
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

// ── HELPERS ──
function rowTable(label: string, value: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td style="font-size:14px;color:#64748b;">${label}</td>
        <td align="right" style="font-size:14px;font-weight:600;color:#0f172a;max-width:60%;">${value || "—"}</td>
      </tr>
    </table>`;
}

function row(label: string, value: string) {
  return rowTable(label, value);
}

function tick(text: string) {
  return `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px;color:#1a2533;">
      <span style="color:#7eb842;font-weight:800;">✔️</span> ${text}
    </div>`;
}
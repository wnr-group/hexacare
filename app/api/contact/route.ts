import { NextResponse } from "next/server";

/* Env: RESEND_API_KEY, CONTACT_FROM_EMAIL (verified sender), CONTACT_TO_EMAIL (fallback inbox). */
const DEPARTMENT_INBOX: Record<string, string> = {
  order: "support@hexacare.in",
  pap: "support@hexacare.in",
  sourcing: "sourcing@hexacare.in",
  partnership: "partners@hexacare.in",
  other: "support@hexacare.in",
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = str(body.name, 120);
  const phone = str(body.phone, 30);
  const email = str(body.email, 200);
  const department = str(body.department, 30);
  const message = str(body.message, 5000);

  if (!name || !phone || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !(department in DEPARTMENT_INBOX)) {
    return NextResponse.json({ error: "Please fill in all fields correctly." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Contact form: RESEND_API_KEY / CONTACT_FROM_EMAIL not configured");
    return NextResponse.json({ error: "Messaging is temporarily unavailable. Please email us directly." }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [process.env.CONTACT_TO_EMAIL || DEPARTMENT_INBOX[department]],
      reply_to: email,
      subject: `[Website inquiry · ${department}] ${name}`,
      html: `<p><b>Name:</b> ${escapeHtml(name)}<br><b>Phone:</b> ${escapeHtml(phone)}<br><b>Email:</b> ${escapeHtml(email)}<br><b>Department:</b> ${escapeHtml(department)}</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!res.ok) {
    console.error("Contact form: Resend failed", res.status);
    return NextResponse.json({ error: "We couldn't send your message. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

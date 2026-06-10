import nodemailer from "nodemailer";

export async function sendNotification(subject: string, body: string) {
  const user = process.env["NOTIFY_EMAIL"];
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!user || !pass) throw new Error("NOTIFY_EMAIL and GMAIL_APP_PASSWORD must be set");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `Money Tracker <${user}>`,
    to: user,
    subject,
    text: body,
  });
}

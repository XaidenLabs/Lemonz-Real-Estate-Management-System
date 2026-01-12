const nodemailer = require("nodemailer");

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true; // true for 465, false for 587
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const DEFAULT_FROM = process.env.EMAIL_FROM || EMAIL_USER;

let transporter = null;
if (EMAIL_USER && EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  transporter.verify((err, success) => {
    if (err) console.warn("SMTP connection verify failed:", err.message || err);
    else console.log("SMTP transporter ready");
  });
} else {
  console.warn("EMAIL_USER or EMAIL_PASSWORD not set; SMTP email sending will fail until configured.");
}

async function sendMail({ from, to, subject, html, text }) {
  if (!transporter) throw new Error("SMTP transporter not configured (set EMAIL_USER and EMAIL_PASSWORD)");

  const mailOptions = {
    from: from || DEFAULT_FROM,
    to,
    subject: subject || "",
    html: html || undefined,
    text: text || undefined,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error("SMTP sendMail error:", err?.message || err);
    throw err;
  }
}

module.exports = {
  sendMail,
};

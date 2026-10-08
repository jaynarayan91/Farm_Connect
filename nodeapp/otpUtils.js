const nodemailer = require('nodemailer');
require('dotenv').config();


// In-memory OTP store: { email: { otp, expiresAt } }
const otpStore = new Map();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email) => {
  const otp = generateOTP();
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  try {
    await transporter.sendMail({
      from: `"FarmConnect" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'FarmConnect - Password Reset OTP',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:16px;">
          <h2 style="color:#065f46;margin-bottom:8px;">Password Reset OTP</h2>
          <p style="color:#6b7280;font-size:14px;">Use the OTP below to reset your FarmConnect password. It expires in <strong>10 minutes</strong>.</p>
          <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#059669;text-align:center;padding:24px 0;">${otp}</div>
          <p style="color:#9ca3af;font-size:12px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.warn('Email sending failed, OTP for', email, ':', otp, '| Error:', err.message);
  }

  return otp;
};

const verifyOTP = (email, otp) => {
  const record = otpStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) { otpStore.delete(email); return false; }
  if (record.otp !== otp) return false;
  otpStore.delete(email);
  return true;
};

module.exports = { sendOTP, verifyOTP };

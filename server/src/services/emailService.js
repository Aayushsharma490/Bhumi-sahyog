// Email notification service using Resend
// Gracefully disabled if RESEND_API_KEY is not configured

import { config } from 'dotenv';
config();

let resendClient = null;
let emailEnabled = false;

try {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    emailEnabled = true;
    console.log('✅ Resend Email: configured');
  } else {
    console.warn('⚠️  Resend: No API key. Email notifications disabled (in-app only).');
  }
} catch (e) {
  console.warn('Resend init error:', e.message);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@bhumisahyog.com';

/**
 * Send procurement reminder email
 */
export async function sendProcurementReminder({ to, farmerName, tokenNumber, mandiName, crop, date, slot }) {
  if (!emailEnabled) {
    console.log(`[EMAIL DISABLED] Would send procurement reminder to ${to}`);
    return { sent: false, reason: 'Email not configured' };
  }

  try {
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Bhumi Sahyog — Procurement Slot Tomorrow | Token T-${tokenNumber}`,
      html: buildEmailHTML(
        'Procurement Slot Reminder',
        farmerName,
        `
          <p>Aapka procurement slot <strong>kal ${date}</strong> ko hai.</p>
          <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin:16px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#6b7280;padding:6px 0;">Mandi</td><td><strong>${mandiName}</strong></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0;">Crop</td><td><strong>${crop}</strong></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0;">Token</td><td><strong style="font-size:18px;color:#166534;">T-${tokenNumber}</strong></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0;">Slot</td><td><strong>${slot}</strong></td></tr>
            </table>
          </div>
          <p>Queue status track karne ke liye Bhumi Sahyog app use karein.</p>
        `
      ),
    });
    return { sent: true, id: result.id };
  } catch (e) {
    console.error('Email send error:', e.message);
    return { sent: false, error: e.message };
  }
}

/**
 * Send queue update email
 */
export async function sendQueueUpdate({ to, farmerName, tokenNumber, farmersAhead, estimatedWait }) {
  if (!emailEnabled) {
    return { sent: false, reason: 'Email not configured' };
  }

  try {
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Bhumi Sahyog — Queue Update | ${farmersAhead} farmers ahead`,
      html: buildEmailHTML(
        'Queue Update',
        farmerName,
        `
          <p>Aapke queue ki update:</p>
          <div style="background:#fef3c7;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
            <div style="font-size:48px;font-weight:900;color:#166534;">T-${tokenNumber}</div>
            <p style="color:#92400e;margin:8px 0 0;font-weight:500;">Aapka Token</p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">
            <div style="background:#f8fafc;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:24px;font-weight:700;">${farmersAhead}</div>
              <div style="color:#6b7280;font-size:12px;">Farmers Ahead</div>
            </div>
            <div style="background:#f8fafc;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:24px;font-weight:700;">~${estimatedWait}m</div>
              <div style="color:#6b7280;font-size:12px;">Est. Wait</div>
            </div>
          </div>
        `
      ),
    });
    return { sent: true, id: result.id };
  } catch (e) {
    return { sent: false, error: e.message };
  }
}

/**
 * Send payment update email
 */
export async function sendPaymentUpdate({ to, farmerName, amount, status, reference }) {
  if (!emailEnabled) {
    return { sent: false, reason: 'Email not configured' };
  }

  const statusColor = status === 'PAID' ? '#22c55e' : status === 'PROCESSING' ? '#f59e0b' : '#ef4444';

  try {
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Bhumi Sahyog — Payment ${status} | ₹${Number(amount).toLocaleString('en-IN')}`,
      html: buildEmailHTML(
        'Payment Update',
        farmerName,
        `
          <div style="background:linear-gradient(135deg,#1d4ed8,#1e40af);border-radius:12px;padding:24px;margin:16px 0;text-align:center;color:white;">
            <div style="font-size:36px;font-weight:900;">₹${Number(amount).toLocaleString('en-IN')}</div>
            <div style="margin-top:8px;background:${statusColor}33;color:${statusColor};display:inline-block;padding:4px 12px;border-radius:20px;font-weight:600;">
              ${status}
            </div>
          </div>
          <p>Reference: <code style="background:#f1f5f9;padding:2px 8px;border-radius:4px;font-family:monospace;">${reference}</code></p>
        `
      ),
    });
    return { sent: true, id: result.id };
  } catch (e) {
    return { sent: false, error: e.message };
  }
}

function buildEmailHTML(title, farmerName, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:20px;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#052e16,#166534);padding:24px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:white;">🌾 Bhumi Sahyog</div>
          <div style="color:#86efac;font-size:12px;margin-top:4px;">Predict. Inform. Reduce Waiting.</div>
        </div>
        <!-- Content -->
        <div style="padding:24px;">
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 8px;">${title}</h2>
          <p style="color:#64748b;">Namaste <strong>${farmerName}</strong> ji,</p>
          ${content}
        </div>
        <!-- Footer -->
        <div style="padding:16px 24px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="color:#94a3b8;font-size:11px;margin:0;">
            Bhumi Sahyog · Prototype Demo · Not official government communication
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export { emailEnabled };

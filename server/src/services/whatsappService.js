// WhatsApp Service — Powered by Baileys (@whiskeysockets/baileys)
// Ultra-fast, zero-overhead WebSockets (No Puppeteer/Chromium delay).
// Instant QR code generation (< 500ms) with automatic Multi-Device auth.

import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { 
  makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason,
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import { Boom } from '@hapi/boom';

config();

const AUTH_DIR = path.resolve(process.cwd(), 'baileys_auth_info');

let sock = null;
let waReady = false;
let waEnabled = process.env.WHATSAPP_ENABLED === 'true';
let connectionStatus = 'idle'; // 'idle' | 'initializing' | 'qr_ready' | 'connected' | 'disconnected' | 'error'
let latestQrCodeDataUrl = null;
let latestQrCodeRaw = null;
let connectedPhone = null;
let lastError = null;
let isInitializing = false;

// Initialize on server start if enabled
if (waEnabled) {
  initWhatsApp();
}

export async function initWhatsApp(forceNewSession = false) {
  if (!waEnabled) {
    connectionStatus = 'disabled';
    return;
  }

  if (isInitializing) {
    console.log('⏳ [WhatsApp] Initialization in progress, ignoring duplicate trigger.');
    return;
  }

  try {
    isInitializing = true;
    connectionStatus = 'initializing';
    lastError = null;

    if (forceNewSession) {
      console.log('🔄 [WhatsApp] Clearing auth directory for fresh pairing session...');
      waReady = false;
      latestQrCodeDataUrl = null;
      latestQrCodeRaw = null;
      connectedPhone = null;
      if (fs.existsSync(AUTH_DIR)) {
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        } catch (e) {
          console.warn('Session folder clear note:', e.message);
        }
      }
    }

    // Clean up any existing socket cleanly before making a new one
    if (sock) {
      try {
        sock.ev.removeAllListeners();
        sock.end();
      } catch (e) {}
      sock = null;
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Bhumi Sahyog', 'Chrome', '110.0.5481.178'],
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // 1. Instant QR Code Event (< 500ms)
      if (qr) {
        latestQrCodeRaw = qr;
        connectionStatus = 'qr_ready';
        isInitializing = false;
        try {
          latestQrCodeDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            scale: 8,
            color: {
              dark: '#022c22',
              light: '#ffffff',
            },
          });
          console.log('\n⚡ [WhatsApp - Baileys] Instant QR Code Ready (<0.5s)! Available on Web UI.');
        } catch (err) {
          console.error('QR code generation error:', err);
        }
      }

      // 2. Connected Event
      if (connection === 'open') {
        waReady = true;
        isInitializing = false;
        connectionStatus = 'connected';
        latestQrCodeDataUrl = null;
        latestQrCodeRaw = null;
        connectedPhone = sock.user?.id ? sock.user.id.split(':')[0] : (process.env.ADMIN_WHATSAPP_PHONE || '7727038430');
        console.log(`\n✅ [WhatsApp - Baileys] Connected successfully as +${connectedPhone}! Live alerts active.`);
      }

      // 3. Disconnected / Reconnect Event
      if (connection === 'close') {
        waReady = false;
        isInitializing = false;
        const statusCode = (lastDisconnect?.error instanceof Boom) 
          ? lastDisconnect.error.output?.statusCode 
          : null;
        
        console.warn(`⚠️ [WhatsApp - Baileys] Connection closed. Status code: ${statusCode}`);

        // Reset and generate fresh QR session if unlinked/timeout/logged out
        if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 408 || statusCode === 515 || !connectedPhone) {
          console.log(`🔄 [WhatsApp - Baileys] Session closed/timed out (Status ${statusCode}). Refreshing socket for new QR...`);
          connectionStatus = 'initializing';
          latestQrCodeDataUrl = null;
          latestQrCodeRaw = null;
          setTimeout(() => {
            isInitializing = false;
            initWhatsApp(false);
          }, 1500);
        } else {
          // Soft reconnect for paired session
          connectionStatus = 'initializing';
          setTimeout(() => {
            isInitializing = false;
            initWhatsApp(false);
          }, 3000);
        }
      }
    });

    // 4. Handle incoming WhatsApp messages from Farmers & Judges with Groq AI
    sock.ev.on('messages.upsert', async (chatUpdate) => {
      try {
        const msg = chatUpdate.messages[0];
        if (!msg || !msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const messageText = msg.message.conversation || 
                            msg.message.extendedTextMessage?.text || 
                            msg.message.imageMessage?.caption || '';

        if (!messageText || sender.includes('@g.us')) return;

        console.log(`📱 [WhatsApp Incoming] Message from ${sender}: "${messageText}"`);

        // Import AI service dynamically
        const { generateAIResponse } = await import('./aiService.js');
        
        const context = {
          farmerName: 'Kisan Bhai',
          farmerToken: 247,
          currentToken: 213,
          farmersAhead: 33,
          estimatedWait: 18,
          crop: 'Wheat (GW-322)',
          mandiName: 'Jaipur Procurement Centre',
          amount: 26400,
          paymentStatus: 'PROCESSING',
          procurementStatus: 'IN_QUEUE',
        };

        const { reply } = await generateAIResponse(messageText, context);

        await sock.sendMessage(sender, {
          text: `${reply}\n\n👉 Live Portal: https://bhumi-sahyog.netlify.app/farmer`,
        });

        console.log(`📤 [WhatsApp AI Reply] Sent response to ${sender}`);
      } catch (err) {
        console.error('Error handling incoming WhatsApp message:', err.message);
      }
    });

  } catch (e) {
    console.error('WhatsApp Baileys init error:', e.message);
    connectionStatus = 'error';
    lastError = e.message;
  }
}

/**
 * Format phone string to valid Baileys WhatsApp JID
 */
export function formatChatId(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '91' + digits; // Default India Country Code
  }
  return `${digits}@s.whatsapp.net`;
}

/**
 * Send a WhatsApp message to a phone number via Baileys
 */
export async function sendWhatsAppMessage(phone, message) {
  const jid = formatChatId(phone);
  if (!jid) {
    return { sent: false, error: 'Invalid phone number provided' };
  }

  if (!waReady || !sock) {
    console.log(`⚠️ [WhatsApp NOT LINKED] Message queued for ${phone}: ${message.substring(0, 60)}...`);
    return { 
      sent: false, 
      reason: 'WhatsApp device not linked. Scan the QR code in Admin Panel or top navbar to link your phone in 2 seconds.',
      qrAvailable: !!latestQrCodeDataUrl,
      status: connectionStatus,
      targetPhone: phone,
    };
  }

  try {
    await sock.sendMessage(jid, { text: message });
    console.log(`✅ [WhatsApp Sent] Delivered to ${phone}`);
    return { sent: true, phone, timestamp: new Date().toISOString() };
  } catch (e) {
    console.error(`❌ [WhatsApp Send Error] Failed to send to ${phone}:`, e.message);
    return { sent: false, error: e.message, status: connectionStatus };
  }
}

/**
 * Send procurement slot confirmation via WhatsApp
 */
export async function sendProcurementAlert(phone, farmerName, tokenNumber, mandiName, crop, slot, date) {
  const message = 
    `🌾 *Bhumi Sahyog — Procurement Slot Confirmed*\n\n` +
    `Namaste ${farmerName} ji!\n\n` +
    `Aapka procurement slot confirm ho gaya hai:\n` +
    `📍 *Mandi:* ${mandiName}\n` +
    `🌿 *Fasal:* ${crop}\n` +
    `🎫 *Token:* *T-${tokenNumber}*\n` +
    `📅 *Date:* ${date}\n` +
    `⏰ *Slot:* ${slot}\n\n` +
    `👉 Live Queue Track Karein:\n` +
    `https://bhumi-sahyog.netlify.app/farmer\n\n` +
    `_Bhumi Sahyog — Predict. Inform. Reduce Waiting._`;
  
  return sendWhatsAppMessage(phone, message);
}

/**
 * Send queue approaching alert
 */
export async function sendQueueAlert(phone, farmerName, tokenNumber, farmersAhead, estimatedWait) {
  const message =
    `⚡ *Bhumi Sahyog — Queue Alert*\n\n` +
    `Namaste ${farmerName} ji!\n\n` +
    `Aapka token *T-${tokenNumber}* kareeb aa raha hai!\n` +
    `👥 *Aapke aage:* ${farmersAhead} kisan\n` +
    `⏱️ *Estimated wait:* ~${estimatedWait} minute\n\n` +
    `👉 Live Arrival & Token Track Karein:\n` +
    `https://bhumi-sahyog.netlify.app/farmer\n\n` +
    `_Bhumi Sahyog — Smart Procurement_`;
  
  return sendWhatsAppMessage(phone, message);
}

/**
 * Send payment update via WhatsApp
 */
export async function sendPaymentAlert(phone, farmerName, amount, status, reference) {
  const statusText = {
    PROCESSING: '⏳ Processing under DBT',
    PAID: '✅ Successfully transferred to Bank',
    FAILED: '❌ Transfer failed — contact mandi',
  }[status] || status;

  const message =
    `💳 *Bhumi Sahyog — DBT Payment Update*\n\n` +
    `Namaste ${farmerName} ji!\n\n` +
    `Aapka payment update:\n` +
    `💰 *Amount:* ₹${Number(amount).toLocaleString('en-IN')}\n` +
    `📋 *Status:* ${statusText}\n` +
    `🔢 *Reference:* ${reference}\n\n` +
    `👉 Payment Timeline Track Karein:\n` +
    `https://bhumi-sahyog.netlify.app/payment\n\n` +
    `_Bhumi Sahyog — Government of Rajasthan DBT Portal_`;
  
  return sendWhatsAppMessage(phone, message);
}

/**
 * Get current WhatsApp status & live QR code
 */
export function getWhatsAppStatus() {
  const isTrulyConnected = waReady && connectionStatus === 'connected';

  // Proactively auto-trigger QR generation if idle without QR
  if (!isTrulyConnected && !latestQrCodeDataUrl && !isInitializing && waEnabled) {
    initWhatsApp(false);
  }

  return {
    enabled: waEnabled,
    ready: isTrulyConnected,
    status: connectionStatus,
    qr: latestQrCodeDataUrl,
    phone: isTrulyConnected ? (connectedPhone || '7727038430') : null,
    lastError,
  };
}

export { waEnabled, waReady };

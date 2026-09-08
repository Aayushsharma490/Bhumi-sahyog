import express from 'express';
import { getWhatsAppStatus, initWhatsApp, sendWhatsAppMessage } from '../services/whatsappService.js';

const router = express.Router();

/**
 * GET /api/whatsapp/status
 * Returns current connection state and live QR code (Data URL) for linking device
 */
router.get('/status', (req, res) => {
  const status = getWhatsAppStatus();
  res.json(status);
});

/**
 * POST /api/whatsapp/restart
 * Restarts WhatsApp client to generate a fresh QR code
 */
router.post('/restart', async (req, res) => {
  try {
    await initWhatsApp(true);
    res.json({ success: true, message: 'Fresh QR code generated instantly' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/whatsapp/send
 * Directly sends a WhatsApp message via the active linked session
 */
router.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'phone and message are required' });
    }
    const result = await sendWhatsAppMessage(phone, message);
    res.json({ success: result.sent, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

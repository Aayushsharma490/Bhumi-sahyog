import express from 'express';
import { sendProcurementReminder, sendQueueUpdate, sendPaymentUpdate, emailEnabled } from '../services/emailService.js';
import { sendProcurementAlert, sendQueueAlert, sendPaymentAlert, sendWhatsAppMessage, waEnabled } from '../services/whatsappService.js';
import { db } from '../firebase/admin.js';

const router = express.Router();

/** POST /api/notifications/email */
router.post('/email', async (req, res, next) => {
  try {
    const { type, ...data } = req.body;
    if (!type) return res.status(400).json({ error: 'type required' });
    
    let result;
    switch (type) {
      case 'PROCUREMENT_REMINDER':
        result = await sendProcurementReminder(data);
        break;
      case 'QUEUE_UPDATE':
        result = await sendQueueUpdate(data);
        break;
      case 'PAYMENT_UPDATE':
        result = await sendPaymentUpdate(data);
        break;
      default:
        return res.status(400).json({ error: 'Unknown notification type' });
    }

    // Also create in-app notification
    if (db && data.farmerId) {
      await db.collection('notifications').add({
        farmerId: data.farmerId,
        type,
        title: data.title || type,
        message: data.message || 'New notification',
        isRead: false,
        emailSent: result.sent,
        createdAt: new Date(),
      });
    }

    res.json({ success: true, email: result, inApp: 'created' });
  } catch (e) { next(e); }
});

/** POST /api/notifications/whatsapp */
router.post('/whatsapp', async (req, res, next) => {
  try {
    const { type, phone, message, ...data } = req.body;
    let result;
    
    if (message && phone) {
      result = await sendWhatsAppMessage(phone, message);
    } else {
      switch (type) {
        case 'PROCUREMENT_ALERT':
        case 'SLOT_BOOKED':
          result = await sendProcurementAlert(data.phone || phone, data.farmerName, data.tokenNumber, data.mandiName, data.crop, data.slot, data.date);
          break;
        case 'QUEUE_ALERT':
        case 'QUEUE_UPDATE':
          result = await sendQueueAlert(data.phone || phone, data.farmerName, data.tokenNumber, data.farmersAhead, data.estimatedWait);
          break;
        case 'PAYMENT_ALERT':
        case 'PAYMENT_UPDATE':
          result = await sendPaymentAlert(data.phone || phone, data.farmerName, data.amount, data.status, data.reference);
          break;
        default:
          result = await sendWhatsAppMessage(phone, data.message || 'Bhumi Sahyog: Notification alert received.');
      }
    }

    res.json({ success: true, whatsapp: result || { sent: true } });
  } catch (e) { next(e); }
});

/** GET /api/notifications/status */
router.get('/status', (req, res) => {
  res.json({
    email: { enabled: emailEnabled },
    whatsapp: { enabled: waEnabled },
  });
});

export default router;

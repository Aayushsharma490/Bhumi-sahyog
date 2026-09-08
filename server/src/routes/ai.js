import express from 'express';
import { generateAIResponse } from '../services/aiService.js';
import { db } from '../firebase/admin.js';

const router = express.Router();

/**
 * POST /api/ai/chat
 * Main AI endpoint — processes farmer questions
 * 
 * Request: { message, farmerId?, context? }
 * Response: { reply, intent, model? }
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, farmerId, context: clientContext = {} } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 chars)' });
    }

    // Build context from Firestore if possible, otherwise use client-provided context
    let context = { ...clientContext };
    
    if (farmerId && db) {
      try {
        // Fetch farmer data
        const farmerDoc = await db.collection('farmers').doc(farmerId).get();
        if (farmerDoc.exists) {
          const farmer = farmerDoc.data();
          
          // Fetch queue state
          const queueDoc = await db.collection('queues').doc(farmer.mandiId || 'JP001').get();
          const queue = queueDoc.data() || {};
          
          // Fetch latest procurement
          const procSnap = await db.collection('procurements')
            .where('farmerId', '==', farmerId)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
          const proc = procSnap.empty ? {} : procSnap.docs[0].data();
          
          const farmersAhead = Math.max(0, (farmer.tokenNumber || 247) - (queue.currentToken || 213) - 1);
          const avgProcessing = queue.averageProcessingMinutes || 1.5;
          const estimatedWait = Math.ceil(farmersAhead * avgProcessing * 1.1);
          
          // Calculate times
          const now = new Date();
          const TRAVEL_MINUTES = 25;
          const minutesToDepart = Math.max(0, estimatedWait - TRAVEL_MINUTES);
          const departureTime = new Date(now.getTime() + minutesToDepart * 60000);
          const arrivalTime = new Date(now.getTime() + estimatedWait * 60000);
          
          context = {
            farmerName: farmer.name,
            farmerToken: farmer.tokenNumber,
            currentToken: queue.currentToken,
            farmersAhead,
            estimatedWait,
            crop: proc.crop,
            mandiName: proc.mandiName || 'Jaipur Procurement Centre',
            amount: proc.amount,
            paymentStatus: proc.paymentStatus,
            procurementStatus: proc.status,
            arrivalTime: arrivalTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            departureTime: departureTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          };
        }
      } catch (e) {
        console.warn('Could not fetch farmer context from Firestore:', e.message);
        // Use client-provided context as fallback
      }
    }

    const result = await generateAIResponse(message, context);
    
    res.json({
      reply: result.reply,
      intent: result.intent,
      model: result.model || 'deterministic-fallback',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import { db } from '../firebase/admin.js';
import { FieldValue } from 'firebase-admin/firestore';

const router = express.Router();
const MANDI_ID = 'JP001';

/** GET /api/mandis */
router.get('/', async (req, res, next) => {
  try {
    if (!db) return res.json([{ id: 'JP001', name: 'Jaipur Procurement Centre', status: 'ACTIVE' }]);
    const snap = await db.collection('mandis').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { next(e); }
});

/** GET /api/queue/:mandiId */
router.get('/:mandiId', async (req, res, next) => {
  try {
    if (!db) {
      return res.json({ mandiId: req.params.mandiId, currentToken: 213, status: 'ACTIVE', averageProcessingMinutes: 1.5, waitingCount: 47 });
    }
    const snap = await db.collection('queues').doc(req.params.mandiId).get();
    if (!snap.exists) return res.status(404).json({ error: 'Queue not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (e) { next(e); }
});

/** POST /api/queue/next — Admin: advance token */
router.post('/next', async (req, res, next) => {
  try {
    const { mandiId = MANDI_ID } = req.body;
    if (!db) return res.status(503).json({ error: 'Firebase not configured on server. Use frontend directly.' });
    
    await db.collection('queues').doc(mandiId).update({
      currentToken: FieldValue.increment(1),
      completedToday: FieldValue.increment(1),
      waitingCount: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const snap = await db.collection('queues').doc(mandiId).get();
    res.json({ success: true, queue: snap.data() });
  } catch (e) { next(e); }
});

/** POST /api/queue/pause */
router.post('/pause', async (req, res, next) => {
  try {
    const { mandiId = MANDI_ID } = req.body;
    if (!db) return res.status(503).json({ error: 'Firebase not configured on server' });
    await db.collection('queues').doc(mandiId).update({ status: 'PAUSED', updatedAt: FieldValue.serverTimestamp() });
    res.json({ success: true, status: 'PAUSED' });
  } catch (e) { next(e); }
});

/** POST /api/queue/resume */
router.post('/resume', async (req, res, next) => {
  try {
    const { mandiId = MANDI_ID } = req.body;
    if (!db) return res.status(503).json({ error: 'Firebase not configured on server' });
    await db.collection('queues').doc(mandiId).update({ status: 'ACTIVE', updatedAt: FieldValue.serverTimestamp() });
    res.json({ success: true, status: 'ACTIVE' });
  } catch (e) { next(e); }
});

export default router;

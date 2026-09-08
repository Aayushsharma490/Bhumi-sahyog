import express from 'express';
import { db } from '../firebase/admin.js';
const router = express.Router();

router.get('/:id', async (req, res, next) => {
  try {
    if (!db) return res.status(503).json({ error: 'Firebase not configured' });
    const snap = await db.collection('procurements').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Procurement not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    if (!db) return res.status(503).json({ error: 'Firebase not configured' });
    const data = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const ref = await db.collection('procurements').add(data);
    res.status(201).json({ id: ref.id });
  } catch (e) { next(e); }
});

router.patch('/:id/payment', async (req, res, next) => {
  try {
    if (!db) return res.status(503).json({ error: 'Firebase not configured' });
    const { status } = req.body;
    if (!['PENDING','PROCESSING','PAID','FAILED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    await db.collection('procurements').doc(req.params.id).update({ paymentStatus: status, updatedAt: new Date() });
    res.json({ success: true, paymentStatus: status });
  } catch (e) { next(e); }
});

export default router;

import express from 'express';
import { db } from '../firebase/admin.js';
const router = express.Router();

router.get('/:id', async (req, res, next) => {
  try {
    if (!db) return res.json({ id: 'farmer-001', name: 'Ramesh Kumar', tokenNumber: 247, mandiId: 'JP001' });
    const snap = await db.collection('farmers').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Farmer not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const { mandiId = 'JP001' } = req.query;
    if (!db) return res.json([]);
    const snap = await db.collection('farmers').where('mandiId', '==', mandiId).get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, phone, whatsapp, crop, mandiId = 'JP001', tokenNumber } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    if (!db) return res.status(503).json({ error: 'Firebase not configured' });
    
    const ref = await db.collection('farmers').add({
      name, phone, whatsapp: whatsapp || phone, crop, mandiId, tokenNumber,
      createdAt: new Date(),
    });
    res.status(201).json({ id: ref.id, name, tokenNumber });
  } catch (e) { next(e); }
});

export default router;

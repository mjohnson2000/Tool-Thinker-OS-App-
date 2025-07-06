import express from 'express';
import Log from '../models/Log';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, event, details } = req.body;
    await Log.create({ userId, event, details });
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json({ logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router; 
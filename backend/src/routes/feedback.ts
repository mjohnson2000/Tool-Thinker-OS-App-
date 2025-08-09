import express from 'express';
import Feedback from '../models/Feedback';

const router = express.Router();

// POST /api/feedback
router.post('/', async (req, res, next) => {
  try {
    const { userId, sessionId, route, action, ratingType, rating, comment, email, meta, screenshotUrl } = req.body || {};

    if (!ratingType && !comment) {
      return res.status(400).json({ error: 'ratingType or comment required' });
    }

    const doc = await Feedback.create({
      userId,
      sessionId,
      route,
      action,
      ratingType,
      rating,
      comment,
      email,
      meta,
      screenshotUrl,
    });

    res.status(201).json({ ok: true, id: doc._id });
  } catch (err) {
    next(err);
  }
});

export default router; 
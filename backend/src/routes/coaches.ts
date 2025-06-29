import express, { Request, Response } from 'express';
import { Coach } from '../models/Coach';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import auth from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    isSubscribed: boolean;
  };
}

const router = express.Router();

// Get all active coaches with filtering
router.get('/', async (req, res) => {
  try {
    const { expertise, minRating, maxPrice, sortBy = 'rating' } = req.query;
    
    let query: any = { isActive: true };
    
    if (expertise) {
      query.expertise = { $in: Array.isArray(expertise) ? expertise : [expertise] };
    }
    
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }
    
    if (maxPrice) {
      query.hourlyRate = { $lte: Number(maxPrice) };
    }
    
    let sortQuery: any = {};
    switch (sortBy) {
      case 'rating':
        sortQuery = { rating: -1, totalReviews: -1 };
        break;
      case 'price':
        sortQuery = { hourlyRate: 1 };
        break;
      case 'experience':
        sortQuery = { experience: -1 };
        break;
      default:
        sortQuery = { rating: -1 };
    }
    
    const coaches = await Coach.find(query).sort(sortQuery);
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get coach by ID
router.get('/:id', async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json(coach);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create coach profile (requires auth)
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const { name, bio, expertise, experience, hourlyRate, availability } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Check if user already has a coach profile
    const existingCoach = await Coach.findOne({ userId: req.user.id });
    if (existingCoach) {
      return res.status(400).json({ message: 'Coach profile already exists' });
    }
    
    const coach = new Coach({
      userId: req.user.id,
      name,
      email: req.user.email,
      bio,
      expertise,
      experience,
      hourlyRate,
      availability
    });
    
    await coach.save();
    res.status(201).json(coach);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update coach profile
router.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    
    // Ensure user owns this coach profile
    if (coach.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedCoach = await Coach.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCoach);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Book a coaching session
router.post('/:id/book', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { sessionType, duration, scheduledDate, notes } = req.body;
    
    const coach = await Coach.findById(req.params.id);
    if (!coach || !coach.isActive) {
      return res.status(404).json({ message: 'Coach not available' });
    }
    
    // Calculate price based on duration and hourly rate
    const price = (duration / 60) * coach.hourlyRate;
    
    const booking = new Booking({
      userId: req.user.id,
      coachId: coach._id,
      sessionType,
      duration,
      scheduledDate: new Date(scheduledDate),
      notes,
      price
    });
    
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get coach's bookings (for coach dashboard)
router.get('/:id/bookings', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const coach = await Coach.findById(req.params.id);
    if (!coach || coach.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const bookings = await Booking.find({ coachId: coach._id })
      .populate('userId', 'name email')
      .sort({ scheduledDate: 1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (confirm/cancel)
router.patch('/bookings/:bookingId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.bookingId)
      .populate('coachId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Ensure coach owns this booking
    const coach = booking.coachId as any;
    if (coach.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    booking.status = status;
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review and rating to completed session
router.post('/bookings/:bookingId/review', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { rating, review } = req.body;
    
    const booking = await Booking.findById(req.params.bookingId)
      .populate('coachId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Ensure user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed sessions' });
    }
    
    booking.rating = rating;
    booking.review = review;
    await booking.save();
    
    // Update coach's average rating
    const coach = await Coach.findById(booking.coachId);
    if (coach) {
      const allBookings = await Booking.find({ 
        coachId: coach._id, 
        rating: { $exists: true } 
      });
      
      const totalRating = allBookings.reduce((sum, b) => sum + (b.rating || 0), 0);
      coach.rating = totalRating / allBookings.length;
      coach.totalReviews = allBookings.length;
      await coach.save();
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 
import { Router, Request, Response, NextFunction } from 'express';
import { TrendingIdea } from '../models/TrendingIdea';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get trending ideas
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, limit = 10 } = req.query;
    
    let query: any = {};
    if (type === 'local') {
      // For local ideas, filter by isLocal flag
      query.isLocal = true;
    } else if (type === 'general') {
      // For general ideas, filter by isLocal flag being false
      query.isLocal = false;
    }
    // If no type specified, return all ideas
    
    const ideas = await TrendingIdea.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    res.json({
      status: 'success',
      data: ideas
    });
  } catch (error) {
    next(error);
  }
});

// Get trending ideas by date
router.get('/date/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.params;
    const { type } = req.query;
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    let query: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    if (type) {
      query.type = type;
    }
    
    const ideas = await TrendingIdea.find(query).sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: ideas
    });
  } catch (error) {
    next(error);
  }
});

// Create a new trending idea (admin only)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, market, trend, difficulty, investment, timeToLaunch, potential, tags, businessType, type = 'general' } = req.body;
    
    const newIdea = new TrendingIdea({
      title,
      description,
      market,
      trend,
      difficulty,
      investment,
      timeToLaunch,
      potential,
      tags,
      businessType,
      type
    });
    
    await newIdea.save();
    
    res.status(201).json({
      status: 'success',
      data: newIdea
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/trending-ideas/generate - Generate new trending ideas
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if ideas already exist for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingIdeas = await TrendingIdea.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (existingIdeas.length > 0) {
      return res.json({
        success: true,
        data: existingIdeas,
        message: 'Ideas already exist for today'
      });
    }
    
    // Generate new ideas (placeholder - you can add OpenAI integration here)
    const newIdeas = [
      {
        title: 'AI-Powered Content Creation',
        description: 'Create personalized content for businesses using AI tools',
        market: 'Small businesses and startups',
        trend: 'AI automation in content marketing',
        difficulty: 'Easy' as const,
        investment: 'Low' as const,
        timeToLaunch: '1-2 weeks' as const,
        potential: '$2K-5K/month' as const,
        tags: ['AI', 'content', 'automation', 'marketing'],
        businessType: 'digital-services' as const,
        type: 'general'
      },
      {
        title: 'Local Service Marketplace',
        description: 'Connect local service providers with customers in your area',
        market: 'Local communities and service providers',
        trend: 'Local business digitization',
        difficulty: 'Medium' as const,
        investment: 'Medium' as const,
        timeToLaunch: '1-2 months' as const,
        potential: '$5K+/month' as const,
        tags: ['marketplace', 'local', 'services', 'community'],
        businessType: 'local-services' as const,
        type: 'general'
      }
    ];
    
    const savedIdeas = await TrendingIdea.insertMany(newIdeas);
    
    res.json({
      success: true,
      data: savedIdeas,
      message: 'Successfully generated new trending ideas'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/trending-ideas/cleanup - Clean up old trending ideas
router.delete('/cleanup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await TrendingIdea.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: 'Successfully cleaned up old trending ideas'
    });
  } catch (error) {
    next(error);
  }
});

export { router as trendingIdeasRouter }; 
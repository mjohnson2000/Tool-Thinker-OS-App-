import { Router, Request, Response } from 'express';
import axios from 'axios';
import { TrendingIdea } from '../models/TrendingIdea';
import { User } from '../models/User';
import auth from '../middleware/auth';

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// GET /api/trending-ideas - Get today's trending ideas
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type = 'general' } = req.query; // 'general' or 'local'
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let query: any = {
      createdAt: { $gte: today },
      isLocal: type === 'local'
    };
    
    // For local ideas, we need user authentication and location
    if (type === 'local') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required for local trending ideas',
          requiresAuth: true
        });
      }
      
      try {
        // Use the same token verification as the auth middleware
        const token = authHeader.replace('Bearer ', '');
        const { verifyToken } = require('../utils/token');
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            error: 'User not found',
            requiresAuth: true
          });
        }
        
        if (!user.location || !user.location.city) {
          return res.status(400).json({ 
            success: false, 
            error: 'Location information required. Please update your profile.',
            requiresLocation: true
          });
        }
        
        // Add location filter for local ideas
        query.location = {
          city: user.location.city,
          region: user.location.region,
          country: user.location.country
        };
        
      } catch (error) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid authentication token',
          requiresAuth: true
        });
      }
    }
    
    let trendingIdeas = await TrendingIdea.find(query).sort({ score: -1 }).limit(5);

    // Add user's like status to each idea if authenticated
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { verifyToken } = require('../utils/token');
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (user) {
          trendingIdeas = trendingIdeas.map(idea => {
            const ideaObj = idea.toObject() as any;
            ideaObj.isLiked = idea.likedBy.includes(user._id.toString());
            return ideaObj;
          });
        }
      } catch (error) {
        // Token verification failed, continue without user like status
        console.log('Token verification failed for like status:', error);
      }
    }

    // If no ideas for today, generate new ones
    if (trendingIdeas.length === 0) {
      console.log(`No ${type} trending ideas found for today, generating new ones...`);
      trendingIdeas = await generateTrendingIdeas(type === 'local', query.location);
      console.log('Generated', trendingIdeas.length, `new ${type} trending ideas`);
    } else {
      console.log('Found', trendingIdeas.length, `existing ${type} trending ideas for today`);
    }

    res.json({ success: true, data: trendingIdeas, type });
  } catch (error) {
    console.error('Error fetching trending ideas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trending ideas',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/trending-ideas/generate - Manually trigger generation
router.post('/generate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if it's an internal request (from cron job) or authenticated user
    const authHeader = req.headers.authorization;
    const isInternalRequest = authHeader === `Bearer ${process.env.INTERNAL_API_KEY || 'internal-key'}`;
    const isAuthenticated = req.user; // Set by auth middleware if present
    
    if (!isInternalRequest && !isAuthenticated) {
      // Apply auth middleware only for non-internal requests
      return auth(req, res, () => {
        // This will be called if auth passes
        generateTrendingIdeasHandler(req, res);
      });
    }
    
    // For internal requests, proceed directly
    await generateTrendingIdeasHandler(req, res);
  } catch (error) {
    console.error('Error in generate endpoint:', error);
    res.status(500).json({ success: false, error: 'Failed to generate trending ideas' });
  }
});

async function generateTrendingIdeasHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { type = 'general' } = req.query; // 'general' or 'local'
    
    // Check if ideas already exist for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let query: any = {
      createdAt: { $gte: today },
      isLocal: type === 'local'
    };
    
    // For local ideas, we need user authentication and location
    if (type === 'local') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required for local trending ideas',
          requiresAuth: true
        });
      }
      
      try {
        // Use the same token verification as the auth middleware
        const token = authHeader.replace('Bearer ', '');
        const { verifyToken } = require('../utils/token');
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            error: 'User not found',
            requiresAuth: true
          });
        }
        
        if (!user.location || !user.location.city) {
          return res.status(400).json({ 
            success: false, 
            error: 'Location information required. Please update your profile.',
            requiresLocation: true
          });
        }
        
        // Add location filter for local ideas
        query.location = {
          city: user.location.city,
          region: user.location.region,
          country: user.location.country
        };
        
      } catch (error) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid authentication token',
          requiresAuth: true
        });
      }
    }
    
    const existingIdeas = await TrendingIdea.find(query);
    
    if (existingIdeas.length > 0) {
      console.log(`${type} trending ideas already exist for today, returning existing ones`);
      return res.json({ 
        success: true, 
        data: existingIdeas,
        message: `${type} ideas already generated for today`
      });
    }
    
    console.log(`Generating new ${type} trending ideas for today...`);
    const ideas = await generateTrendingIdeas(type === 'local', query.location);
    res.json({ success: true, data: ideas, type });
  } catch (error) {
    console.error('Error generating trending ideas:', error);
    res.status(500).json({ success: false, error: 'Failed to generate trending ideas' });
  }
}

// POST /api/trending-ideas/:id/save - Save an idea
router.post('/:id/save', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idea = await TrendingIdea.findById(id);
    
    if (!idea) {
      return res.status(404).json({ success: false, error: 'Idea not found' });
    }
    
    await idea.incrementSaves();
    res.json({ success: true, data: idea });
  } catch (error) {
    console.error('Error saving idea:', error);
    res.status(500).json({ success: false, error: 'Failed to save idea' });
  }
});

// POST /api/trending-ideas/:id/like - Like/unlike an idea (requires authentication)
router.post('/:id/like', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const idea = await TrendingIdea.findById(id);
    
    if (!idea) {
      return res.status(404).json({ success: false, error: 'Idea not found' });
    }
    
    await idea.toggleLike(userId);
    
    // Return the idea with the user's like status
    const ideaObj = idea.toObject() as any;
    ideaObj.isLiked = idea.likedBy.includes(userId);
    
    res.json({ success: true, data: ideaObj });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle like' });
  }
});

// DELETE /api/trending-ideas/cleanup - Clean up old ideas
router.delete('/cleanup', async (req: Request, res: Response) => {
  try {
    const { olderThan } = req.body;
    const cutoffDate = olderThan ? new Date(olderThan) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const result = await TrendingIdea.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} old trending ideas`
    });
  } catch (error) {
    console.error('Error cleaning up trending ideas:', error);
    res.status(500).json({ success: false, error: 'Failed to cleanup trending ideas' });
  }
});

// POST /api/trending-ideas/force-generate - Force generate new ideas (for testing)
router.post('/force-generate', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Force generating new trending ideas...');
    const ideas = await generateTrendingIdeas();
    res.json({ success: true, data: ideas, message: 'Force generated new trending ideas' });
  } catch (error) {
    console.error('Error force generating trending ideas:', error);
    res.status(500).json({ success: false, error: 'Failed to force generate trending ideas' });
  }
});

async function generateTrendingIdeas(isLocal: boolean = false, location?: any): Promise<any[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key not configured');
    throw new Error('OpenAI API key not configured');
  }
  
  console.log('Generating trending ideas with OpenAI...');

  const locationContext = isLocal && location ? 
    `\n\nLOCATION CONTEXT: Focus on opportunities specific to ${location.city}, ${location.region}, ${location.country}. Consider local market conditions, demographics, and business environment.` : 
    '';

  const prompt = `
You are an expert side hustle analyst specializing in identifying alpha-niche opportunities. 
Generate EXACTLY 5 trending side hustle ideas that are:

IMPORTANT: You MUST generate EXACTLY 5 ideas, no more, no less. Each idea must be completely different from the others.
1. Early-stage opportunities (not yet saturated)
2. High-growth potential
3. Low barrier to entry
4. Based on current market trends
5. Suitable for part-time execution${isLocal ? ' in the specified location' : ''}

IMPORTANT: You must return exactly 5 ideas, no more, no less.

For each idea, provide:
- Title: Catchy, descriptive name
- Description: 2-3 sentences explaining the opportunity
- Market: Target audience and market size
- Trend: What's driving this opportunity
- Difficulty: Easy/Medium/Hard
- Investment: Low/Medium/High
- TimeToLaunch: 1-2 weeks, 1-2 months, 3+ months
- Potential: $500-2K/month, $2K-5K/month, $5K+/month
- Tags: 3-5 relevant tags

Focus on emerging trends like:
- AI tools and automation
- Niche content creation
- Local service gaps
- Digital product opportunities
- Micro-SaaS solutions
- Specialized consulting${isLocal ? `
- Local business services
- Community-specific needs
- Regional market opportunities
- Local partnership opportunities` : ''}

${locationContext}

Return ONLY a valid JSON array with EXACTLY 5 ideas, no markdown formatting, no code blocks, no extra text:

[
  {
    "title": "AI-Powered Local Business Review Generator",
    "description": "Create personalized review responses for local businesses using AI. Many small businesses struggle to respond to reviews professionally and consistently.",
    "market": "Local businesses, restaurants, service providers",
    "trend": "AI automation for small business operations",
    "difficulty": "Easy",
    "investment": "Low",
    "timeToLaunch": "1-2 weeks",
    "potential": "$2K-5K/month",
    "tags": ["AI", "local business", "automation", "reviews", "SaaS"]
  },
  {
    "title": "Niche Content Creation Agency",
    "description": "Create specialized content for underserved industries that lack quality digital marketing materials.",
    "market": "B2B companies in niche industries",
    "trend": "Content marketing specialization",
    "difficulty": "Medium",
    "investment": "Low",
    "timeToLaunch": "1-2 months",
    "potential": "$2K-5K/month",
    "tags": ["content", "marketing", "B2B", "specialization", "agency"]
  },
  {
    "title": "Micro-SaaS for Local Service Providers",
    "description": "Build simple software solutions for local businesses that can't afford enterprise solutions.",
    "market": "Local service businesses, contractors, small agencies",
    "trend": "SaaS democratization",
    "difficulty": "Hard",
    "investment": "Medium",
    "timeToLaunch": "3+ months",
    "potential": "$5K+/month",
    "tags": ["SaaS", "local business", "automation", "software", "subscription"]
  },
  {
    "title": "Sustainable Product Arbitrage",
    "description": "Identify and source eco-friendly products from emerging markets for resale in developed markets.",
    "market": "Environmentally conscious consumers",
    "trend": "Sustainability and conscious consumption",
    "difficulty": "Easy",
    "investment": "Medium",
    "timeToLaunch": "1-2 weeks",
    "potential": "$500-2K/month",
    "tags": ["sustainability", "arbitrage", "ecommerce", "import", "green"]
  },
  {
    "title": "Specialized Consulting for Remote Teams",
    "description": "Provide expertise in remote work optimization, team building, and productivity for distributed companies.",
    "market": "Remote-first companies and hybrid teams",
    "trend": "Remote work optimization",
    "difficulty": "Medium",
    "investment": "Low",
    "timeToLaunch": "1-2 months",
    "potential": "$5K+/month",
    "tags": ["consulting", "remote work", "productivity", "team building", "HR"]
  }
]

CRITICAL: Return ONLY the JSON array with exactly 5 ideas, no markdown, no code blocks, no explanations. 

IMPORTANT: The "potential" field MUST be one of these exact values: "$500-2K/month", "$2K-5K/month", or "$5K+/month"
IMPORTANT: The "difficulty" field MUST be one of these exact values: "Easy", "Medium", or "Hard"
IMPORTANT: The "investment" field MUST be one of these exact values: "Low", "Medium", or "High"
IMPORTANT: The "timeToLaunch" field MUST be one of these exact values: "1-2 weeks", "1-2 months", or "3+ months"

Make each idea unique and actionable. Focus on opportunities that are just emerging but not yet mainstream.
`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.8,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = (response.data as any).choices?.[0]?.message?.content?.trim() || '';
  console.log('OpenAI response content:', content);
  console.log('Content length:', content.length);
  let ideas;
  
  try {
    // First, try to parse the content directly
    ideas = JSON.parse(content);
    console.log('Successfully parsed ideas:', ideas.length, 'ideas');
    console.log('First idea title:', ideas[0]?.title);
  } catch (error) {
    console.log('Failed to parse directly, trying to extract JSON from markdown...');
    
    // Try to extract JSON from markdown code blocks
    try {
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[1]);
        console.log('Successfully extracted JSON from markdown');
      } else {
        // Try to find JSON array without markdown
        const arrayMatch = content.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (arrayMatch) {
          ideas = JSON.parse(arrayMatch[0]);
          console.log('Successfully extracted JSON array');
        } else {
          console.error('Could not extract JSON from content:', content);
          throw new Error('Failed to parse trending ideas');
        }
      }
    } catch (extractError) {
      console.error('Failed to extract JSON from markdown:', extractError);
      console.error('Original content:', content);
      throw new Error('Failed to generate trending ideas');
    }
  }

  // Save ideas to database
              const savedIdeas = [];
            for (const idea of ideas) {
              // Validate and fix enum values
              const validatedIdea = {
                ...idea,
                potential: idea.potential === '$3K-8K/month' ? '$2K-5K/month' : 
                           idea.potential === '$1K-4K/month' ? '$500-2K/month' :
                           idea.potential === '$4K-10K/month' ? '$5K+/month' : idea.potential,
                score: Math.floor(Math.random() * 50) + 50, // Random score between 50-99
                isLocal: isLocal,
                location: isLocal && location ? location : undefined,
                createdAt: new Date()
              };
              
              const trendingIdea = new TrendingIdea(validatedIdea);
              await trendingIdea.save();
              savedIdeas.push(trendingIdea);
            }

  return savedIdeas;
}

export { router as trendingIdeasRouter }; 
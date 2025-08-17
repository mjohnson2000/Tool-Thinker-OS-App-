import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './config/database';
import { chatgptRouter } from './routes/chatgpt';
import { businessPlanRouter } from './routes/businessPlan';
import coachesRouter from './routes/coaches';
import coursesRouter from './routes/courses';
const stripeRouter = require('./routes/stripe');
const stripeWebhookRouter = require('./routes/stripeWebhook');
import logRoute from './routes/log';
import automatedDiscoveryRouter from './routes/automatedDiscovery';
import feedbackRouter from './routes/feedback';
import { trendingIdeasRouter } from './routes/trendingIdeas';
import { scheduleTrendingIdeasGeneration, scheduleTrendingIdeasCleanup } from './utils/cronJobs';

// Import models to ensure they're registered
import './models/User';
import './models/BusinessPlan';
import './models/Coach';
import './models/Course';
import './models/Booking';
import './models/UserProgress';
import './models/Feedback';
import './models/TrendingIdea';

// Load environment variables
config();

const app = express();

// Register Stripe webhook route BEFORE any body parsing middleware
app.use('/api/stripe', stripeWebhookRouter);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/chatgpt', chatgptRouter);
app.use('/api/business-plan', businessPlanRouter);
app.use('/api/startup-plan', businessPlanRouter);
app.use('/api/side-hustle', businessPlanRouter);
app.use('/api/coaches', coachesRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/log', logRoute);
app.use('/api/automated-discovery', automatedDiscoveryRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/trending-ideas', trendingIdeasRouter);

// Error handling
app.use(errorHandler);

// Connect to database and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    
    // Initialize cron jobs
    scheduleTrendingIdeasGeneration();
    scheduleTrendingIdeasCleanup();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 

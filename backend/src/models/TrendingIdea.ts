import mongoose, { Document, Schema } from 'mongoose';

export interface ITrendingIdea extends Document {
  title: string;
  description: string;
  market: string;
  trend: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  investment: 'Low' | 'Medium' | 'High';
  timeToLaunch: '1-2 weeks' | '1-2 months' | '3+ months';
  potential: '$500-2K/month' | '$2K-5K/month' | '$5K+/month';
  tags: string[];
  score: number;
  views: number;
  saves: number;
  // Location fields for local ideas
  isLocal: boolean;
  location?: {
    city: string;
    region: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  incrementViews(): Promise<ITrendingIdea>;
  incrementSaves(): Promise<ITrendingIdea>;
}

const trendingIdeaSchema = new Schema<ITrendingIdea>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  market: {
    type: String,
    required: true,
    maxlength: 200
  },
  trend: {
    type: String,
    required: true,
    maxlength: 200
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  investment: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  timeToLaunch: {
    type: String,
    enum: ['1-2 weeks', '1-2 months', '3+ months'],
    required: true
  },
  potential: {
    type: String,
    enum: ['$500-2K/month', '$2K-5K/month', '$5K+/month'],
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  views: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  // Location fields for local ideas
  isLocal: {
    type: Boolean,
    default: false
  },
  location: {
    city: {
      type: String,
      trim: true,
      default: ''
    },
    region: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
trendingIdeaSchema.index({ createdAt: -1 });
trendingIdeaSchema.index({ score: -1 });
trendingIdeaSchema.index({ tags: 1 });
trendingIdeaSchema.index({ difficulty: 1 });
trendingIdeaSchema.index({ investment: 1 });
trendingIdeaSchema.index({ isLocal: 1 });
trendingIdeaSchema.index({ 'location.city': 1, 'location.region': 1, 'location.country': 1 });

// Method to increment views
trendingIdeaSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment saves
trendingIdeaSchema.methods.incrementSaves = function() {
  this.saves += 1;
  return this.save();
};

export const TrendingIdea = mongoose.model<ITrendingIdea>('TrendingIdea', trendingIdeaSchema); 
import mongoose, { Document, Schema } from 'mongoose';

export interface IBusinessPlan extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  version: number;
  status: 'draft' | 'active' | 'archived' | 'validated';
  
  // Core Business Plan Data
  summary: string;
  sections: {
    [key: string]: string;
  };
  
  // Enhanced Business Plan Fields
  businessIdeaSummary?: string;
  customerProfile?: {
    description: string;
  };
  customerStruggle?: string[];
  valueProposition?: string;
  marketInformation?: {
    marketSize: string;
    trends: string[];
    competitors: string[];
  };
  financialSummary?: string;
  
  // Idea Discovery Data
  idea: {
    interests: string[];
    existingIdeaText?: string;
  };
  
  // Customer Data
  customer: {
    title: string;
    description: string;
    persona?: {
      age?: string;
      location?: string;
      income?: string;
      painPoints: string[];
      goals: string[];
    };
  };
  
  // Job-to-be-Done Data
  job: {
    title: string;
    description: string;
    context?: string;
    constraints?: string[];
  };
  
  // Problem & Solution
  problem: {
    description: string;
    impact: string;
    urgency: 'low' | 'medium' | 'high';
  };
  
  solution: {
    description: string;
    keyFeatures: string[];
    uniqueValue: string;
  };
  
  // Market Evaluation Data
  marketEvaluation?: {
    score: number;
    competitors: string[];
    marketSize: string;
    customerResearch: string[];
    validationDate?: Date;
    insights: string[];
  };
  
  // Progress Tracking
  progress: {
    ideaDiscovery: boolean;
    customerResearch: boolean;
    problemDefinition: boolean;
    solutionDesign: boolean;
    marketEvaluation: boolean;
    businessPlan: boolean;
    nextSteps: boolean;
    mvp: boolean;
  };
  
  // MVP Data
  mvp?: {
    problem?: string;
    solution?: string;
    assumptions?: string;
    test?: string;
    lastUpdated?: Date;
    isComplete?: boolean;
    userProgress?: {
      [stepKey: string]: {
        status: 'pending' | 'completed' | 'skipped';
        progress: { [key: string]: boolean };
        feedback: string;
        completedAt?: Date;
      };
    };
  };
  
  // Gap Analysis Data
  gapAnalysis?: {
    skills: {
      selectedSkills: string[];
      missingSkills: string[];
      recommendations: string[];
      learningPath: string[];
    };
    resources: {
      financial: string[];
      human: string[];
      physical: string[];
    };
    operations: {
      processes: string[];
      systems: string[];
      infrastructure: string[];
    };
  };
  
  // Metadata
  tags: string[];
  category: string;
  estimatedRevenue?: number;
  estimatedTimeline?: string;
  
  // Version Control
  previousVersion?: mongoose.Types.ObjectId;
  changeLog: {
    version: number;
    date: Date;
    changes: string[];
    reason: string;
    content?: {
      businessIdeaSummary?: string;
      customerProfile?: {
        description: string;
      };
      customerStruggle?: string[];
      valueProposition?: string;
      marketInformation?: {
        marketSize: string;
        trends: string[];
        competitors: string[];
      };
      financialSummary?: string;
      sections?: {
        [key: string]: string;
      };
    };
  }[];
  
  // Collaboration
  collaborators: mongoose.Types.ObjectId[];
  isPublic: boolean;
  
  // Analytics
  views: number;
  lastViewed: Date;
  
  // Validation Score
  validationScore?: {
    score: number;
    date: Date;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

const businessPlanSchema = new Schema<IBusinessPlan>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'validated'],
    default: 'draft'
  },
  
  // Core Business Plan Data
  summary: {
    type: String,
    required: true,
    maxlength: 2000
  },
  sections: {
    type: Schema.Types.Mixed,
    required: true
  },
  
  // Enhanced Business Plan Fields
  businessIdeaSummary: {
    type: String,
    maxlength: 2000
  },
  customerProfile: {
    description: {
      type: String,
      maxlength: 1000
    }
  },
  customerStruggle: [{
    type: String,
    maxlength: 1000
  }],
  valueProposition: {
    type: String,
    maxlength: 1000
  },
  marketInformation: {
    marketSize: {
      type: String,
      maxlength: 1000
    },
    trends: [{
      type: String,
      maxlength: 1000
    }],
    competitors: [{
      type: String,
      maxlength: 1000
    }]
  },
  financialSummary: {
    type: String,
    maxlength: 2000
  },
  
  // Idea Discovery Data
  idea: {
    interests: [{
      type: String,
      trim: true
    }],
    existingIdeaText: {
      type: String,
      maxlength: 1000
    }
  },
  
  // Customer Data
  customer: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    persona: {
      age: String,
      location: String,
      income: String,
      painPoints: [String],
      goals: [String]
    }
  },
  
  // Job-to-be-Done Data
  job: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    context: String,
    constraints: [String]
  },
  
  // Problem & Solution
  problem: {
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    impact: {
      type: String,
      maxlength: 1000
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  
  solution: {
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    keyFeatures: [String],
    uniqueValue: {
      type: String,
      maxlength: 2000
    }
  },
  
  // Market Evaluation Data
  marketEvaluation: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    competitors: [String],
    marketSize: String,
    customerResearch: [String],
    validationDate: Date,
    insights: [String]
  },
  
  // Progress Tracking
  progress: {
    ideaDiscovery: {
      type: Boolean,
      default: false
    },
    customerResearch: {
      type: Boolean,
      default: false
    },
    problemDefinition: {
      type: Boolean,
      default: false
    },
    solutionDesign: {
      type: Boolean,
      default: false
    },
    marketEvaluation: {
      type: Boolean,
      default: false
    },
    businessPlan: {
      type: Boolean,
      default: false
    },
    nextSteps: {
      type: Boolean,
      default: false
    },
    mvp: {
      type: Boolean,
      default: false
    }
  },
  
  // MVP Data
  mvp: {
    problem: String,
    solution: String,
    assumptions: String,
    test: String,
    lastUpdated: Date,
    isComplete: {
      type: Boolean,
      default: false
    },
    userProgress: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  estimatedRevenue: {
    type: Number,
    min: 0
  },
  estimatedTimeline: String,
  
  // Version Control
  previousVersion: {
    type: Schema.Types.ObjectId,
    ref: 'BusinessPlan'
  },
  changeLog: [{
    version: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    changes: [String],
    reason: {
      type: String,
      required: true
    },
    content: {
      type: Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // Collaboration
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date,
    default: Date.now
  },
  
  // Validation Score
  validationScore: {
    score: { type: Number },
    date: { type: Date }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
businessPlanSchema.index({ userId: 1, status: 1 });
businessPlanSchema.index({ userId: 1, createdAt: -1 });
businessPlanSchema.index({ category: 1, status: 1 });
businessPlanSchema.index({ tags: 1 });
businessPlanSchema.index({ isPublic: 1, status: 1 });

// Virtual for progress percentage
businessPlanSchema.virtual('progressPercentage').get(function() {
  const progressFields = Object.values(this.progress);
  const completed = progressFields.filter(Boolean).length;
  return Math.round((completed / progressFields.length) * 100);
});

// Method to create new version
businessPlanSchema.methods.createNewVersion = function(changes: string[], reason: string) {
  const newPlan = new BusinessPlan({
    ...this.toObject(),
    _id: undefined,
    version: this.version + 1,
    previousVersion: this._id,
    changeLog: [{
      version: this.version + 1,
      date: new Date(),
      changes,
      reason
    }],
    createdAt: undefined,
    updatedAt: undefined
  });
  return newPlan;
};

// Method to update progress
businessPlanSchema.methods.updateProgress = function(stage: keyof IBusinessPlan['progress']) {
  this.progress[stage] = true;
  return this.save();
};

// Method to increment views
businessPlanSchema.methods.incrementViews = function() {
  this.views += 1;
  this.lastViewed = new Date();
  return this.save();
};

export const BusinessPlan = mongoose.model<IBusinessPlan>('BusinessPlan', businessPlanSchema); 
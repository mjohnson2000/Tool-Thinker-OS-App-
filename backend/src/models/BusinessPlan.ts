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
  
  // Business Model Data
  businessModel?: {
    // Business Model Canvas
    keyPartners: string[];
    keyActivities: string[];
    valuePropositions: string[];
    customerRelationships: string[];
    customerSegments: string[];
    keyResources: string[];
    channels: string[];
    costStructure: {
      fixedCosts: number;
      variableCosts: number;
      costBreakdown: Record<string, number>;
    };
    revenueStreams: {
      streams: Array<{
        name: string;
        type: 'subscription' | 'one-time' | 'freemium' | 'licensing';
        price: number;
        frequency: string;
        projectedVolume: number;
      }>;
      totalProjectedRevenue: number;
    };
    
    // Financial Metrics
    financialProjections: {
      monthlyRevenue: number[];
      annualRevenue: number[];
      grossMargin: number;
      netMargin: number;
      breakEvenPoint: number;
      customerLifetimeValue: number;
      customerAcquisitionCost: number;
      paybackPeriod: number;
    };
    
    // Competitive Analysis
    competitiveLandscape: {
      competitors: Array<{
        name: string;
        pricing: number;
        features: string[];
        marketShare: number;
        strengths: string[];
        weaknesses: string[];
      }>;
      competitiveAdvantages: string[];
      differentiationStrategy: string;
    };
    
    // Risk Assessment
    riskAssessment: {
      businessModelRisks: string[];
      marketRisks: string[];
      operationalRisks: string[];
      financialRisks: string[];
      regulatoryRisks: string[];
      mitigationStrategies: Record<string, string>;
    };
    
    // Scalability & Growth
    scalabilityAnalysis: {
      marketSize: {
        tam: number; // Total Addressable Market
        sam: number; // Serviceable Addressable Market
        som: number; // Serviceable Obtainable Market
      };
      growthStrategy: string;
      expansionPlans: string[];
      scaleFactors: string[];
    };
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
      maxlength: 500
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
      maxlength: 500
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
  },
  
  // Business Model Data
  businessModel: {
    keyPartners: [{
      type: String,
      trim: true
    }],
    keyActivities: [{
      type: String,
      trim: true
    }],
    valuePropositions: [{
      type: String,
      trim: true
    }],
    customerRelationships: [{
      type: String,
      trim: true
    }],
    customerSegments: [{
      type: String,
      trim: true
    }],
    keyResources: [{
      type: String,
      trim: true
    }],
    channels: [{
      type: String,
      trim: true
    }],
    costStructure: {
      fixedCosts: {
        type: Number,
        min: 0
      },
      variableCosts: {
        type: Number,
        min: 0
      },
      costBreakdown: {
        type: Schema.Types.Mixed,
        default: {}
      }
    },
    revenueStreams: {
      streams: [{
        name: {
          type: String,
          required: true,
          trim: true
        },
        type: {
          type: String,
          enum: ['subscription', 'one-time', 'freemium', 'licensing'],
          required: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        frequency: {
          type: String,
          required: true,
          trim: true
        },
        projectedVolume: {
          type: Number,
          required: true,
          min: 0
        }
      }],
      totalProjectedRevenue: {
        type: Number,
        min: 0
      }
    },
    
    // Financial Metrics
    financialProjections: {
      monthlyRevenue: [{
        type: Number,
        min: 0
      }],
      annualRevenue: [{
        type: Number,
        min: 0
      }],
      grossMargin: {
        type: Number,
        min: 0,
        max: 100
      },
      netMargin: {
        type: Number,
        min: 0,
        max: 100
      },
      breakEvenPoint: {
        type: Number,
        min: 0
      },
      customerLifetimeValue: {
        type: Number,
        min: 0
      },
      customerAcquisitionCost: {
        type: Number,
        min: 0
      },
      paybackPeriod: {
        type: Number,
        min: 0
      }
    },
    
    // Competitive Analysis
    competitiveLandscape: {
      competitors: [{
        name: {
          type: String,
          required: true,
          trim: true
        },
        pricing: {
          type: Number,
          required: true,
          min: 0
        },
        features: [{
          type: String,
          trim: true
        }],
        marketShare: {
          type: Number,
          min: 0,
          max: 100
        },
        strengths: [{
          type: String,
          trim: true
        }],
        weaknesses: [{
          type: String,
          trim: true
        }]
      }],
      competitiveAdvantages: [{
        type: String,
        trim: true
      }],
      differentiationStrategy: {
        type: String,
        trim: true
      }
    },
    
    // Risk Assessment
    riskAssessment: {
      businessModelRisks: [{
        type: String,
        trim: true
      }],
      marketRisks: [{
        type: String,
        trim: true
      }],
      operationalRisks: [{
        type: String,
        trim: true
      }],
      financialRisks: [{
        type: String,
        trim: true
      }],
      regulatoryRisks: [{
        type: String,
        trim: true
      }],
      mitigationStrategies: {
        type: Schema.Types.Mixed,
        default: {}
      }
    },
    
    // Scalability & Growth
    scalabilityAnalysis: {
      marketSize: {
        tam: {
          type: Number,
          min: 0
        },
        sam: {
          type: Number,
          min: 0
        },
        som: {
          type: Number,
          min: 0
        }
      },
      growthStrategy: {
        type: String,
        trim: true
      },
      expansionPlans: [{
        type: String,
        trim: true
      }],
      scaleFactors: [{
        type: String,
        trim: true
      }]
    }
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
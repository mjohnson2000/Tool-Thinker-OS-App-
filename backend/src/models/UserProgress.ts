import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  moduleProgress: {
    moduleId: number; // corresponds to module order in course
    completed: boolean;
    completedAt?: Date;
    timeSpent: number; // in minutes
    quizScore?: number;
  }[];
  overallProgress: number; // percentage 0-100
  startedAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  certificateEarned: boolean;
  certificateUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userProgressSchema = new Schema<IUserProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  moduleProgress: [{
    moduleId: {
      type: Number,
      required: true,
      min: 1
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  certificateEarned: {
    type: Boolean,
    default: false
  },
  certificateUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for efficient user-course queries
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, overallProgress: -1 });

// Method to calculate overall progress
userProgressSchema.methods.calculateProgress = function() {
  if (this.moduleProgress.length === 0) return 0;
  
  const completedModules = this.moduleProgress.filter((m: any) => m.completed).length;
  return Math.round((completedModules / this.moduleProgress.length) * 100);
};

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', userProgressSchema); 
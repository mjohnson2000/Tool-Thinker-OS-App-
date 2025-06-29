import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId; // Reference to Coach
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  price: number;
  isPublished: boolean;
  thumbnail?: string;
  modules: {
    title: string;
    description: string;
    duration: number; // in minutes
    videoUrl?: string;
    content: string; // markdown content
    order: number;
  }[];
  tags: string[];
  rating: number;
  totalStudents: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['business-strategy', 'marketing', 'sales', 'product-development', 'finance', 'operations']
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  thumbnail: {
    type: String,
    trim: true
  },
  modules: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 500
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    },
    videoUrl: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalStudents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search and filtering
courseSchema.index({ category: 1, level: 1, isPublished: 1 });
courseSchema.index({ instructor: 1, isPublished: 1 });
courseSchema.index({ rating: -1, totalStudents: -1 });

export const Course = mongoose.model<ICourse>('Course', courseSchema); 
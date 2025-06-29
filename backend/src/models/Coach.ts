import mongoose, { Document, Schema } from 'mongoose';

export interface ICoach extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  experience: number; // years of experience
  hourlyRate: number;
  availability: {
    days: string[];
    timeSlots: string[];
  };
  rating: number;
  totalReviews: number;
  isActive: boolean;
  profilePic?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const coachSchema = new Schema<ICoach>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  bio: {
    type: String,
    required: true,
    maxlength: 1000
  },
  expertise: [{
    type: String,
    required: true
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      type: String,
      enum: ['9am-11am', '11am-1pm', '1pm-3pm', '3pm-5pm', '5pm-7pm']
    }]
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePic: {
    type: String,
    trim: true
  },
  linkedinUrl: {
    type: String,
    trim: true
  },
  websiteUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
coachSchema.index({ expertise: 1, isActive: 1 });
coachSchema.index({ rating: -1, totalReviews: -1 });

export const Coach = mongoose.model<ICoach>('Coach', coachSchema); 
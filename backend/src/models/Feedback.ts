import mongoose, { Schema, Document } from 'mongoose';

interface FeedbackDoc extends Document {
  userId?: string;
  sessionId?: string;
  route?: string;
  action?: string;
  ratingType?: 'thumbs' | 'nps' | 'csat';
  rating?: number;
  comment?: string;
  email?: string;
  meta?: any;
  screenshotUrl?: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<FeedbackDoc>({
  userId: { type: String },
  sessionId: { type: String },
  route: { type: String },
  action: { type: String },
  ratingType: { type: String, enum: ['thumbs', 'nps', 'csat'] },
  rating: { type: Number, min: 0, max: 10 },
  comment: { type: String, maxlength: 5000 },
  email: { type: String },
  meta: { type: Schema.Types.Mixed },
  screenshotUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<FeedbackDoc>('Feedback', FeedbackSchema); 
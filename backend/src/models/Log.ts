import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  event: { type: String, required: true },
  details: { type: Object, required: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Log', LogSchema); 
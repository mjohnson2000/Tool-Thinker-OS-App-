import mongoose from 'mongoose';

export async function connectDB() {
  try {
    console.log('DEBUG: Environment MONGODB_URI:', process.env.MONGODB_URI);
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/toolthinker';
    console.log('DEBUG: Final MongoDB URI:', mongoURI);
    console.log('Connecting to MongoDB URI:', mongoURI); // Debug connection string
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
} 
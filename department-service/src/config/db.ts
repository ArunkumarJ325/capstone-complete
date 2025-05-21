import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URL || 'mongodb://mongodb:27017/department-service';

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected for department-service at ${mongoUri}`);
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};

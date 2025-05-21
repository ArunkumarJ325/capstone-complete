import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb:27017/hospital-db';

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected for doctor-service at ${mongoUri}`);
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};

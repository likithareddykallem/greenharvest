import mongoose from 'mongoose';
import { env } from './env.js';

export const connectMongo = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Mongo connected');
  } catch (err) {
    console.error('Mongo connection failed', err);
    process.exit(1);
  }
};


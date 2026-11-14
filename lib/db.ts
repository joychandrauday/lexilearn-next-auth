import mongoose from 'mongoose';

declare global {
  var mongooseCache: typeof mongoose | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.warn('MONGODB_URI not set');
}

export async function connectDb() {
  if (global.mongooseCache) return global.mongooseCache;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local.');
  }

  const conn = await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected:', conn.connection.name);
  global.mongooseCache = mongoose;
  return conn;
}

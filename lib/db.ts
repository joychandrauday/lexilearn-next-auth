import mongoose from 'mongoose';

declare global {
  var mongooseCache: typeof mongoose | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || '';

console.log(MONGODB_URI);
if (!MONGODB_URI) {
  console.warn('MONGODB_URI not set');
}

export async function connectDb() {
  if (global.mongooseCache) return global.mongooseCache;
  const conn = await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected:', conn.connection.name, MONGODB_URI);
  global.mongooseCache = mongoose;
  return conn;
}

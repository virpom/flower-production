import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://floweradmin:flowerpassword@localhost:27017/flowerdb?authSource=admin';

// Проверяем, что мы не в режиме сборки
const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL && !MONGODB_URI;

if (!MONGODB_URI && !isBuildTime) {
  throw new Error('Пожалуйста, определите MONGODB_URI в .env файле');
}

// Глобальная переменная для кэширования соединения
let cached = global as any;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

/**
 * Функция для подключения к MongoDB
 */
async function connectDB() {
  if (cached.mongoose.conn) {
    console.log('Используется существующее подключение к MongoDB');
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      authSource: 'admin',
      user: 'floweradmin',
      pass: 'flowerpassword',
      dbName: 'flowerdb'
    };

    console.log('Подключение к MongoDB...');
    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Подключение к MongoDB успешно установлено');
        return mongoose;
      })
      .catch((error) => {
        console.error('Ошибка подключения к MongoDB:', error);
        throw error;
      });
  }
  
  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}

export default connectDB;
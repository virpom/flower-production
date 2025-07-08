import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI; // Removed default value, it should come from .env or Docker Compose

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

  if (!MONGODB_URI) {
    // Only throw error if MONGODB_URI is not defined when connection is actually attempted
    throw new Error('MONGODB_URI не определен. Пожалуйста, убедитесь, что он установлен в .env файле или переменных окружения.');
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
        // Clear the promise so that a new attempt can be made later
        cached.mongoose.promise = null;
        throw error;
      });
  }
  
  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}

export default connectDB;
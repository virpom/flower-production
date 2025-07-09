import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI; // Removed the strict check here

// Переменная для кэширования соединения
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    // Only throw error if MONGODB_URI is not defined when connection is actually attempted
    throw new Error('MONGODB_URI не определен. Пожалуйста, убедитесь, что он установлен в .env файле или переменных окружения.');
  }

  if (!cached.promise) {
    // Настройки для MongoDB в Docker
    const options = {
      authSource: 'admin'
    };
    
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('Подключено к MongoDB в Docker');
      return mongoose;
    }).catch((e) => { // Added catch block to clear promise on error
      cached.promise = null;
      console.error('Ошибка при подключении к MongoDB:', e);
      throw e;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Ensure promise is cleared if await fails
    console.error('Ошибка при подключении к MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connect;
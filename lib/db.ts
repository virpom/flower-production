import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Определяем, что мы в режиме сборки
const isBuildTime = process.env.NODE_ENV === 'production' && 
  (process.env.NEXT_PHASE === 'phase-production-build' || 
   process.env.BUILD_ID || 
   !MONGODB_URI);

if (!MONGODB_URI && !isBuildTime) {
  throw new Error('Пожалуйста, определите MONGODB_URI в файле .env');
}

// Переменная для кэширования соединения
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connect() {
  // Если мы в режиме сборки, возвращаем мок-соединение
  if (isBuildTime) {
    console.log('Режим сборки: пропускаем подключение к MongoDB');
    return { connection: { readyState: 1 } }; // Мок объект
  }

  // Проверяем наличие MONGODB_URI в рантайме
  if (!MONGODB_URI) {
    console.error('MONGODB_URI не определен в переменных окружения');
    throw new Error('MONGODB_URI не определен в переменных окружения');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Настройки для MongoDB в Docker
    const options = {
      authSource: 'admin',
      serverSelectionTimeoutMS: 10000, // 10 секунд
      connectTimeoutMS: 10000, // 10 секунд
      socketTimeoutMS: 45000, // 45 секунд
    };
    
    console.log('Подключение к MongoDB:', MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
    
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('Подключено к MongoDB успешно');
      return mongoose;
    }).catch((error) => {
      console.error('Ошибка подключения к MongoDB:', error.message);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Ошибка при подключении к MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connect;
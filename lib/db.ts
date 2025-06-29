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
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Настройки для MongoDB в Docker
    const options = {
      authSource: 'admin'
    };
    
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('Подключено к MongoDB в Docker');
      return mongoose;
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
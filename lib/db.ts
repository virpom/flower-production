import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://floweradmin:flowerpassword@mongodb:27017/flowerdb?authSource=admin';

// Кэшируем соединение глобально
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectToDatabase = async (): Promise<typeof mongoose> => {
  if (cached!.conn) {
    console.log('🔄 Используем существующее подключение к MongoDB');
    return cached!.conn;
  }

  if (!cached!.promise) {
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log('🔌 Подключаемся к MongoDB...');
    
    cached!.promise = mongoose.connect(MONGODB_URI, options)
      .then((mongooseInstance) => {
        console.log('✅ Успешно подключились к MongoDB');
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ Ошибка подключения к MongoDB:', error.message);
        cached!.promise = null;
        throw error;
      });
  }

  try {
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (error) {
    cached!.promise = null;
    throw error;
  }
};

export default connectToDatabase;

import mongoose from 'mongoose';

/**
 * Проверяет состояние подключения к MongoDB
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Проверяет, доступна ли база данных
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Если MongoDB недоступен, это может быть нормально во время сборки
    const isBuildTime = process.env.NODE_ENV === 'production' && 
      (process.env.NEXT_PHASE === 'phase-production-build' || 
       process.env.BUILD_ID || 
       !process.env.MONGODB_URI);

    if (isBuildTime) {
      console.log('[DB HEALTH] Режим сборки - пропускаем проверку БД');
      return false;
    }

    if (!process.env.MONGODB_URI) {
      console.log('[DB HEALTH] MONGODB_URI не определен');
      return false;
    }

    // Проверяем текущее состояние подключения
    if (isConnected()) {
      // Попробуем выполнить простой запрос
      await mongoose.connection.db.admin().ping();
      return true;
    }

    return false;
  } catch (error) {
    console.warn('[DB HEALTH] База данных недоступна:', error.message);
    return false;
  }
}

/**
 * Безопасное выполнение операции с БД
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      console.log('[DB SAFE] БД недоступна, возвращаем fallback');
      return fallback;
    }

    return await operation();
  } catch (error) {
    console.warn('[DB SAFE] Ошибка операции БД, возвращаем fallback:', error.message);
    return fallback;
  }
}

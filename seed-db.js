const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Убедитесь, что путь к модели User правильный

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flower-shop';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Успешное подключение к MongoDB...');

    // Проверяем, существует ли уже пользователь admin
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Пользователь admin уже существует. Удаляем его...');
      await User.deleteOne({ username: 'admin' });
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Создаем нового пользователя-админа
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Пользователь admin успешно создан!');

  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключено от MongoDB.');
  }
}

seedDatabase(); 
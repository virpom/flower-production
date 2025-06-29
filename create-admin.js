const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Простая схема пользователя без импорта модели
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://floweradmin:flowerpassword@flower-mongodb:27017/flowerdb?authSource=admin';

async function createAdmin() {
  try {
    console.log('Подключение к MongoDB:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    await mongoose.connect(MONGO_URI, {
      authSource: 'admin'
    });

    console.log('Успешное подключение к MongoDB...');

    // Проверяем, существует ли уже пользователь admin
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Пользователь admin уже существует. Обновляем пароль...');
      await User.deleteOne({ username: 'admin' });
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Создаем нового пользователя-админа
    const adminUser = new User({
      username: 'admin',
      email: 'admin@flower.com',
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Пользователь admin успешно создан!');
    console.log('Логин: admin');
    console.log('Пароль: admin123');

  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключено от MongoDB.');
  }
}

createAdmin();

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://floweradmin:flowerpassword@localhost:27017/flowerdb?authSource=admin';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Подключение к MongoDB установлено');
    
    const db = client.db();
    
    // Очищаем существующие данные
    console.log('🧹 Очистка существующих данных...');
    await db.collection('users').deleteMany({});
    await db.collection('categories').deleteMany({});
    await db.collection('subcategories').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('settings').deleteMany({});
    await db.collection('paymentsettings').deleteMany({});
    
    // Создаем администратора
    console.log('👤 Создание администратора...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user12345', 10);
    
    const adminUser = {
      _id: new ObjectId(),
      username: 'admin',
      email: 'admin@flower-shop.ru',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const regularUser = {
      _id: new ObjectId(),
      username: 'user',
      email: 'user@flower-shop.ru',
      password: userPassword,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('users').insertMany([adminUser, regularUser]);
    
    // Создаем категории
    console.log('📂 Создание категорий...');
    const categories = [
      { _id: new ObjectId(), name: 'Букеты', slug: 'bukety', subcategories: [], createdAt: new Date(), updatedAt: new Date() },
      { _id: new ObjectId(), name: 'Розы', slug: 'rozy', subcategories: [], createdAt: new Date(), updatedAt: new Date() }
    ];
    
    const categoryResult = await db.collection('categories').insertMany(categories);
    const categoryIds = Object.values(categoryResult.insertedIds);
    
    // Создаем подкатегории
    console.log('📁 Создание подкатегорий...');
    const subcategories = [
      { _id: new ObjectId(), name: 'Букеты из роз', slug: 'bukety-iz-roz', categoryId: categoryIds[0], description: 'Роскошные букеты из роз', image: '', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { _id: new ObjectId(), name: 'Красные розы', slug: 'krasnye-rozy', categoryId: categoryIds[1], description: 'Классические красные розы', image: '', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];
    
    const subcategoryResult = await db.collection('subcategories').insertMany(subcategories);
    const subcategoryIds = Object.values(subcategoryResult.insertedIds);
    
    // Привязка subcategories к categories (только ObjectId)
    await db.collection('categories').updateOne({ _id: categoryIds[0] }, { $set: { subcategories: [subcategories[0]._id] } });
    await db.collection('categories').updateOne({ _id: categoryIds[1] }, { $set: { subcategories: [subcategories[1]._id] } });
    
    // Создаем товары
    console.log('🌹 Создание товаров...');
    const products = [
      {
        _id: new ObjectId(),
        name: 'Букет "Романтика"',
        price: 2500,
        categoryId: categoryIds[0],
        subcategoryId: subcategoryIds[0],
        image: '/uploads/romantika.jpg',
        description: 'Романтичный букет из 25 роз',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Красная роза',
        price: 300,
        categoryId: categoryIds[1],
        subcategoryId: subcategoryIds[1],
        image: '/uploads/red-rose.jpg',
        description: 'Одна красная роза',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const productResult = await db.collection('products').insertMany(products);
    const productIds = Object.values(productResult.insertedIds);
    
    // Создаем заказы
    console.log('📦 Создание заказов...');
    const orders = [
      {
        orderNumber: '20240601-001',
        customer: {
          name: 'Иван Петров',
          email: 'ivan@example.com',
          phone: '+7 (999) 123-45-67',
          address: 'г. Москва, ул. Тверская, д. 1, кв. 5'
        },
        items: [
          {
            productId: productIds[0],
            name: products[0].name,
            price: products[0].price,
            quantity: 1,
            image: products[0].image
          }
        ],
        totalAmount: 2500,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        deliveryTime: '14:00-16:00',
        notes: 'Доставить к 14:00',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('orders').insertMany(orders);
    
    // Создаем настройки
    console.log('⚙️ Создание настроек...');
    await db.collection('settings').insertOne({
      siteName: 'Цветочный магазин "Роза"',
      siteDescription: 'Лучшие цветы для любого случая с доставкой по Москве',
      contactEmail: 'info@flower-shop.ru',
      contactPhone: '+7 (495) 123-45-67',
      address: 'г. Москва, ул. Цветочная, д. 1',
      workingHours: 'Пн-Вс: 9:00-21:00',
      deliveryRadius: 15,
      minOrderAmount: 500,
      freeDeliveryThreshold: 2000,
      deliveryFee: 200,
      currency: 'RUB',
      timezone: 'Europe/Moscow',
      maintenanceMode: false,
      seoTitle: 'Цветочный магазин - Доставка цветов по Москве',
      seoDescription: 'Заказать букеты и цветы с доставкой по Москве. Большой выбор, быстрая доставка.',
      seoKeywords: 'цветы, букеты, доставка цветов, цветочный магазин, розы, тюльпаны',
      socialLinks: {
        instagram: 'https://instagram.com/flower-shop',
        telegram: 'https://t.me/flower-shop',
        whatsapp: '+7 (999) 123-45-67'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Создаем настройки платежей
    console.log('💳 Создание настроек платежей...');
    await db.collection('paymentsettings').insertOne({
      isEnabled: true,
      currency: 'RUB',
      stripe: {
        enabled: false,
        publishableKey: '',
        secretKey: '',
        webhookSecret: ''
      },
      yookassa: {
        enabled: false,
        shopId: '',
        secretKey: ''
      },
      sberbank: {
        enabled: false,
        merchantId: '',
        apiKey: ''
      },
      cashOnDelivery: {
        enabled: true,
        minAmount: 0,
        maxAmount: 50000
      },
      cardOnDelivery: {
        enabled: true,
        minAmount: 0,
        maxAmount: 100000
      },
      taxRate: 0,
      deliveryFee: 200,
      freeDeliveryThreshold: 2000,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ База данных успешно заполнена валидными тестовыми данными!');
    console.log('\n📊 Статистика:');
    console.log(`   - Категорий: ${categories.length}`);
    console.log(`   - Подкатегорий: ${subcategories.length}`);
    console.log(`   - Товаров: ${products.length}`);
    console.log(`   - Заказов: ${orders.length}`);
    console.log(`   - Администраторов: 1`);
    console.log('\n🔑 Данные для входа:');
    console.log(`   - Логин: admin`);
    console.log(`   - Пароль: admin123`);
    console.log(`   - Логин пользователя: user`);
    console.log(`   - Пароль: user12345`);
    
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
  } finally {
    await client.close();
  }
}

// Запуск заполнения базы данных
seedDatabase(); 
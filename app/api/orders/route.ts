import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getCachedOrders, invalidateOrdersCache, invalidateOrderStatsCache } from '@/lib/cache';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

// GET запрос для получения заказов (с кэшированием)
export async function GET(request: NextRequest) {
  try {
    console.log('Получение заказов из кэша...');
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Для админов показываем все заказы, для клиентов - только их
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin' && !email) {
      return NextResponse.json(
        { error: 'Email обязателен для получения заказов клиента' },
        { status: 400 }
      );
    }
    
    // Создаем фильтры для кэша
    const filters = {
      email,
      status,
      page,
      limit
    };
    
    // Получаем заказы из кэша
    const result = await getCachedOrders(filters);
    
    console.log(`Получено заказов из кэша: ${result.orders.length}`);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error: any) {
    console.error('Ошибка при получении заказов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказов', details: error.message },
      { status: 500 }
    );
  }
}

// Функция для генерации номера заказа
async function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const lastOrderToday = await Order.findOne({ createdAt: { $gte: todayStart } }).sort({ createdAt: -1 });
  
  let sequence = 1;
  if (lastOrderToday && lastOrderToday.orderNumber) {
    const lastSequence = parseInt(lastOrderToday.orderNumber.split('-')[1]);
    sequence = lastSequence + 1;
  }
  
  return `${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
}

// POST запрос для создания нового заказа
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { customer, items, paymentMethod, notes } = body;

    if (!customer || !items || !paymentMethod || items.length === 0) {
      return NextResponse.json({ error: 'Неполные данные для создания заказа' }, { status: 400 });
    }
    
    let totalAmount = 0;
    const orderItems = []; // Создаем новый массив для обработанных товаров

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Товар с ID ${item.productId} не найден` }, { status: 404 });
      }
      
      totalAmount += product.price * item.quantity;
      
      // Создаем новый объект товара для заказа
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }

    // Генерируем номер заказа
    const orderNumber = await generateOrderNumber();

    const newOrder = new Order({
      orderNumber, // Добавляем сгенерированный номер
      customer,
      items: orderItems,
      paymentMethod,
      notes,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await newOrder.save();

    return NextResponse.json({ 
      message: 'Заказ успешно создан', 
      order: newOrder 
    }, { status: 201 });

  } catch (error) {
    console.error('Ошибка пр�� создании заказа:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера', details: error.message }, { status: 500 });
  }
}

// PUT запрос для обновления статуса заказа (только для админов)
export async function PUT(request: NextRequest) {
  try {
    // Получаем информацию о пользователе из middleware
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен - требуется роль администратора' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    const { _id, ...updateData } = body;
    
    if (!_id) {
      return NextResponse.json(
        { error: 'ID заказа обязателен' },
        { status: 400 }
      );
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.productId', 'name price image');
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
    // Инвалидируем кэш заказов и статистики
    invalidateOrdersCache();
    invalidateOrderStatsCache();
    
    return NextResponse.json({ order: updatedOrder }, { status: 200 });
    
  } catch (error: any) {
    console.error('Ошибка при обновлении заказа:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ошибка при обновлении заказа', details: error.message },
      { status: 500 }
    );
  }
}

export async function GETAll() {
  try {
    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 }); // Сортируем по дате создания
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
} 
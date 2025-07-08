import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { invalidateOrdersCache, invalidateOrderStatsCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET запрос для получения одного заказа по ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const order = await Order.findById(params.id).populate('items.productId', 'name price image');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ order }, { status: 200 });
    
  } catch (error: any) {
    console.error(`Ошибка при получении заказа ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказа', details: error.message },
      { status: 500 }
    );
  }
}

// PUT запрос для обновления заказа по ID (например, статуса)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      body,
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
    console.error(`Ошибка при обновлении заказа ${params.id}:`, error);
    
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

// DELETE запрос для удаления заказа по ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const deletedOrder = await Order.findByIdAndDelete(params.id);
    
    if (!deletedOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
    // Инвалидируем кэш заказов и статистики
    invalidateOrdersCache();
    invalidateOrderStatsCache();
    
    return NextResponse.json(
      { message: 'Заказ успешно удален' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error(`Ошибка при удалении заказа ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Ошибка при удалении заказа', details: error.message },
      { status: 500 }
    );
  }
} 
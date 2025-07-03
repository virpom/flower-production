import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// GET запрос для получения конкретного заказа
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID заказа обязателен' },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(id)
      .populate('items.productId', 'name price image description');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
    // Проверяем права доступа
    const userRole = request.headers.get('x-user-role');
    const userEmail = request.headers.get('x-username'); // В нашем случае username = email
    
    // Если не админ, проверяем что заказ принадлежит пользователю
    if (userRole !== 'admin' && order.customer.email !== userEmail) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ order }, { status: 200 });
    
  } catch (error: any) {
    console.error('Ошибка при получении заказа:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказа', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH запрос для частичного обновления заказа
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
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
    
    const { id } = await context.params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID заказа обязателен' },
        { status: 400 }
      );
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('items.productId', 'name price image');
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
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

// DELETE запрос для удаления заказа (только для админов)
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
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
    
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID заказа обязателен' },
        { status: 400 }
      );
    }
    
    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Заказ успешно удален', order: deletedOrder },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Ошибка при удалении заказа:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении заказа', details: error.message },
      { status: 500 }
    );
  }
} 
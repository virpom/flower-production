import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import { Product } from '@/app/models/Product';

export const dynamic = 'force-dynamic';

// GET запрос для получения товаров по ID категории
export async function GET(request: NextRequest, { params }: { params: { categoryId: string } }) {
  try {
    await connect();
    
    const categoryId = Number(params.categoryId);
    
    // Проверка валидности categoryId
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Неверный формат ID категории' },
        { status: 400 }
      );
    }
    
    // Получаем все товары в категории
    const products = await Product.find({ categoryId });
    
    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error('Ошибка при получении товаров категории:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении товаров категории', details: error.message },
      { status: 500 }
    );
  }
}
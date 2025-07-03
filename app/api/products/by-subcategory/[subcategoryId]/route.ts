import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import { Product } from '@/app/models/Product';

// GET запрос для получения товаров по ID подкатегории
export async function GET(request: NextRequest, { params }: { params: { subcategoryId: string } }) {
  try {
    await connect();
    
    const subcategoryId = Number(params.subcategoryId);
    
    // Проверка валидности subcategoryId
    if (isNaN(subcategoryId)) {
      return NextResponse.json(
        { error: 'Неверный формат ID подкатегории' },
        { status: 400 }
      );
    }
    
    // Получаем все товары в подкатегории
    const products = await Product.find({ subcategoryId });
    
    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error('Ошибка при получении товаров подкатегории:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении товаров подкатегории', details: error.message },
      { status: 500 }
    );
  }
}
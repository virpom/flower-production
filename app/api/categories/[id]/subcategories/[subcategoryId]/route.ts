import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Category from '@/app/models/Category';

export const dynamic = 'force-dynamic';

// GET запрос для получения конкретной подкатегории
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string, subcategoryId: string } }
) {
  try {
    await connect();
    
    const { id, subcategoryId } = params;
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }
    
    const subcategory = category.subcategories.id(subcategoryId);
    
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Подкатегория не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(subcategory, { status: 200 });
  } catch (error: any) {
    console.error(`Ошибка при получении подкатегории с ID ${params.subcategoryId}:`, error);
    return NextResponse.json(
      { error: 'Ошибка при получении подкатегории', details: error.message },
      { status: 500 }
    );
  }
}

// PUT запрос для обновления конкретной подкатегории
export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string, subcategoryId: string } }
) {
  try {
    await connect();
    
    const { id, subcategoryId } = params;
    const body = await request.json();
    
    // Находим категорию по ID
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }
    
    // Проверяем, существует ли подкатегория с таким slug, но не с таким ID
    if (body.slug) {
      const slugExists = await Category.findOne({
        _id: { $ne: id },
        'subcategories.slug': body.slug
      });
      
      if (slugExists) {
        return NextResponse.json(
          { error: 'Подкатегория с таким slug уже существует' },
          { status: 400 }
        );
      }
    }
    
    // Обновляем подкатегорию в массиве
    const subcategoryIndex = category.subcategories.findIndex(
      (sc: any) => sc._id.toString() === subcategoryId
    );
    
    if (subcategoryIndex === -1) {
      return NextResponse.json(
        { error: 'Подкатегория не найдена' },
        { status: 404 }
      );
    }
    
    // Обновляем поля подкатегории
    Object.assign(category.subcategories[subcategoryIndex], body);
    
    await category.save();
    
    return NextResponse.json(category.subcategories[subcategoryIndex], { status: 200 });
  } catch (error: any) {
    console.error(`Ошибка при обновлении подкатегории с ID ${params.subcategoryId}:`, error);
    
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
      { error: 'Ошибка при обновлении подкатегории', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE запрос для удаления конкретной подкатегории
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string, subcategoryId: string } }
) {
  try {
    await connect();
    
    const { id, subcategoryId } = params;
    
    // Находим категорию
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }
    
    // Удаляем подкатегорию из массива
    const subcategoryIndex = category.subcategories.findIndex(
      (sc: any) => sc._id.toString() === subcategoryId
    );
    
    if (subcategoryIndex === -1) {
      return NextResponse.json(
        { error: 'Подкатегория не найдена' },
        { status: 404 }
      );
    }
    
    category.subcategories.splice(subcategoryIndex, 1);
    await category.save();
    
    return NextResponse.json(
      { success: true, message: 'Подкатегория успешно удалена' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Ошибка при удалении подкатегории с ID ${params.subcategoryId}:`, error);
    return NextResponse.json(
      { error: 'Ошибка при удалении подкатегории', details: error.message },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Category from '@/app/models/Category';

// GET запрос для получения всех подкатегорий определенной категории
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    
    const { id } = params;
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ subcategories: category.subcategories }, { status: 200 });
  } catch (error: any) {
    console.error(`Ошибка при получении подкатегорий для категории с ID ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Ошибка при получении подкатегорий', details: error.message },
      { status: 500 }
    );
  }
}

// POST запрос для создания новой подкатегории
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    
    const { id } = params;
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Находим максимальный ID и увеличиваем на 1 для новой подкатегории
    const maxId = category.subcategories.length > 0 
      ? Math.max(...category.subcategories.map(sc => sc.id))
      : 0;
    
    const newSubcategory = {
      ...body,
      id: maxId + 1,
      categoryId: category.id
    };
    
    // Проверяем на уникальность slug в рамках всех подкатегорий
    const slugExists = await Category.findOne({
      'subcategories.slug': newSubcategory.slug
    });
    
    if (slugExists) {
      return NextResponse.json(
        { error: 'Подкатегория с таким slug уже существует' },
        { status: 400 }
      );
    }
    
    // Добавляем подкатегорию в массив
    category.subcategories.push(newSubcategory);
    await category.save();
    
    // Возвращаем созданную подкатегорию
    return NextResponse.json(
      category.subcategories[category.subcategories.length - 1],
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`Ошибка при создании подкатегории для категории с ID ${params.id}:`, error);
    
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
      { error: 'Ошибка при создании подкатегории', details: error.message },
      { status: 500 }
    );
  }
}

// PUT запрос для обновления подкатегорий (замена всего массива)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    
    const { id } = params;
    const body = await request.json();
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { subcategories: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ subcategories: updatedCategory.subcategories }, { status: 200 });
  } catch (error: any) {
    console.error(`Ошибка при обновлении подкатегорий для категории с ID ${params.id}:`, error);
    
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
      { error: 'Ошибка при обновлении подкатегорий', details: error.message },
      { status: 500 }
    );
  }
}
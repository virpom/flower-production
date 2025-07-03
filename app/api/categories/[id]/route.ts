import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Category from '@/app/models/Category';
import Subcategory from '@/models/Subcategory';
import Product from '@/models/Product';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// GET запрос для получения конкретной категории по ID
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
    
    return NextResponse.json(category, { status: 200 });
  } catch (error: any) {
    console.error(`Ошибка при получении категории с ID ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Ошибка при получении категории', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a category by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connect();
    const { id } = params;
    const { name } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Неверный ID категории' }, { status: 400 });
    }
    
    if (!name) {
      return NextResponse.json({ error: 'Название категории обязательно' }, { status: 400 });
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
    }

    revalidatePath('/admin/categories');
    
    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error('Ошибка при обновлении категории:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE - Delete a category by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Неверный ID категории' }, { status: 400 });
    }
    
    // Проверяем, есть ли товары в этой категории или ее подкатегориях
    const products = await Product.find({ categoryId: id });
    if (products.length > 0) {
      return NextResponse.json({ error: 'Невозможно удалить категорию, в которой есть товары.' }, { status: 400 });
    }
    
    // Удаляем подкатегории
    await Subcategory.deleteMany({ categoryId: id });
    
    // Удаляем саму категорию
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
    }
    
    revalidatePath('/admin/categories');
    
    return NextResponse.json({ message: 'Категория и ее подкатегории успешно удалены' });
  } catch (error: any) {
    console.error('Ошибка при удалении категории:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
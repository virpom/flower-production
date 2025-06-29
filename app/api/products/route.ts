import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Product from '@/models/Product';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// GET all products
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');

    const query: any = {};
    if (categoryId) query.categoryId = categoryId;
    if (subcategoryId) query.subcategoryId = subcategoryId;
    console.log('PRODUCTS API QUERY:', query);
    const products = await Product.find(query).lean();
    console.log('PRODUCTS API RESULT:', products);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST a new product
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    // Удаляем subcategoryId если оно пустое или null
    if (!body.subcategoryId) {
      delete body.subcategoryId;
    } else {
      body.subcategoryId = new mongoose.Types.ObjectId(body.subcategoryId);
    }
    
    // Преобразуем categoryId
    if (body.categoryId) {
      body.categoryId = new mongoose.Types.ObjectId(body.categoryId);
    }

    const newProduct = await Product.create(body);

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/category', 'layout');

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Ошибка при создании товара:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: 'Ошибка валидации', details: validationErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка при создании товара', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID товара обязателен' }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Товар успешно удалён' });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    return NextResponse.json({ error: 'Ошибка при удалении товара' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID товара обязателен' }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Ошибка при обновлении товара:', error);
    // ... (error handling)
    return NextResponse.json({ error: 'Ошибка при обновлении товара' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET all categories with their subcategories
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
        const category = await Category.findOne({ slug }).populate('subcategories').lean();
        if (!category) {
            return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
        }
        return NextResponse.json(category);
    }
    
    const categories = await Category.find({}).populate('subcategories').lean();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// POST a new category
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Название категории обязательно' }, { status: 400 });
    }

    const newCategory = new Category({ name });
    await newCategory.save();

    // Revalidate client-side paths
    revalidatePath('/');
    revalidatePath('/category', 'layout');

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// PUT to update a category
export async function PUT(request: NextRequest) {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID категории обязателен' }, { status: 400 });
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!updatedCategory) {
            return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
        }

        revalidatePath('/');
        revalidatePath('/category', 'layout');

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

// DELETE a category
export async function DELETE(request: NextRequest) {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID категории обязателен' }, { status: 400 });
        }

        // Also delete subcategories of this category
        await Subcategory.deleteMany({ categoryId: id });
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
        }

        revalidatePath('/');
        revalidatePath('/category', 'layout');

        return NextResponse.json({ message: 'Категория и все её подкатегории удалены' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
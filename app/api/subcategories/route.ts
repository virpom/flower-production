import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import { getCachedSubcategories, invalidateSubcategoriesCache } from '@/lib/cache';
import Category from '@/models/Category';
import { revalidatePath } from 'next/cache';

// GET all subcategories or by slug
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const subcategory = await Subcategory.findOne({ slug }).lean();
      if (!subcategory) {
        return NextResponse.json({ error: 'Подкатегория не найдена' }, { status: 404 });
      }
      return NextResponse.json(subcategory);
    }

    const subcategories = await Subcategory.find({}).lean();
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// POST a new subcategory
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, categoryId } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Название и ID категории обязательны' }, { status: 400 });
    }

    const parentCategory = await Category.findById(categoryId);
    if (!parentCategory) {
      return NextResponse.json({ error: 'Родительская категория не найдена' }, { status: 404 });
    }

    const newSubcategory = new Subcategory({ 
      name, 
      categoryId: categoryId 
    });
    await newSubcategory.save();

    parentCategory.subcategories.push(newSubcategory._id);
    await parentCategory.save();

    // Revalidate client-side paths
    revalidatePath('/');
    revalidatePath('/category', 'layout');

    return NextResponse.json(newSubcategory, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// PUT to update a subcategory
export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID подкатегории обязателен' }, { status: 400 });
        }

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!updatedSubcategory) {
            return NextResponse.json({ error: 'Подкатегория не найдена' }, { status: 404 });
        }

        revalidatePath('/');
        revalidatePath('/category', 'layout');

        return NextResponse.json(updatedSubcategory);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

// DELETE a subcategory
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID подкатегории обязателен' }, { status: 400 });
        }

        const deletedSubcategory = await Subcategory.findByIdAndDelete(id);

        if (!deletedSubcategory) {
            return NextResponse.json({ error: 'Подкатегория не найдена' }, { status: 404 });
        }

        // Remove from parent category's list
        await Category.updateMany(
            { subcategories: id },
            { $pull: { subcategories: id } }
        );

        revalidatePath('/');
        revalidatePath('/category', 'layout');

        return NextResponse.json({ message: 'Подкатегория удалена' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
} 
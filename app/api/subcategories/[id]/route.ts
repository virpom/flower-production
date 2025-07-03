import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// PUT - Update a subcategory by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;
    const { name } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Неверный ID подкатегории' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Название подкатегории обязательно' }, { status: 400 });
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedSubcategory) {
      return NextResponse.json({ error: 'Подкатегория не найдена' }, { status: 404 });
    }

    revalidatePath('/admin/categories');

    return NextResponse.json(updatedSubcategory);
  } catch (error: any) {
    console.error('Ошибка при обновлении подкатегории:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE - Delete a subcategory by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Неверный ID подкатегории' }, { status: 400 });
    }

    // Check if there are any products associated with this subcategory
    const productCount = await Product.countDocuments({ subcategoryId: id });
    if (productCount > 0) {
      return NextResponse.json({ error: 'Невозможно удалить подкатегорию, так как в ней есть товары.' }, { status: 409 });
    }

    const deletedSubcategory = await Subcategory.findByIdAndDelete(id);

    if (!deletedSubcategory) {
      return NextResponse.json({ error: 'Подкатегория не найдена' }, { status: 404 });
    }

    // Remove the subcategory reference from the parent category
    await Category.updateOne(
      { _id: deletedSubcategory.categoryId },
      { $pull: { subcategories: id } }
    );

    revalidatePath('/admin/categories');

    return NextResponse.json({ message: 'Подкатегория успешно удалена' });
  } catch (error: any) {
    console.error('Ошибка при удалении подкатегории:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
} 
'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import { getCachedSubcategories, invalidateSubcategoriesCache } from '@/lib/cache';

// Создание новой подкатегории
export async function createSubcategory(formData: FormData) {
  try {
    await dbConnect();
    
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    const isActive = formData.get('isActive') === 'true';
    
    if (!name || !slug || !categoryId) {
      return {
        success: false,
        error: 'Обязательные поля: название, slug, ID категории'
      };
    }
    
    const subcategory = await Subcategory.create({
      name,
      slug,
      categoryId,
      description,
      image,
      isActive
    });
    
    // Инвалидируем кэш и обновляем страницы
    invalidateSubcategoriesCache();
    revalidatePath('/admin/subcategories');
    revalidatePath('/admin/categories');
    
    return {
      success: true,
      subcategory
    };
    
  } catch (error: any) {
    console.error('Ошибка при создании подкатегории:', error);
    
    if (error.code === 11000) {
      return {
        success: false,
        error: 'Подкатегория с таким slug уже существует'
      };
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return {
        success: false,
        error: `Ошибка валидации: ${validationErrors.join(', ')}`
      };
    }
    
    return {
      success: false,
      error: 'Ошибка при создании подкатегории'
    };
  }
}

// Обновление подкатегории
export async function updateSubcategory(id: string, formData: FormData) {
  try {
    await dbConnect();
    
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    const isActive = formData.get('isActive') === 'true';
    
    if (!name || !slug || !categoryId) {
      return {
        success: false,
        error: 'Обязательные поля: название, slug, ID категории'
      };
    }
    
    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        categoryId,
        description,
        image,
        isActive
      },
      { new: true, runValidators: true }
    );
    
    if (!subcategory) {
      return {
        success: false,
        error: 'Подкатегория не найдена'
      };
    }
    
    // Инвалидируем кэш и обновляем страницы
    invalidateSubcategoriesCache();
    revalidatePath('/admin/subcategories');
    revalidatePath('/admin/categories');
    
    return {
      success: true,
      subcategory
    };
    
  } catch (error: any) {
    console.error('Ошибка при обновлении подкатегории:', error);
    
    if (error.code === 11000) {
      return {
        success: false,
        error: 'Подкатегория с таким slug уже существует'
      };
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return {
        success: false,
        error: `Ошибка валидации: ${validationErrors.join(', ')}`
      };
    }
    
    return {
      success: false,
      error: 'Ошибка при обновлении подкатегории'
    };
  }
}

// Удаление подкатегории
export async function deleteSubcategory(id: string) {
  try {
    await dbConnect();
    
    const subcategory = await Subcategory.findByIdAndDelete(id);
    
    if (!subcategory) {
      return {
        success: false,
        error: 'Подкатегория не найдена'
      };
    }
    
    // Инвалидируем кэш и обновляем страницы
    invalidateSubcategoriesCache();
    revalidatePath('/admin/subcategories');
    revalidatePath('/admin/categories');
    
    return {
      success: true,
      message: 'Подкатегория успешно удалена'
    };
    
  } catch (error: any) {
    console.error('Ошибка при удалении подкатегории:', error);
    return {
      success: false,
      error: 'Ошибка при удалении подкатегории'
    };
  }
}

// Получение всех подкатегорий (с кэшированием)
export async function getSubcategories(filters?: {
  categoryId?: string;
  isActive?: boolean;
}) {
  try {
    // Получаем подкатегории из кэша
    const subcategories = await getCachedSubcategories(filters);
    
    return {
      success: true,
      subcategories
    };
    
  } catch (error: any) {
    console.error('Ошибка при получении подкатегорий:', error);
    return {
      success: false,
      error: 'Ошибка при получении подкатегорий'
    };
  }
}

// Получение подкатегорий по ID категории (с кэшированием)
export async function getSubcategoriesByCategory(categoryId: string) {
  try {
    if (!categoryId) {
      return {
        success: false,
        error: 'ID категории обязателен'
      };
    }
    
    // Получаем подкатегории из кэша с фильтром по категории
    const subcategories = await getCachedSubcategories({ categoryId });
    
    return {
      success: true,
      subcategories
    };
    
  } catch (error: any) {
    console.error('Ошибка при получении подкатегорий категории:', error);
    return {
      success: false,
      error: 'Ошибка при получении подкатегорий'
    };
  }
} 
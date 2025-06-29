// Интерфейсы для категорий и подкатегорий
export interface ISubcategory {
  _id?: string;
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

export interface ICategory {
  _id?: string;
  id: number;
  name: string;
  slug: string;
  image?: string;
  subcategories: ISubcategory[];
}

// Получение всех категорий с подкатегориями
export const getAllCategories = async (): Promise<ICategory[]> => {
  try {
    const response = await fetch('/api/categories', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при получении категорий');
    }
    
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    return [];
  }
};

// Получение категории по ID
export const getCategoryById = async (id: number): Promise<ICategory | null> => {
  try {
    const categories = await getAllCategories();
    return categories.find(category => category.id === id) || null;
  } catch (error) {
    console.error(`Ошибка при получении категории с ID ${id}:`, error);
    return null;
  }
};

// Получение категории по slug
export const getCategoryBySlug = async (slug: string): Promise<ICategory | null> => {
  try {
    const categories = await getAllCategories();
    return categories.find(category => category.slug === slug) || null;
  } catch (error) {
    console.error(`Ошибка при получении категории со slug ${slug}:`, error);
    return null;
  }
};

// Получение подкатегории по ID
export const getSubcategoryById = async (id: number): Promise<ISubcategory | null> => {
  try {
    const categories = await getAllCategories();
    let result: ISubcategory | null = null;
    
    categories.some(category => {
      const subcategory = category.subcategories.find(subcategory => subcategory.id === id);
      if (subcategory) {
        result = subcategory;
        return true;
      }
      return false;
    });
    
    return result;
  } catch (error) {
    console.error(`Ошибка при получении подкатегории с ID ${id}:`, error);
    return null;
  }
};

// Получение подкатегории по slug и ID категории
export const getSubcategoryBySlugAndCategoryId = async (
  slug: string,
  categoryId: number
): Promise<ISubcategory | null> => {
  try {
    const category = await getCategoryById(categoryId);
    
    if (!category) {
      return null;
    }
    
    return category.subcategories.find(subcategory => subcategory.slug === slug) || null;
  } catch (error) {
    console.error(`Ошибка при получении подкатегории со slug ${slug} в категории ${categoryId}:`, error);
    return null;
  }
};
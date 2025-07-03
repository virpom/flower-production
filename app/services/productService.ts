import { IProduct } from '../client/models/Product';

// Получение всех товаров
export const getAllProducts = async (): Promise<IProduct[]> => {
  try {
    const response = await fetch('/api/products', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при получении товаров');
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    return [];
  }
};

// Получение товара по ID
export const getProductById = async (id: string): Promise<IProduct | null> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при получении товара');
    }
    
    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.error(`Ошибка при получении товара с ID ${id}:`, error);
    return null;
  }
};

// Получение товаров по категории
export const getProductsByCategory = async (categoryId: number): Promise<IProduct[]> => {
  try {
    const response = await fetch(`/api/products/by-category/${categoryId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при получении товаров по категории');
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`Ошибка при получении товаров категории ${categoryId}:`, error);
    return [];
  }
};

// Получение товаров по подкатегории
export const getProductsBySubcategory = async (subcategoryId: number): Promise<IProduct[]> => {
  try {
    const response = await fetch(`/api/products/by-subcategory/${subcategoryId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при получении товаров по подкатегории');
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`Ошибка при получении товаров подкатегории ${subcategoryId}:`, error);
    return [];
  }
};

// Создание нового товара
export const createProduct = async (productData: Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>): Promise<IProduct | null> => {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при создании товара');
    }
    
    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    return null;
  }
};

// Обновление товара
export const updateProduct = async (id: string, productData: Partial<IProduct>): Promise<IProduct | null> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при обновлении товара');
    }
    
    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.error(`Ошибка при обновлении товара с ID ${id}:`, error);
    return null;
  }
};

// Удаление товара
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при удалении товара');
    }
    
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении товара с ID ${id}:`, error);
    return false;
  }
};
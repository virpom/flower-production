import mongoose, { Schema, models } from 'mongoose';

// Интерфейс для подкатегории
export interface ISubcategory {
  _id?: string;
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

// Схема подкатегории
const subcategorySchema = new Schema<ISubcategory>({
  id: { 
    type: Number, 
    required: [true, 'ID подкатегории обязателен']
  },
  name: { 
    type: String, 
    required: [true, 'Название подкатегории обязательно'] 
  },
  slug: { 
    type: String, 
    required: [true, 'Slug подкатегории обязателен'],
    unique: true
  },
  categoryId: { 
    type: Number, 
    required: [true, 'ID категории обязателен'] 
  }
});

// Интерфейс для категории
export interface ICategory {
  _id?: string;
  id: number;
  name: string;
  slug: string;
  image?: string;
  subcategories: ISubcategory[];
}

// Схема категории
const categorySchema = new Schema<ICategory>(
  {
    id: {
      type: Number,
      required: [true, 'ID категории обязателен']
    },
    name: { 
      type: String, 
      required: [true, 'Название категории обязательно'] 
    },
    slug: { 
      type: String, 
      required: [true, 'Slug категории обязателен'],
      unique: true 
    },
    image: { 
      type: String 
    },
    subcategories: [subcategorySchema]
  },
  {
    timestamps: true
  }
);

// Функция для создания модели только в runtime
function getCategoryModel() {
  // Возвращаем модель только если она уже существует или мы в runtime
  if (typeof window !== 'undefined') {
    // На клиенте модели не должны создаваться
    throw new Error('Models should not be created on client side');
  }
  
  return models.Category || mongoose.model('Category', categorySchema);
}

// Экспорт модели категории
export const Category = getCategoryModel();

export default Category;

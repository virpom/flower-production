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

// Экспорт модели категории
export const Category = models.Category || mongoose.model('Category', categorySchema);

export default Category;
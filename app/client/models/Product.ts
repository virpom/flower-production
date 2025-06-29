// Интерфейс для модели продукта (клиентская версия)
export interface IProduct {
  _id: string;
  title: string;
  name: string; // добавляем name для совместимости
  price: number;
  oldPrice?: number;
  description?: string;
  imageSrc: string;
  image: string; // добавляем image для совместимости
  inStock?: boolean;
  categoryId?: number;
  subcategoryId?: number;
}

// Интерфейс для категории (клиентская версия)
export interface ICategory {
  _id: string;
  id: number;
  name: string;
  slug: string;
  image?: string;
  subcategories?: ISubcategory[];
}

// Интерфейс для подкатегории (клиентская версия)
export interface ISubcategory {
  _id?: string;
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

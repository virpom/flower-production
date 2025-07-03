// Интерфейс для модели продукта
export interface IProduct {
  _id: string;
  title: string;
  price: number;
  oldPrice?: number;
  description?: string;
  imageSrc: string;
  inStock?: boolean;
  categoryId?: number;
  subcategoryId?: number;
} 
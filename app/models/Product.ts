import mongoose, { Schema, models } from 'mongoose';

// Удалён дублирующий интерфейс IProduct

const productSchema = new Schema({
  title: String,
  price: Number,
  oldPrice: Number,
  description: String,
  imageSrc: String,
  inStock: Boolean,
  categoryId: Number,
  subcategoryId: Number,
}, { timestamps: true });

export const Product = models.Product || mongoose.model('Product', productSchema);
export default Product;
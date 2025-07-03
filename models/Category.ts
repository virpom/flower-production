import mongoose, { Document, Model, Schema } from 'mongoose';
import slugify from 'slugify';

export interface ICategory extends Document {
  name: string;
  slug: string;
  subcategories: mongoose.Types.ObjectId[];
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Название категории обязательно'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
      },
    ],
  },
  {
    timestamps: true,
  }
);

CategorySchema.pre('save', function (next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  // @ts-ignore
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category; 
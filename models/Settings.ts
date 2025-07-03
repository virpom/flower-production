import mongoose from 'mongoose';

export interface ISettings extends mongoose.Document {
  siteName: string;
  siteDescription: string;
  contactPhone: string;
  address: string;
  workingHours: string;
  deliveryRadius: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  socialLinks: {
    instagram?: string;
    vk?: string;
    telegram?: string;
    whatsapp?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const socialLinksSchema = new mongoose.Schema({
  instagram: { type: String, trim: true },
  vk: { type: String, trim: true },
  telegram: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
}, { _id: false });

const settingsSchema = new mongoose.Schema<ISettings>({
  siteName: {
    type: String,
    required: [true, 'Название сайта обязательно'],
    trim: true,
    maxlength: [100, 'Название сайта не может быть длиннее 100 символов'],
    default: 'My Awesome Site'
  },
  siteDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Описание сайта не может быть длиннее 500 символов'],
    default: 'The best products at the best prices.'
  },
  contactPhone: {
    type: String,
    required: [true, 'Телефон для связи обязателен'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Адрес обязателен'],
    trim: true
  },
  workingHours: {
    type: String,
    required: [true, 'Время работы обязательно'],
    trim: true
  },
  deliveryRadius: {
    type: Number,
    default: 10,
    min: [0, 'Радиус доставки не может быть отрицательным']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Минимальная сумма заказа не может быть отрицательной']
  },
  freeDeliveryThreshold: {
    type: Number,
    default: 0,
    min: [0, 'Порог бесплатной доставки не может быть отрицательным']
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'Стоимость доставки не может быть отрицательной']
  },
  currency: {
    type: String,
    default: 'RUB',
    trim: true
  },
  timezone: {
    type: String,
    default: 'Europe/Moscow',
    trim: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO заголовок не может быть длиннее 60 символов']
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO описание не может быть длиннее 160 символов']
  },
  seoKeywords: {
    type: String,
    trim: true,
    maxlength: [200, 'SEO ключевые слова не могут быть длиннее 200 символов']
  },
  socialLinks: {
    type: socialLinksSchema,
    default: {}
  }
}, {
  timestamps: true
});

const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);

export default Settings; 
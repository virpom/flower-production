'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import PaymentSettings from '@/models/PaymentSettings';

// Получение настроек платежей
export async function getPaymentSettings() {
  try {
    await dbConnect();
    
    const settings = await PaymentSettings.getSettings();
    
    return {
      success: true,
      settings
    };
    
  } catch (error: any) {
    console.error('Ошибка при получении настроек платежей:', error);
    return {
      success: false,
      error: 'Ошибка при получении настроек платежей'
    };
  }
}

// Обновление настроек платежей
export async function updatePaymentSettings(formData: FormData) {
  try {
    await dbConnect();
    
    const settings = await PaymentSettings.getSettings();
    
    // Получаем данные из формы
    const updateData: any = {
      isEnabled: formData.get('isEnabled') === 'true',
      currency: formData.get('currency') as string,
      
      stripe: {
        enabled: formData.get('stripeEnabled') === 'true',
        publishableKey: formData.get('stripePublishableKey') as string,
        secretKey: formData.get('stripeSecretKey') as string,
        webhookSecret: formData.get('stripeWebhookSecret') as string
      },
      
      yookassa: {
        enabled: formData.get('yookassaEnabled') === 'true',
        shopId: formData.get('yookassaShopId') as string,
        secretKey: formData.get('yookassaSecretKey') as string
      },
      
      sberbank: {
        enabled: formData.get('sberbankEnabled') === 'true',
        merchantId: formData.get('sberbankMerchantId') as string,
        apiKey: formData.get('sberbankApiKey') as string
      },
      
      cashOnDelivery: {
        enabled: formData.get('cashOnDeliveryEnabled') === 'true',
        minAmount: parseFloat(formData.get('cashOnDeliveryMinAmount') as string) || 0,
        maxAmount: parseFloat(formData.get('cashOnDeliveryMaxAmount') as string) || 50000
      },
      
      cardOnDelivery: {
        enabled: formData.get('cardOnDeliveryEnabled') === 'true',
        minAmount: parseFloat(formData.get('cardOnDeliveryMinAmount') as string) || 0,
        maxAmount: parseFloat(formData.get('cardOnDeliveryMaxAmount') as string) || 100000
      },
      
      taxRate: parseFloat(formData.get('taxRate') as string) || 0,
      deliveryFee: parseFloat(formData.get('deliveryFee') as string) || 300,
      freeDeliveryThreshold: parseFloat(formData.get('freeDeliveryThreshold') as string) || 3000
    };
    
    // Обновляем настройки
    const updatedSettings = await PaymentSettings.findByIdAndUpdate(
      settings._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    revalidatePath('/admin/settings');
    
    return {
      success: true,
      settings: updatedSettings
    };
    
  } catch (error: any) {
    console.error('Ошибка при обновлении настроек платежей:', error);
    
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
      error: 'Ошибка при обновлении настроек платежей'
    };
  }
}

// Получение доступных способов оплаты
export async function getAvailablePaymentMethods(orderAmount: number) {
  try {
    await dbConnect();
    
    const settings = await PaymentSettings.getSettings();
    
    if (!settings.isEnabled) {
      return {
        success: false,
        error: 'Платежи временно недоступны'
      };
    }
    
    const availableMethods = [];
    
    // Проверяем Stripe
    if (settings.stripe.enabled && settings.stripe.publishableKey) {
      availableMethods.push({
        id: 'stripe',
        name: 'Банковская карта (онлайн)',
        description: 'Оплата картой через Stripe',
        icon: '💳'
      });
    }
    
    // Проверяем ЮKassa
    if (settings.yookassa.enabled && settings.yookassa.shopId) {
      availableMethods.push({
        id: 'yookassa',
        name: 'ЮKassa',
        description: 'Оплата через ЮKassa',
        icon: '🏦'
      });
    }
    
    // Проверяем Сбербанк
    if (settings.sberbank.enabled && settings.sberbank.merchantId) {
      availableMethods.push({
        id: 'sberbank',
        name: 'Сбербанк Онлайн',
        description: 'Оплата через Сбербанк',
        icon: '🟢'
      });
    }
    
    // Проверяем наличные при доставке
    if (settings.cashOnDelivery.enabled) {
      if (orderAmount >= settings.cashOnDelivery.minAmount && 
          orderAmount <= settings.cashOnDelivery.maxAmount) {
        availableMethods.push({
          id: 'cash',
          name: 'Наличные при доставке',
          description: 'Оплата наличными курьеру',
          icon: '💰'
        });
      }
    }
    
    // Проверяем карту при доставке
    if (settings.cardOnDelivery.enabled) {
      if (orderAmount >= settings.cardOnDelivery.minAmount && 
          orderAmount <= settings.cardOnDelivery.maxAmount) {
        availableMethods.push({
          id: 'card',
          name: 'Карта при доставке',
          description: 'Оплата картой курьеру',
          icon: '💳'
        });
      }
    }
    
    return {
      success: true,
      methods: availableMethods,
      currency: settings.currency,
      deliveryFee: settings.deliveryFee,
      freeDeliveryThreshold: settings.freeDeliveryThreshold
    };
    
  } catch (error: any) {
    console.error('Ошибка при получении способов оплаты:', error);
    return {
      success: false,
      error: 'Ошибка при получении способов оплаты'
    };
  }
}

// Обработка платежа
export async function processPayment(orderId: string, paymentMethod: string, paymentData?: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        paymentMethod,
        paymentData
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Ошибка при обработке платежа'
      };
    }

    const result = await response.json();
    
    revalidatePath('/admin/orders');
    
    return {
      success: true,
      ...result
    };

  } catch (error: any) {
    console.error('Ошибка при обработке платежа:', error);
    return {
      success: false,
      error: 'Ошибка при обработке платежа'
    };
  }
} 
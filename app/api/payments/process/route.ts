import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentSettings from '@/models/PaymentSettings';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

// POST запрос для обработки платежа
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { orderId, paymentMethod, paymentData } = body;
    
    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { error: 'ID заказа и способ оплаты обязательны' },
        { status: 400 }
      );
    }
    
    // Получаем заказ
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
    // Получаем настройки платежей
    const settings = await PaymentSettings.getSettings();
    
    if (!settings.isEnabled) {
      return NextResponse.json(
        { error: 'Платежи временно недоступны' },
        { status: 503 }
      );
    }
    
    let paymentResult;
    
    // Обрабатываем платеж в зависимости от метода
    switch (paymentMethod) {
      case 'stripe':
        paymentResult = await processStripePayment(order, paymentData, settings);
        break;
        
      case 'yookassa':
        paymentResult = await processYookassaPayment(order, paymentData, settings);
        break;
        
      case 'sberbank':
        paymentResult = await processSberbankPayment(order, paymentData, settings);
        break;
        
      case 'cash':
        paymentResult = await processCashPayment(order, settings);
        break;
        
      case 'card':
        paymentResult = await processCardPayment(order, settings);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Неподдерживаемый способ оплаты' },
          { status: 400 }
        );
    }
    
    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error },
        { status: 400 }
      );
    }
    
    // Обновляем статус заказа
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: paymentResult.paymentStatus,
      status: paymentResult.orderStatus
    });
    
    return NextResponse.json({
      success: true,
      paymentId: paymentResult.paymentId,
      status: paymentResult.paymentStatus,
      message: paymentResult.message
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Ошибка при обработке платежа:', error);
    return NextResponse.json(
      { error: 'Ошибка при обработке платежа', details: error.message },
      { status: 500 }
    );
  }
}

// Заглушка для Stripe
async function processStripePayment(order: any, paymentData: any, settings: any) {
  if (!settings.stripe.enabled) {
    return {
      success: false,
      error: 'Stripe не настроен'
    };
  }
  
  // Здесь будет реальная интеграция со Stripe
  // Пока возвращаем заглушку
  return {
    success: true,
    paymentId: `stripe_${Date.now()}`,
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    message: 'Платеж успешно обработан (тестовый режим)'
  };
}

// Заглушка для ЮKassa
async function processYookassaPayment(order: any, paymentData: any, settings: any) {
  if (!settings.yookassa.enabled) {
    return {
      success: false,
      error: 'ЮKassa не настроен'
    };
  }
  
  // Здесь будет реальная интеграция с ЮKassa
  return {
    success: true,
    paymentId: `yookassa_${Date.now()}`,
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    message: 'Платеж успешно обработан (тестовый режим)'
  };
}

// Заглушка для Сбербанка
async function processSberbankPayment(order: any, paymentData: any, settings: any) {
  if (!settings.sberbank.enabled) {
    return {
      success: false,
      error: 'Сбербанк не настроен'
    };
  }
  
  // Здесь будет реальная интеграция со Сбербан��ом
  return {
    success: true,
    paymentId: `sberbank_${Date.now()}`,
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    message: 'Платеж успешно обработан (тестовый режим)'
  };
}

// Обработка наличных при доставке
async function processCashPayment(order: any, settings: any) {
  if (!settings.cashOnDelivery.enabled) {
    return {
      success: false,
      error: 'Оплата наличными при доставке недоступна'
    };
  }
  
  if (order.totalAmount < settings.cashOnDelivery.minAmount) {
    return {
      success: false,
      error: `Минимальная сумма для оплаты наличными: ${settings.cashOnDelivery.minAmount} ${settings.currency}`
    };
  }
  
  if (order.totalAmount > settings.cashOnDelivery.maxAmount) {
    return {
      success: false,
      error: `Максимальная сумма для оплаты наличными: ${settings.cashOnDelivery.maxAmount} ${settings.currency}`
    };
  }
  
  return {
    success: true,
    paymentId: `cash_${Date.now()}`,
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    message: 'Заказ подтвержден. Оплата при доставке.'
  };
}

// Обработка карты при доставке
async function processCardPayment(order: any, settings: any) {
  if (!settings.cardOnDelivery.enabled) {
    return {
      success: false,
      error: 'Оплата картой при доставке недоступна'
    };
  }
  
  if (order.totalAmount < settings.cardOnDelivery.minAmount) {
    return {
      success: false,
      error: `Минимальная сумма для оплаты картой: ${settings.cardOnDelivery.minAmount} ${settings.currency}`
    };
  }
  
  if (order.totalAmount > settings.cardOnDelivery.maxAmount) {
    return {
      success: false,
      error: `Максимальная сумма для оплаты картой: ${settings.cardOnDelivery.maxAmount} ${settings.currency}`
    };
  }
  
  return {
    success: true,
    paymentId: `card_${Date.now()}`,
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    message: 'Заказ подтвержден. Оплата картой при доставке.'
  };
} 
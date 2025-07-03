'use client'

import CartItemSection from "./components/widget/CartItemSection";
import OrderForm from "./components/widget/OrderForm";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";

export default function Cart() {
    const { cartItems, clearCart } = useCart();
    const [showOrderForm, setShowOrderForm] = useState(false);

    useEffect(() => {
        // Добавляем стили в документ
        const style = document.createElement('style');
        style.textContent = scrollbarStyles;
        document.head.appendChild(style);

        // Очистка при размонтировании компонента
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 mt-[80px] md:mt-[140px] mb-20 md:mb-40">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center opacity-0 animate-fadeIn">Ваша корзина</h1>
            <div className="flex flex-col lg:flex-row w-full gap-6 md:gap-70 min-h-[400px] h-full">
                <div className="cart-items w-full lg:w-3/5 max-h-[calc(100vh-300px)] md:h-[calc(100vh-200px)] overflow-y-auto pr-2 min-h-[340px] h-full flex flex-col">
                    <CartItemSection />
                </div>
                <div className="w-full lg:w-2/5 flex flex-col lg:min-h-[340px] lg:h-full">
                    {/* Мобильные и планшеты: кнопка и модалка */}
                    <div className="block lg:hidden">
                        {!showOrderForm && (
                            <button
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                                onClick={() => setShowOrderForm(true)}
                            >
                                Заказать
                            </button>
                        )}
                        {showOrderForm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="relative bg-[#FFF8F8] p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto animate-fadeIn">
                                    <button
                                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                                        onClick={() => setShowOrderForm(false)}
                                        aria-label="Закрыть"
                                    >×</button>
                                    <OrderForm />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Десктоп: форма всегда видна */}
                    <div className="hidden lg:block">
                        <OrderForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

/* Кастомные стили для скроллбара */
const scrollbarStyles = `
  .cart-items::-webkit-scrollbar {
    width: 6px;
  }
  
  .cart-items::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  .cart-items::-webkit-scrollbar-thumb {
    background: #FFDADA;
    border-radius: 10px;
  }
  
  .cart-items::-webkit-scrollbar-thumb:hover {
    background: #FFB6B6;
  }
`;

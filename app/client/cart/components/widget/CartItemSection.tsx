'use client'

import React, { useState, useEffect, useMemo } from "react";
import CartItem from "../element/CartItem";
import CartItemSkeleton from "../element/CartItemSkeleton";
import { useCart } from "../../../../context/CartContext";
import { products } from "../../../../data/products";

const CartItemSection = () => {
    const { cartItems, clearCart } = useCart();
    console.log('CART ITEMS DEBUG:', cartItems);
    const [loading, setLoading] = useState(true);
    const [displayedItems, setDisplayedItems] = useState<typeof cartItems>([]);
    
    // Используем useEffect только для загрузки данных
    useEffect(() => {
        // Имитируем небольшую задержку загрузки для плавной анимации
        const timer = setTimeout(() => {
            setDisplayedItems(cartItems);
            setLoading(false);
        }); // Небольшая задержка для плавной анимации
        
        return () => clearTimeout(timer);
    }, [cartItems]);
    
    // Мемоизируем скелетоны для предотвращения ненужных ререндеров
    const skeletons = useMemo(() => (
        <div className="grid gap-4 pb-4">
            <div className="bg-[#FFE9E9] rounded-[15px] p-3 shadow-sm">
                <h2 className="text-lg font-bold mb-3">Загрузка корзины...</h2>
                <div className="grid gap-3">
                    {Array(3).fill(0).map((_, index) => (
                        <CartItemSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    ), []);
    
    // Мемоизируем сообщение о пустой корзине
    const emptyCart = useMemo(() => (
        <div className="grid gap-4 pb-4">
            <div className="bg-[#FFE9E9] rounded-[15px] p-8 shadow-sm text-center">
                <h2 className="text-lg font-bold mb-3">Ваша корзина пуста</h2>
                <p className="text-gray-700">Добавьте товары в корзину, чтобы оформить заказ</p>
            </div>
        </div>
    ), []);
    
    // Мемоизируем список товаров
    const itemsList = useMemo(() => (
        <div className="grid gap-4 pb-4">
            <div className="bg-[#FFE9E9] rounded-[15px] p-3 shadow-sm">
                <h2 className="text-lg font-bold mb-3">Товары в корзине</h2>
                <div className="grid gap-3">
                    {displayedItems.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="opacity-0 animate-fadeIn"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CartItem item={item} />
                        </div>
                    ))}
                </div>
                {/* Кнопка очистки корзины */}
                <button
                  onClick={clearCart}
                  className="mt-6 w-full bg-[#FFB6B6] text-white font-bold py-3 px-4 rounded-[15px] hover:bg-[#ff9e9e] transition-colors duration-300 text-base sm:text-lg shadow-md"
                >
                  Очистить корзину
                </button>
            </div>
        </div>
    ), [displayedItems, clearCart]);
    
    if (loading) {
        return skeletons;
    }
    if (displayedItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[120px] w-full">
                <div className="bg-[#FFE9E9] rounded-[15px] p-8 shadow-sm text-center w-full">
                    <h2 className="text-lg sm:text-xl font-bold mb-3">Ваша корзина пуста</h2>
                    <p className="text-gray-700">Добавьте товары в корзину, чтобы оформить заказ</p>
                </div>
            </div>
        );
    }
    
    return itemsList;
};

export default React.memo(CartItemSection);

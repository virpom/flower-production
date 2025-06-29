'use client'

import { useState, useEffect } from "react";
import ShopItem from "../element/ShopItem";
import ShopItemSkeleton from "../element/ShopItemSkeleton";
import { IProduct } from "@/client/models/Product";

const useProducts = ({ categoryId, subcategoryId }: { categoryId?: string, subcategoryId?: string }) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const query = new URLSearchParams();
      if (categoryId) query.set('categoryId', categoryId);
      if (subcategoryId) query.set('subcategoryId', subcategoryId);
      
      const res = await fetch(`/api/products?${query.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    
    fetchProducts();
  }, [categoryId, subcategoryId]);

  return { loading, products };
};

export default function Catalog({ categoryId, subcategoryId, title }: { categoryId?: string, subcategoryId?: string, title?: string }) {
  const { loading, products } = useProducts({ categoryId, subcategoryId });
    
  // Функция определения направления анимации
  const getAnimationClass = (index: number, itemsPerRow: number = 4) => {
    const rowPosition = index % itemsPerRow;
    return rowPosition < itemsPerRow / 2 ? 'animate-slide-in-left' : 'animate-slide-in-right';
  };
  
  // Функция для задержки анимации в зависимости от позиции
  const getAnimationDelay = (index: number) => {
    return `${(index % 4) * 0.05}s`; // Уменьшаем задержку между элементами
  };
    
  if (loading || !products.length) {
    return (
      <div className="flex flex-col items-center my-4 sm:my-10">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center px-4">{title}</h1>
          )}
          <div className="w-full max-w-7xl mb-4 sm:mb-8 px-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-30">
              {Array(8).fill(0).map((_, index) => (
                <ShopItemSkeleton key={index} />
              ))}
            </div>
          </div>
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="flex justify-center my-4 sm:my-10 px-4">
        <div className="text-center p-6 sm:p-8 bg-[#FFE1E1] rounded-[20px] shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Товары не найдены</h2>
          <p className="text-gray-700">К сожалению, товары в данной категории отсутствуют.</p>
        </div>
      </div>
    );
  }
    
  return (
    <div className="flex flex-col items-center my-4 sm:my-10">
        {title && (
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center px-4">{title}</h1>
        )}
        
        <div className="w-full max-w-7xl mb-4 sm:mb-8 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-30">
            {products.map((product, index) => {
              const id = typeof product._id === 'string' ? product._id : String(product._id);
              return (
                <div 
                  key={id}
                  className={`opacity-0 ${getAnimationClass(index, window.innerWidth < 640 ? 2 : 4)}`}
                  style={{ animationDelay: getAnimationDelay(index) }}
                >
                  <ShopItem 
                    id={id}
                    title={product.name}
                    price={product.price}
                    description={product.description}
                    imageSrc={product.image}
                    inStock={product.inStock}
                  />
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
}

'use client'

import Link from "next/link";
import ShopItem from "../element/ShopItem";
import ShopItemSkeleton from "../element/ShopItemSkeleton";
import { useState, useEffect } from "react";
import { IProduct } from "@/client/models/Product";

async function getAllProducts(): Promise<IProduct[]> {
  try {
    const res = await fetch(`/api/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default function HomeCatalog() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchData();
  }, []);
  
  // Функция определения направления анимации
  const getAnimationClass = (index: number, itemsPerRow: number = 4) => {
    const rowPosition = index % itemsPerRow;
    return rowPosition < itemsPerRow / 2 ? 'animate-slide-in-left' : 'animate-slide-in-right';
  };
  
  // Функция для задержки анимации в зависимости от позиции
  const getAnimationDelay = (index: number) => {
    return `${(index % 4) * 0.1}s`;
  };

  return (
    <div className="flex flex-col items-center my-4 sm:my-10 px-4 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center">Наша коллекция</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 xl:gap-12">
          {Array(8).fill(0).map((_, index) => <ShopItemSkeleton key={index} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 xl:gap-12">
          {products.map((product, index) => (
            <div key={product._id?.toString() || index} /* ... animation ... */>
              <ShopItem 
                id={String(product._id)}
                title={product.name}
                price={product.price}
                description={product.description}
                imageSrc={product.image}
                inStock={product.inStock}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
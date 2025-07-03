'use client'

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
// import { categories, Category, Subcategory } from "../../../../data/products";

interface Subcategory {
  _id?: string;
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

interface Category {
  _id?: string;
  id: number;
  name: string;
  slug: string;
  image?: string;
  subcategories: Subcategory[];
}

function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setCategories(data) : setCategories([]));
  }, []);
  return categories;
}

// Компонент для иконки стрелки
function ArrowDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`inline-block ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

// Компонент для отдельной ссылки навигации с дропдауном
function NavItem({ category }: { category: Category }) {
  const [isOpen, setIsOpen] = useState(false);
  const navItemRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Обработка событий мыши для всего компонента
  const handleMouseOver = (event: React.MouseEvent) => {
    // Проверяем, находится ли курсор над NavItem или его дропдауном
    if (navItemRef.current?.contains(event.target as Node) || 
        dropdownRef.current?.contains(event.target as Node)) {
      setIsOpen(true);
    }
  };
  
  // Обработка ухода мыши
  const handleMouseLeave = (event: React.MouseEvent) => {
    try {
      // Проверяем, что relatedTarget не null и что мышь действительно покинула всю область
      const relatedTarget = event.relatedTarget as Node | null;
      
      if (!relatedTarget || 
          (!navItemRef.current?.contains(relatedTarget) && 
           !dropdownRef.current?.contains(relatedTarget))) {
        setIsOpen(false);
      }
    } catch (error) {
      // В случае любой ошибки с relatedTarget, просто закрываем меню
      setIsOpen(false);
    }
  };
  
  // Глобальный обработчик движения мыши
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      try {
        const target = event.target as Node | null;
        
        if (!target) return;
        
        // Если мышь над элементом или его выпадающим списком - показываем список
        if (navItemRef.current?.contains(target) || 
            dropdownRef.current?.contains(target)) {
          setIsOpen(true);
        } 
        // Если мышь не над элементом и не над выпадающим списком - скрываем список
        else if (isOpen && 
                !navItemRef.current?.contains(target) && 
                !dropdownRef.current?.contains(target)) {
          setIsOpen(false);
        }
      } catch (error) {
        // В случае ошибки, закрываем меню
        if (isOpen) setIsOpen(false);
      }
    };
    
    // Добавляем обработчик на document
    document.addEventListener('mouseover', handleGlobalMouseMove);
    
    // Очистка при размонтировании
    return () => {
      document.removeEventListener('mouseover', handleGlobalMouseMove);
    };
  }, [isOpen]);
  
  return (
    <div 
      ref={navItemRef}
      className="relative md:flex md:justify-center md:items-center"
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center cursor-pointer">
        <Link 
          href={`/category/${category.slug}`} 
          className="font-semibold duration-300 hover:text-[#FF6B6B] text-[20px] block"
        >
          {category.name}
        </Link>
        <ArrowDownIcon isOpen={isOpen} />
      </div>
      
      {isOpen && category.subcategories && (
        <div 
          ref={dropdownRef}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 py-2 w-48 bg-white rounded-[20px] shadow-lg z-10 animate-fadeIn border border-[#FFE1E1]"
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <div className="absolute h-3 w-full top-[-12px]"></div> {/* Невидимая область для плавного перехода курсора */}
          {category.subcategories.map((subcategory: Subcategory, index: number) => (
            <Link 
              key={subcategory._id || subcategory.id || index} 
              href={`/category/${category.slug}/${subcategory.slug}`}
              className={`block px-4 py-2 text-[16px] hover:bg-[#FFE1E1] hover:font-medium transition-all duration-300 ${
                index === 0 ? 'rounded-t-[16px]' : ''
              } ${
                index === category.subcategories.length - 1 ? 'rounded-b-[16px]' : ''
              }`}
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Nav() {
  const categories = useCategories();
  const colCount = categories.length || 1;
  return (
    <nav className="flex flex-row gap-6 justify-center items-center px-4 min-h-[48px] w-full max-w-screen-md mx-auto">
      {categories.map((category) => (
        <NavItem key={category._id || category.id} category={category} />
      ))}
    </nav>
  );
}
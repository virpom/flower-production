'use client'

import { useParams, notFound } from 'next/navigation';
import Catalog from '../../client/components/catalog/Catalog';
import { useState, useEffect } from 'react';
import { IProduct } from '@/client/models/Product';

async function getProducts(categoryId: string, subcategoryId?: string): Promise<IProduct[]> {
  try {
    const query = subcategoryId
      ? `subcategoryId=${subcategoryId}`
      : `categoryId=${categoryId}`;

    const url = `/api/products?${query}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Failed to fetch products. Status: ${res.status}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data.products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const catRes = await fetch(`/api/categories?slug=${slug}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData) {
            setCategory(catData);
            const productsData = await getProducts(catData._id);
            setProducts(productsData);
          } else {
            setCategory(null);
          }
        }
      } catch (e) {
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAndSetData();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center p-10">Загрузка...</div>;
  }
  
  if (!category) {
    return notFound();
  }
  
  return (
    <div className="mt-40">
      <div className="max-w-screen-xl mx-auto px-4 pb-12">
        <Catalog 
          title={`Все товары в категории ${category.name}`} 
          categoryId={category._id}
        />
      </div>
    </div>
  );
} 
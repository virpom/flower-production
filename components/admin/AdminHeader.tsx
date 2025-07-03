'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        // Очистка localStorage или sessionStorage, если используется
        // localStorage.removeItem('user-token');
        router.push('/auth/login');
      } else {
        console.error('Logout failed');
        // Можно показать уведомление об ошибке
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <div>
        {/* Можно добавить хлебные крошки или заголовок страницы */}
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Админ-панель</h1>
      </div>
      <div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
        >
          {isLoggingOut ? 'Выход...' : 'Выйти'}
        </button>
      </div>
    </header>
  );
} 
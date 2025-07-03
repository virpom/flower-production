'use client';

import { useState, useEffect, useCallback } from 'react';

// A single reusable component for inline editing
const EditableName = ({ name, onSave, onCancel }) => {
  const [editingName, setEditingName] = useState(name);

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={editingName}
        onChange={(e) => setEditingName(e.target.value)}
        className="p-1 border rounded"
        autoFocus
      />
      <button onClick={() => onSave(editingName)} className="text-green-600">Сохранить</button>
      <button onClick={onCancel} className="text-gray-500">Отмена</button>
    </div>
  );
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for forms and editing
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Не удалось загрузить категории');
      setCategories(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleApiCall = async (url, method, body = null) => {
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
      const res = await fetch(url, options);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Ошибка: ${res.status}`);
      }
      fetchCategories();
      setEditingId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (categories.length >= 5) return;
    if (newCategoryName) {
      handleApiCall('/api/categories', 'POST', { name: newCategoryName });
      setNewCategoryName('');
    }
  };
  
  const handleAddSubcategory = (e) => {
    e.preventDefault();
    if (newSubcategoryName && selectedCategoryId) {
      handleApiCall('/api/subcategories', 'POST', { name: newSubcategoryName, categoryId: selectedCategoryId });
      setNewSubcategoryName('');
    }
  };

  const handleUpdate = (type: 'category' | 'subcategory', id: string, name: string) => {
    handleApiCall(`/api/${type === 'category' ? 'categories' : 'subcategories'}/${id}`, 'PUT', { name });
  };

  const handleDelete = (type: 'category' | 'subcategory', id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
      handleApiCall(`/api/${type === 'category' ? 'categories' : 'subcategories'}/${id}`, 'DELETE');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="text-red-500">Ошибка: {error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Управление категориями</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Добавить новую категорию</h2>
          {categories.length >= 5 && (
            <div className="mb-2 text-red-500 font-semibold">Максимальное количество категорий — 5. Удалите одну, чтобы добавить новую.</div>
          )}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Название категории" className="flex-grow p-2 border rounded" disabled={categories.length >= 5}/>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600" disabled={categories.length >= 5}>Добавить</button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Добавить новую подкатегорию</h2>
          <form onSubmit={handleAddSubcategory} className="space-y-4">
            <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full p-2 border rounded" required>
              <option value="">Выберите категорию</option>
              {categories.map((cat: any) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
            <input type="text" value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} placeholder="Название подкатегории" className="w-full p-2 border rounded" />
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Добавить подкатегорию</button>
          </form>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Список категорий</h2>
        <div className="space-y-4">
          {categories.map((cat: any) => (
            <div key={cat._id} className="p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center">
                {editingId === cat._id ? (
                  <EditableName name={cat.name} onSave={(name) => handleUpdate('category', cat._id, name)} onCancel={() => setEditingId(null)} />
                ) : (
                  <h3 className="font-bold text-lg">{cat.name}</h3>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(cat._id)} className="text-blue-500 hover:underline">Редактировать</button>
                  <button onClick={() => handleDelete('category', cat._id)} className="text-red-500 hover:underline">Удалить</button>
                </div>
              </div>
              <ul className="list-disc pl-8 mt-2 space-y-2">
                {Array.isArray(cat.subcategories) && cat.subcategories.map((sub: any) => (
                  <li key={sub._id} className="flex justify-between items-center">
                    {editingId === sub._id ? (
                      <EditableName name={sub.name} onSave={(name) => handleUpdate('subcategory', sub._id, name)} onCancel={() => setEditingId(null)} />
                    ) : (
                      <span>{sub.name}</span>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(sub._id)} className="text-blue-500 hover:underline text-sm">Редактировать</button>
                      <button onClick={() => handleDelete('subcategory', sub._id)} className="text-red-500 hover:underline text-sm">Удалить</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 
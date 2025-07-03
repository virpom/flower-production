"use client";
import React, { useState } from "react";
import { mockCategories } from "./mockCategories";

const emptyCategory = { id: null, name: "", subcategories: [] };
const emptySubcategory = { id: null, name: "" };

export default function CategoriesList() {
  const [categories, setCategories] = useState(mockCategories);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [editSub, setEditSub] = useState({ catId: null, subId: null });
  const [catForm, setCatForm] = useState(emptyCategory);
  const [subForm, setSubForm] = useState(emptySubcategory);
  const [parentCatId, setParentCatId] = useState(null);
  const [message, setMessage] = useState("");

  // Открыть форму для добавления категории
  const handleAddCat = () => {
    setCatForm(emptyCategory);
    setEditCatId(null);
    setShowCatForm(true);
  };

  // Открыть форму для редактирования категории
  const handleEditCat = (cat) => {
    setCatForm({ ...cat, subcategories: [] });
    setEditCatId(cat.id);
    setShowCatForm(true);
  };

  // Удалить категорию
  const handleDeleteCat = (id) => {
    setCategories(categories.filter(c => c.id !== id));
    setMessage("Категория удалена");
  };

  // Сохранить категорию
  const handleSaveCat = (e) => {
    e.preventDefault();
    if (!catForm.name) {
      setMessage("Введите название категории");
      return;
    }
    if (editCatId) {
      setCategories(categories.map(c => c.id === editCatId ? { ...c, name: catForm.name } : c));
      setMessage("Категория обновлена");
    } else {
      const newId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
      setCategories([...categories, { id: newId, name: catForm.name, subcategories: [] }]);
      setMessage("Категория добавлена");
    }
    setShowCatForm(false);
  };

  // Открыть форму для добавления подкатегории
  const handleAddSub = (catId) => {
    setSubForm(emptySubcategory);
    setEditSub({ catId, subId: null });
    setParentCatId(catId);
    setShowSubForm(true);
  };

  // Открыть форму для редактирования подкатегории
  const handleEditSub = (catId, sub) => {
    setSubForm({ ...sub });
    setEditSub({ catId, subId: sub.id });
    setParentCatId(catId);
    setShowSubForm(true);
  };

  // Удалить подкатегорию
  const handleDeleteSub = (catId, subId) => {
    setCategories(categories.map(cat =>
      cat.id === catId
        ? { ...cat, subcategories: cat.subcategories.filter(s => s.id !== subId) }
        : cat
    ));
    setMessage("Подкатегория удалена");
  };

  // Сохранить подкатегорию
  const handleSaveSub = (e) => {
    e.preventDefault();
    if (!subForm.name) {
      setMessage("Введите название подкатегории");
      return;
    }
    setCategories(categories.map(cat => {
      if (cat.id !== parentCatId) return cat;
      if (editSub.subId) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(s => s.id === editSub.subId ? { ...s, name: subForm.name } : s)
        };
      } else {
        const newId = cat.subcategories.length ? Math.max(...cat.subcategories.map(s => s.id)) + 1 : 1;
        return {
          ...cat,
          subcategories: [...cat.subcategories, { id: newId, name: subForm.name }]
        };
      }
    }));
    setShowSubForm(false);
    setMessage(editSub.subId ? "Подкатегория обновлена" : "Подкатегория добавлена");
  };

  // Обработка изменений в формах
  const handleCatChange = (e) => setCatForm(f => ({ ...f, name: e.target.value }));
  const handleSubChange = (e) => setSubForm(f => ({ ...f, name: e.target.value }));

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl max-w-4xl mx-auto border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">Управление категориями</h2>
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors duration-200 font-medium"
          onClick={handleAddCat}
        >Добавить категорию</button>
      </div>
      {message && (
        <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-lg shadow-sm border border-green-200 transition-all duration-300">{message}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-0 divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="p-3 rounded-l-xl text-center">Категория</th>
              <th className="p-3 text-center">Подкатегории</th>
              <th className="p-3 rounded-r-xl text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="bg-white hover:shadow-md transition-shadow duration-200 border-b border-gray-200">
                <td className="p-3 font-semibold text-gray-800 align-top w-1/4 text-center border-r border-gray-100">{cat.name}</td>
                <td className="p-3 text-gray-700 border-r border-gray-100">
                  <ul className="mb-2 divide-y divide-gray-100">
                    {cat.subcategories.map(sub => (
                      <li key={sub.id} className="flex flex-row items-center justify-between gap-2 py-1">
                        <span className="flex-1">{sub.name}</span>
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-0.5 bg-yellow-400 hover:bg-yellow-500 text-white rounded text-xs flex items-center justify-center"
                            onClick={() => handleEditSub(cat.id, sub)}
                          >Редактировать</button>
                          <button
                            className="px-2 py-0.5 bg-red-400 hover:bg-red-500 text-white rounded text-xs flex items-center justify-center"
                            onClick={() => handleDeleteSub(cat.id, sub.id)}
                          >Удалить</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center">
                    <button
                      className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-white rounded text-xs"
                      onClick={() => handleAddSub(cat.id)}
                    >Добавить подкатегорию</button>
                  </div>
                </td>
                <td className="p-3 align-top w-1/4">
                  <div className="flex flex-col gap-2 items-center justify-center h-full min-h-[60px]">
                    <button
                      className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg shadow text-sm font-medium w-32"
                      onClick={() => handleEditCat(cat)}
                    >Редактировать</button>
                    <div className="w-full h-px bg-gray-200 my-1" />
                    <button
                      className="px-3 py-1 bg-red-400 hover:bg-red-500 text-white rounded-lg shadow text-sm font-medium w-32"
                      onClick={() => handleDeleteCat(cat.id)}
                    >Удалить</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Форма категории */}
      {showCatForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-all">
          <form
            className="bg-white p-8 rounded-2xl shadow-2xl min-w-[320px] max-w-md w-full border border-gray-200 relative animate-fadeIn"
            onSubmit={handleSaveCat}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
              onClick={() => setShowCatForm(false)}
              aria-label="Закрыть"
            >×</button>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{editCatId ? "Редактировать категорию" : "Добавить категорию"}</h3>
            <div className="mb-6">
              <label className="block mb-1 font-medium text-gray-700">Название категории</label>
              <input
                type="text"
                value={catForm.name}
                onChange={handleCatChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors duration-200 font-medium"
            >Сохранить</button>
          </form>
        </div>
      )}
      {/* Форма подкатегории */}
      {showSubForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-all">
          <form
            className="bg-white p-8 rounded-2xl shadow-2xl min-w-[320px] max-w-md w-full border border-gray-200 relative animate-fadeIn"
            onSubmit={handleSaveSub}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
              onClick={() => setShowSubForm(false)}
              aria-label="Закрыть"
            >×</button>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{editSub.subId ? "Редактировать подкатегорию" : "Добавить подкатегорию"}</h3>
            <div className="mb-6">
              <label className="block mb-1 font-medium text-gray-700">Название подкатегории</label>
              <input
                type="text"
                value={subForm.name}
                onChange={handleSubChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors duration-200 font-medium"
            >Сохранить</button>
          </form>
        </div>
      )}
    </div>
  );
} 
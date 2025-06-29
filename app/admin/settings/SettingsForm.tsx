"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// Гарантирует, что все поля формы имеют определенное значение (хотя бы пустую строку)
const getInitialFormState = (settings) => ({
  address: settings?.address ?? '',
  contactPhone: settings?.contactPhone ?? '',
  workingHours: settings?.workingHours ?? '',
  instagram: settings?.socialLinks?.instagram ?? '',
  vk: settings?.socialLinks?.vk ?? '',
  telegram: settings?.socialLinks?.telegram ?? '',
  whatsapp: settings?.socialLinks?.whatsapp ?? '',
});

export default function SettingsForm({ initialSettings }) {
  const [form, setForm] = useState(getInitialFormState(initialSettings));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setForm(getInitialFormState(initialSettings));
  }, [initialSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    // Собираем данные для отправки, включая вложенный объект socialLinks
    const dataToSend = {
      address: form.address,
      contactPhone: form.contactPhone,
      workingHours: form.workingHours,
      socialLinks: {
        instagram: form.instagram,
        vk: form.vk,
        telegram: form.telegram,
        whatsapp: form.whatsapp,
      }
    };

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось сохранить настройки');
      }
      toast.success("Настройки успешно сохранены!");
      router.refresh();

    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-8">Настройки магазина</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Адрес магазина</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Телефон</label>
          <input
            type="text"
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Часы работы</label>
          <input
            type="text"
            name="workingHours"
            value={form.workingHours}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Instagram</label>
          <input
            type="text"
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">ВКонтакте</label>
          <input
            type="text"
            name="vk"
            value={form.vk}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Telegram</label>
          <input
            type="text"
            name="telegram"
            value={form.telegram}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">WhatsApp</label>
          <input
            type="text"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors duration-200 font-medium disabled:bg-gray-400"
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
} 
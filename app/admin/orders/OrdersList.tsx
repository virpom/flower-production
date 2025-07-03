"use client";
import React, { useState } from "react";
import { format } from 'date-fns';

const statuses = {
  pending: "Ожидает",
  confirmed: "Подтвержден",
  preparing: "Готовится",
  delivering: "Доставляется",
  delivered: "Доставлен",
  cancelled: "Отменен",
};

export default function OrdersList({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Функции handleStatusChange и handleDelete пока будут работать локально.
  // В реальном приложении здесь должны быть API-запросы.
  const handleStatusChange = async (id, status) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders(orders.map(order => order._id === id ? { ...order, status } : order));
    }
  };
  const handleDelete = async (id) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': 'admin' },
    });
    if (res.ok) {
      setOrders(orders.filter(order => order._id !== id));
      if (selectedOrder && selectedOrder._id === id) setSelectedOrder(null);
    }
  };

  const handleShowDetails = (order) => setSelectedOrder(order);
  const handleCloseDetails = () => setSelectedOrder(null);

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl max-w-7xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold mb-8 tracking-tight text-gray-800">Все заказы</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '0 0.5rem' }}>
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="p-3 rounded-l-xl">Номер</th>
              <th className="p-3">Клиент</th>
              <th className="p-3">Телефон</th>
              <th className="p-3">Товары</th>
              <th className="p-3">Получение</th>
              <th className="p-3">Сумма</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Дата</th>
              <th className="p-3 rounded-r-xl">Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-b">
                <td className="p-3 font-semibold text-center text-gray-700">{order.orderNumber}</td>
                <td className="p-3 text-gray-800">{order.customer.name}</td>
                <td className="p-3 text-gray-600">{order.customer.phone}</td>
                <td className="p-3 text-gray-600">
                  {order.items.map((item, idx) => (
                    <span key={item._id || idx}>{item.name} <span className="text-gray-400">x{item.quantity}</span>{idx < order.items.length - 1 ? ", " : ""}</span>
                  ))}
                </td>
                <td className="p-3 text-gray-600">
                  {(order.deliveryType === 'pickup' || order.customer?.address === 'Самовывоз') ? 'Самовывоз' : 'Доставка'}
                </td>
                <td className="p-3 font-bold text-blue-700">{order.totalAmount} ₽</td>
                <td className="p-3">
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order._id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    {Object.entries(statuses).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-gray-500">{format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</td>
                <td className="p-3 flex gap-2 justify-center">
                  <button onClick={() => handleShowDetails(order)} className="...">Детали</button>
                  <button onClick={() => handleDelete(order._id)} className="...">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-all">
          <div className="bg-white p-8 rounded-2xl shadow-2xl min-w-[340px] max-w-md w-full border border-gray-200 relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
              onClick={handleCloseDetails}
              aria-label="Закрыть"
            >×</button>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Детали заказа #{selectedOrder._id}</h3>
            <div className="mb-2 text-gray-700"><b>Клиент:</b> {selectedOrder.customer.name}</div>
            <div className="mb-2 text-gray-700"><b>Товары:</b></div>
            <ul className="list-disc ml-6 mb-2 text-gray-600">
              {selectedOrder.items.map((item, idx) => (
                <li key={item._id || idx}>{item.name} <span className="text-gray-400">x{item.quantity}</span></li>
              ))}
            </ul>
            <div className="mb-2 text-gray-700"><b>Сумма:</b> <span className="font-bold text-blue-700">{selectedOrder.totalAmount} ₽</span></div>
            <div className="mb-2 text-gray-700"><b>Получение:</b> {(selectedOrder.deliveryType === 'pickup' || selectedOrder.customer?.address === 'Самовывоз') ? 'Самовывоз' : 'Доставка'}</div>
            <div className="mb-2 text-gray-700"><b>Статус:</b> {selectedOrder.status}</div>
            <div className="mb-2 text-gray-700"><b>Дата:</b> {format(new Date(selectedOrder.createdAt), 'dd.MM.yyyy HH:mm')}</div>
            <button
              className="mt-6 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow transition-colors duration-200 font-medium"
              onClick={handleCloseDetails}
            >Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
} 
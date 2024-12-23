'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatCurrency } from '@/app/lib/formatCurrency';

const debtSchema = z.object({
  debtorId: z.string().min(1, 'Debtor is required'),
  creditorId: z.string().min(1, 'Creditor is required'),
  menuItemId: z.string().min(1, 'Menu item is required'),
  quantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Quantity must be a positive number',
  }),
}).refine((data) => data.debtorId !== data.creditorId, {
  message: "Debtor and creditor can't be the same person",
  path: ['creditorId'],
});

type DebtFormData = z.infer<typeof debtSchema>;

interface User {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

export default function NewDebtPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
  });

  const quantity = watch('quantity');
  const menuItemId = watch('menuItemId');

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(res => res.json()),
      fetch('/api/menu-items').then(res => res.json())
    ])
      .then(([usersData, menuItemsData]) => {
        setUsers(usersData);
        setMenuItems(menuItemsData);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (menuItemId && quantity) {
      const menuItem = menuItems.find(item => item.id === parseInt(menuItemId));
      if (menuItem) {
        setSelectedMenuItem(menuItem);
        setCalculatedTotal(menuItem.price * parseInt(quantity));
      }
    } else {
      setCalculatedTotal(0);
    }
  }, [menuItemId, quantity, menuItems]);

  const onSubmit = async (data: DebtFormData) => {
    try {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debtorId: parseInt(data.debtorId),
          creditorId: parseInt(data.creditorId),
          menuItemId: parseInt(data.menuItemId),
          quantity: parseInt(data.quantity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create debt');
      }

      reset();
      setCalculatedTotal(0);
      setSelectedMenuItem(null);
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add New Debt</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="debtorId" className="block text-sm font-medium text-gray-600">
            Who owes the money? (Debtor)
          </label>
          <select
            {...register('debtorId')}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select debtor</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.debtorId && (
            <p className="mt-1 text-sm text-red-500">{errors.debtorId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="creditorId" className="block text-sm font-medium text-gray-600">
            Who paid? (Creditor)
          </label>
          <select
            {...register('creditorId')}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select creditor</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.creditorId && (
            <p className="mt-1 text-sm text-red-500">{errors.creditorId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="menuItemId" className="block text-sm font-medium text-gray-600">
            Menu Item
          </label>
          <select
            {...register('menuItemId')}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select menu item</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {formatCurrency(item.price)}
              </option>
            ))}
          </select>
          {errors.menuItemId && (
            <p className="mt-1 text-sm text-red-500">{errors.menuItemId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-600">
            Quantity
          </label>
          <input
            {...register('quantity')}
            type="number"
            min="1"
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
          )}
        </div>

        {calculatedTotal > 0 && (
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-lg font-medium text-blue-900">
              Total: {formatCurrency(calculatedTotal)}
            </p>
            {selectedMenuItem && (
              <p className="text-sm text-blue-700">
                {selectedMenuItem.name} x {quantity} @ {formatCurrency(selectedMenuItem.price)} each
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Add Debt
        </button>
      </form>
    </div>
  );
}
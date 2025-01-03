'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatCurrency } from '../../lib/formatCurrency';

const debtSchema = z.object({
  debtorId: z.string().min(1, 'Vui lòng chọn Con Nợ'),
  creditorId: z.string().min(1, 'Vui lòng chọn Chủ Nợ'),
  restaurantId: z.string().min(1, 'Vui lòng chọn nhà hàng'),
  menuItemId: z.string().min(1, 'Vui lòng chọn món ăn'),
  quantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Số lượng phải là số dương',
  }),
  customPrice: z.string().optional().refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0), {
    message: 'Giá tùy chỉnh phải là số không âm',
  }),
}).refine((data) => data.debtorId !== data.creditorId, {
  message: "Con Nợ và Chủ Nợ không thể là cùng một người",
  path: ['creditorId'],
});

type DebtFormData = z.infer<typeof debtSchema>;

interface User {
  id: number;
  name: string;
}

interface Restaurant {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  restaurantId: number;
}

export default function NewDebtPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
  });

  const quantity = watch('quantity');
  const menuItemId = watch('menuItemId');
  const restaurantId = watch('restaurantId');

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(res => res.json()),
      fetch('/api/restaurants').then(res => res.json()),
      fetch('/api/menu-items').then(res => res.json())
    ])
      .then(([usersData, restaurantsData, menuItemsData]) => {
        setUsers(usersData);
        setRestaurants(restaurantsData);
        setMenuItems(menuItemsData.menuItems);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (restaurantId) {
      const filtered = menuItems.filter(item => item.restaurantId === parseInt(restaurantId));
      setFilteredMenuItems(filtered);
    } else {
      setFilteredMenuItems([]);
    }
  }, [restaurantId, menuItems]);

  const customPrice = watch('customPrice');

  useEffect(() => {
    if (menuItemId && quantity) {
      const menuItem = menuItems.find(item => item.id === parseInt(menuItemId));
      if (menuItem) {
        setSelectedMenuItem(menuItem);
        const price = customPrice ? parseInt(customPrice) : menuItem.price;
        setCalculatedTotal(price * parseInt(quantity));
      }
    } else {
      setCalculatedTotal(0);
    }
  }, [menuItemId, quantity, menuItems, customPrice]);

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
          customPrice: data.customPrice ? parseInt(data.customPrice) : undefined,
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <div className="h-8 w-48 skeleton mb-6"></div>
        <div className="space-y-4">
          <div className="h-20 skeleton"></div>
          <div className="h-20 skeleton"></div>
          <div className="h-20 skeleton"></div>
          <div className="h-20 skeleton"></div>
          <div className="h-20 skeleton"></div>
          <div className="h-12 skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="card">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Thêm Khoản Nợ Mới</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="debtorId" className="block text-sm font-medium mb-1">
                  Ai là người nợ? (Con Nợ)
                </label>
                <select
                  {...register('debtorId')}
                  className="input"
                >
                  <option value="">Chọn Con Nợ</option>
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
                <label htmlFor="creditorId" className="block text-sm font-medium mb-1">
                  Ai là người cho vay? (Chủ Nợ)
                </label>
                <select
                  {...register('creditorId')}
                  className="input"
                >
                  <option value="">Chọn Chủ Nợ</option>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="restaurantId" className="block text-sm font-medium mb-1">
                  Nhà Hàng
                </label>
                <select
                  {...register('restaurantId')}
                  className="input"
                >
                  <option value="">Chọn nhà hàng</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                {errors.restaurantId && (
                  <p className="mt-1 text-sm text-red-500">{errors.restaurantId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="menuItemId" className="block text-sm font-medium mb-1">
                  Món Ăn
                </label>
                <select
                  {...register('menuItemId')}
                  className="input"
                  disabled={!restaurantId}
                >
                  <option value="">Chọn món ăn</option>
                  {filteredMenuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {formatCurrency(item.price)}
                    </option>
                  ))}
                </select>
                {errors.menuItemId && (
                  <p className="mt-1 text-sm text-red-500">{errors.menuItemId.message}</p>
                )}
                {!restaurantId && (
                  <p className="mt-1 text-sm text-muted-foreground">Vui lòng chọn nhà hàng trước</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                  Số Lượng
                </label>
                <input
                  {...register('quantity')}
                  type="number"
                  min="1"
                  className="input w-32"
                  placeholder="Nhập số lượng"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
                )}
              </div>

              {selectedMenuItem && (
                <div>
                  <label htmlFor="customPrice" className="block text-sm font-medium mb-1">
                    Giá Tùy Chỉnh (không bắt buộc)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      {...register('customPrice')}
                      type="number"
                      min="0"
                      className="input w-32"
                      placeholder={`${selectedMenuItem.price}`}
                    />
                    <span className="text-sm text-muted-foreground">
                      Mặc định: {formatCurrency(selectedMenuItem.price)}
                    </span>
                  </div>
                  {errors.customPrice && (
                    <p className="mt-1 text-sm text-red-500">{errors.customPrice.message}</p>
                  )}
                </div>
              )}
            </div>

            {calculatedTotal > 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-lg font-medium text-primary">
                  Tổng cộng: {formatCurrency(calculatedTotal)}
                </p>
                {selectedMenuItem && (
                  <p className="text-sm text-primary/80 mt-1">
                    {selectedMenuItem.name} x {quantity} @ {formatCurrency(selectedMenuItem.price)} mỗi món
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Thêm Khoản Nợ'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
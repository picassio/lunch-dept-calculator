'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatCurrency } from '../lib/formatCurrency';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a positive number',
  }),
  category: z.enum(['food', 'drink'], {
    required_error: 'Category is required',
  }),
  restaurantId: z.string().min(1, 'Restaurant is required'),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;
type Category = 'food' | 'drink';

interface Restaurant {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: Category;
  restaurantId: number;
  restaurant: Restaurant;
}

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (editingItem) {
      setValue('name', editingItem.name);
      setValue('price', editingItem.price.toString());
      setValue('category', editingItem.category as Category);
      setValue('restaurantId', editingItem.restaurantId.toString());
    } else {
      reset();
    }
  }, [editingItem, setValue, reset]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu-items');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data.menuItems);
      setRestaurants(data.restaurants);
    } catch {
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      const url = '/api/menu-items';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...data, id: editingItem.id } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingItem ? 'update' : 'create'} menu item`);
      }

      setEditingItem(null);
      reset();
      fetchMenuItems();
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`/api/menu-items?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete menu item');
      }

      fetchMenuItems();
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    reset();
    setError('');
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-40 skeleton mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 skeleton"></div>
          <div className="h-10 skeleton"></div>
          <div className="h-10 skeleton"></div>
          <div className="h-10 skeleton"></div>
          <div className="h-10 w-32 skeleton"></div>
        </div>
        <div className="h-96 skeleton mt-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Menu Items</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="input"
                  placeholder="Enter item name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-1">
                  Price (VND)
                </label>
                <input
                  {...register('price')}
                  type="number"
                  step="1000"
                  className="input"
                  placeholder="Enter price"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="input"
                >
                  <option value="">Select category</option>
                  <option value="food">Food</option>
                  <option value="drink">Drink</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="restaurantId" className="block text-sm font-medium mb-1">
                  Restaurant
                </label>
                <select
                  {...register('restaurantId')}
                  className="input"
                >
                  <option value="">Select restaurant</option>
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
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary px-4 py-2"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  editingItem ? 'Update Menu Item' : 'Thêm món'
                )}
              </button>
              {editingItem && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="text-right">Price</th>
                <th>Category</th>
                <th>Restaurant</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No menu items found. Add your first item above.
                  </td>
                </tr>
              ) : (
                menuItems.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.name}</td>
                    <td className="text-right font-medium">{formatCurrency(item.price)}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.category === 'food' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td>{item.restaurant.name}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn btn-secondary px-3 py-1 text-xs mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
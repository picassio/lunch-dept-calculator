'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const restaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface MenuItem {
  id: number;
  name: string;
}

interface Restaurant {
  id: number;
  name: string;
  menuItems?: MenuItem[];
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (editingRestaurant) {
      setValue('name', editingRestaurant.name);
    } else {
      reset();
    }
  }, [editingRestaurant, setValue, reset]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      const data = await response.json();
      setRestaurants(data);
    } catch {
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RestaurantFormData) => {
    try {
      const url = '/api/restaurants';
      const method = editingRestaurant ? 'PUT' : 'POST';
      const body = editingRestaurant ? { ...data, id: editingRestaurant.id } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingRestaurant ? 'update' : 'create'} restaurant`);
      }

      setEditingRestaurant(null);
      reset();
      fetchRestaurants();
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this restaurant? This will fail if there are menu items associated with it.')) return;

    try {
      const response = await fetch(`/api/restaurants?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete restaurant');
      }

      fetchRestaurants();
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingRestaurant(null);
    reset();
    setError('');
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-40 skeleton mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 skeleton"></div>
          <div className="h-10 w-32 skeleton"></div>
        </div>
        <div className="h-64 skeleton mt-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Cửa hàng</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Tên cửa hàng
              </label>
              <input
                {...register('name')}
                type="text"
                className="input"
                placeholder="Enter restaurant name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="flex gap-2">
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
                  editingRestaurant ? 'Update Restaurant' : 'Add Restaurant'
                )}
              </button>
              {editingRestaurant && (
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
                <th>Tên cửa hàng</th>
                <th>Danh mục món</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-muted-foreground">
                    No restaurants found. Add your first restaurant above.
                  </td>
                </tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td className="font-medium">{restaurant.name}</td>
                    <td>
                      {restaurant.menuItems ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
                          {restaurant.menuItems.length} items
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">No items</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleEdit(restaurant)}
                        className="btn btn-secondary px-3 py-1 text-xs mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
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
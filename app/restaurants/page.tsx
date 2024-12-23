'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const restaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface Restaurant {
  id: number;
  name: string;
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
    formState: { errors },
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Restaurants</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              {...register('name')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingRestaurant ? 'Update Restaurant' : 'Add Restaurant'}
            </button>
            {editingRestaurant && (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mt-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {restaurant.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                      <button
                        onClick={() => handleEdit(restaurant)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
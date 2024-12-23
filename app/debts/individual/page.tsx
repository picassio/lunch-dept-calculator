'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/app/lib/formatCurrency';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Debt {
  id: number;
  debtor: {
    id: number;
    name: string;
  };
  creditor: {
    id: number;
    name: string;
  };
  menuItem: {
    name: string;
    price: number;
  };
  quantity: number;
  totalPrice: number;
  date: string;
}

export default function IndividualDebtsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [debtsOwed, setDebtsOwed] = useState<Debt[]>([]);
  const [debtsToCollect, setDebtsToCollect] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  }, []);

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debts');
      const data = await response.json();
      const owed = data.filter((debt: Debt) => debt.debtor.id === selectedUser);
      const toCollect = data.filter((debt: Debt) => debt.creditor.id === selectedUser);
      setDebtsOwed(owed);
      setDebtsToCollect(toCollect);
    } catch {
      setError('Failed to load debt data');
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchDebts();
    }
  }, [selectedUser, fetchDebts]);

  const handleDeleteDebt = async (debtId: number) => {
    if (!confirm('Are you sure you want to delete this debt?')) {
      return;
    }

    try {
      const response = await fetch(`/api/debts?id=${debtId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete debt');
      }

      // Refresh debts after deletion
      fetchDebts();
    } catch {
      setError('Failed to delete debt');
    }
  };

  const totalOwed = debtsOwed.reduce((sum, debt) => sum + debt.totalPrice, 0);
  const totalToCollect = debtsToCollect.reduce((sum, debt) => sum + debt.totalPrice, 0);

  if (loading && !selectedUser) return <div>Loading...</div>;

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Individual Debts</h1>

      <div className="max-w-md">
        <label htmlFor="user" className="block text-sm font-medium text-gray-600">
          Select User
        </label>
        <select
          id="user"
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          onChange={(e) => setSelectedUser(Number(e.target.value))}
          value={selectedUser || ''}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {selectedUser && !loading && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-blue-900">
                Total Debt Owed: {formatCurrency(totalOwed)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-green-900">
                Total to Collect: {formatCurrency(totalToCollect)}
              </p>
            </div>
          </div>

          {debtsOwed.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Debts Owed</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creditor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {debtsOwed.map((debt) => (
                      <tr key={debt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(debt.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {debt.creditor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {debt.menuItem.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {debt.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {formatCurrency(debt.menuItem.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(debt.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => handleDeleteDebt(debt.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
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
          )}

          {debtsToCollect.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Debts to Collect</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debtor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {debtsToCollect.map((debt) => (
                      <tr key={debt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(debt.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {debt.debtor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {debt.menuItem.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {debt.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {formatCurrency(debt.menuItem.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(debt.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => handleDeleteDebt(debt.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
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
          )}
        </div>
      )}
    </div>
  );
}
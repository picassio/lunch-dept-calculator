'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../../lib/formatCurrency';

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
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải danh sách người dùng');
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
      setError('Không thể tải dữ liệu nợ');
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
    if (!confirm('Bạn có chắc chắn muốn xóa khoản nợ này không?')) {
      return;
    }

    setDeleteLoading(debtId);
    try {
      const response = await fetch(`/api/debts?id=${debtId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Không thể xóa khoản nợ');
      }

      fetchDebts();
    } catch {
      setError('Không thể xóa khoản nợ');
    } finally {
      setDeleteLoading(null);
    }
  };

  const totalOwed = debtsOwed.reduce((sum, debt) => sum + debt.totalPrice, 0);
  const totalToCollect = debtsToCollect.reduce((sum, debt) => sum + debt.totalPrice, 0);
  const netBalance = totalToCollect - totalOwed;

  if (loading && !selectedUser) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-48 skeleton mb-6"></div>
        <div className="h-12 w-64 skeleton"></div>
        <div className="space-y-4 mt-8">
          <div className="h-24 skeleton"></div>
          <div className="h-64 skeleton"></div>
        </div>
      </div>
    );
  }

  const DebtTable = ({ debts, type }: { debts: Debt[], type: 'owed' | 'collect' }) => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>{type === 'owed' ? 'Chủ Nợ' : 'Con Nợ'}</th>
            <th>Món Ăn</th>
            <th className="text-center">SL</th>
            <th className="text-right">Giá/Món</th>
            <th className="text-right">Tổng</th>
            <th className="text-right">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {debts.map((debt) => (
            <tr key={debt.id}>
              <td className="whitespace-nowrap">
                {new Date(debt.date).toLocaleDateString('vi-VN')}
              </td>
              <td className="font-medium">
                {type === 'owed' ? debt.creditor.name : debt.debtor.name}
              </td>
              <td>{debt.menuItem.name}</td>
              <td className="text-center">{debt.quantity}</td>
              <td className="text-right">{formatCurrency(debt.totalPrice / debt.quantity)}</td>
              <td className="text-right font-medium">{formatCurrency(debt.totalPrice)}</td>
              <td className="text-right">
                <button
                  onClick={() => handleDeleteDebt(debt.id)}
                  disabled={deleteLoading === debt.id}
                  className="btn bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-xs"
                >
                  {deleteLoading === debt.id ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Đang xóa...
                    </span>
                  ) : (
                    'Xóa'
                  )}
                </button>
              </td>
            </tr>
          ))}
          {debts.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8 text-muted-foreground">
                Không tìm thấy khoản nợ nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Nợ Cá Nhân</h1>

          <div className="max-w-md">
            <label htmlFor="user" className="block text-sm font-medium mb-1">
              Chọn Người Dùng
            </label>
            <select
              id="user"
              className="input"
              onChange={(e) => setSelectedUser(Number(e.target.value))}
              value={selectedUser || ''}
            >
              <option value="">Chọn người dùng</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>
      </div>

      {selectedUser && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-red-50 dark:bg-red-900/10">
              <div className="p-4">
                <h3 className="text-sm font-medium text-red-900 dark:text-red-400">Tổng Nợ Phải Trả</h3>
                <p className="mt-2 text-2xl font-semibold text-red-900 dark:text-red-400">
                  {formatCurrency(totalOwed)}
                </p>
              </div>
            </div>
            
            <div className="card bg-green-50 dark:bg-green-900/10">
              <div className="p-4">
                <h3 className="text-sm font-medium text-green-900 dark:text-green-400">Tổng Nợ Phải Thu</h3>
                <p className="mt-2 text-2xl font-semibold text-green-900 dark:text-green-400">
                  {formatCurrency(totalToCollect)}
                </p>
              </div>
            </div>

            <div className={`card ${
              netBalance >= 0
                ? 'bg-blue-50 dark:bg-blue-900/10'
                : 'bg-orange-50 dark:bg-orange-900/10'
            }`}>
              <div className="p-4">
                <h3 className={`text-sm font-medium ${
                  netBalance >= 0
                    ? 'text-blue-900 dark:text-blue-400'
                    : 'text-orange-900 dark:text-orange-400'
                }`}>
                  Số Dư
                </h3>
                <p className={`mt-2 text-2xl font-semibold ${
                  netBalance >= 0
                    ? 'text-blue-900 dark:text-blue-400'
                    : 'text-orange-900 dark:text-orange-400'
                }`}>
                  {formatCurrency(netBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Các Khoản Đang Nợ</h2>
              <DebtTable debts={debtsOwed} type="owed" />
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Các Khoản Cho Vay</h2>
              <DebtTable debts={debtsToCollect} type="collect" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
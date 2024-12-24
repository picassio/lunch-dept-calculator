'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/formatCurrency';

interface DebtSummary {
  debtor: {
    id: number;
    name: string;
    email: string;
  };
  creditor: {
    id: number;
    name: string;
    email: string;
  };
  totalDebt: number;
}

interface DetailedDebt {
  id: number;
  debtor: {
    name: string;
  };
  creditor: {
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

export default function GroupDebtsPage() {
  const [summaries, setSummaries] = useState<DebtSummary[]>([]);
  const [details, setDetails] = useState<DetailedDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [summariesResponse, detailsResponse] = await Promise.all([
        fetch('/api/debts', { method: 'PUT' }),
        fetch('/api/debts')
      ]);
      
      const [summariesData, detailsData] = await Promise.all([
        summariesResponse.json(),
        detailsResponse.json()
      ]);
      
      setSummaries(summariesData);
      setDetails(detailsData);
      setLoading(false);
    } catch {
      setError('Failed to load debt data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

      fetchData();
    } catch {
      setError('Không thể xóa khoản nợ');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton mb-6"></div>
        <div className="h-24 skeleton mb-6"></div>
        <div className="space-y-4">
          <div className="h-8 w-32 skeleton"></div>
          <div className="h-64 skeleton"></div>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-40 skeleton"></div>
          <div className="h-96 skeleton"></div>
        </div>
      </div>
    );
  }

  const totalGroupDebt = summaries.reduce((sum, item) => sum + (item.totalDebt || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Tổng Quan Nợ Nhóm</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-primary/5 border-primary/20">
              <div className="p-4">
                <h3 className="text-sm font-medium text-primary">Tổng Nợ Nhóm</h3>
                <p className="mt-2 text-2xl font-semibold text-primary">
                  {formatCurrency(totalGroupDebt)}
                </p>
                <p className="mt-1 text-sm text-primary/70">
                  Tổng số tiền nợ của tất cả thành viên
                </p>
              </div>
            </div>

            <div className="card bg-muted">
              <div className="p-4">
                <h3 className="text-sm font-medium">Khoản Nợ Đang Hoạt Động</h3>
                <p className="mt-2 text-2xl font-semibold">
                  {summaries.length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Số lượng mối quan hệ nợ đang hoạt động
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tổng Kết Nợ</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Con Nợ</th>
                  <th>Chủ Nợ</th>
                  <th className="text-right">Số Tiền</th>
                </tr>
              </thead>
              <tbody>
                {summaries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy khoản nợ nào.
                    </td>
                  </tr>
                ) : (
                  summaries.map((summary, index) => (
                    <tr key={index}>
                      <td className="font-medium">{summary.debtor.name}</td>
                      <td>{summary.creditor.name}</td>
                      <td className="text-right font-medium">
                        {formatCurrency(summary.totalDebt || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Giao Dịch Gần Đây</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Con Nợ</th>
                  <th>Chủ Nợ</th>
                  <th>Món Ăn</th>
                  <th className="text-center">SL</th>
                  <th className="text-right">Giá/Món</th>
                  <th className="text-right">Tổng</th>
                  <th className="text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {details.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  details.map((debt) => (
                    <tr key={debt.id}>
                      <td className="whitespace-nowrap">
                        {new Date(debt.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="font-medium">{debt.debtor.name}</td>
                      <td>{debt.creditor.name}</td>
                      <td>{debt.menuItem.name}</td>
                      <td className="text-center">{debt.quantity}</td>
                      <td className="text-right">{formatCurrency(debt.totalPrice / debt.quantity)}</td>
                      <td className="text-right font-medium">
                        {formatCurrency(debt.totalPrice)}
                      </td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
    </div>
  );
}
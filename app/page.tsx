'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from './lib/formatCurrency';

interface DebtSummary {
  debtor: { id: number; name: string };
  creditor: { id: number; name: string };
  totalDebt: number;
}

interface UserDebtStats {
  userId: number;
  userName: string;
  totalOwed: number;
  totalOwing: number;
}

export default function Home() {
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [debtSummaries, setDebtSummaries] = useState<DebtSummary[]>([]);
  const [userStats, setUserStats] = useState<UserDebtStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch debt summaries
        const summariesRes = await fetch('/api/debts', {
          method: 'PUT'
        });
        const summariesData = await summariesRes.json();
        setDebtSummaries(summariesData);

        // Calculate monthly total and user statistics
        const debtsRes = await fetch('/api/debts');
        const debtsData = await debtsRes.json();
        
        // Filter debts for current month
        const now = new Date();
        const currentMonthDebts = debtsData.filter((debt: any) => {
          const debtDate = new Date(debt.date);
          return debtDate.getMonth() === now.getMonth() && 
                 debtDate.getFullYear() === now.getFullYear();
        });

        // Calculate monthly total
        const monthTotal = currentMonthDebts.reduce((acc: number, debt: any) => 
          acc + debt.totalPrice, 0
        );
        setMonthlyTotal(monthTotal);

        // Calculate user statistics
        const userStatsMap = new Map<number, UserDebtStats>();

        summariesData.forEach((summary: DebtSummary) => {
          // Update debtor stats
          if (!userStatsMap.has(summary.debtor.id)) {
            userStatsMap.set(summary.debtor.id, {
              userId: summary.debtor.id,
              userName: summary.debtor.name,
              totalOwed: 0,
              totalOwing: summary.totalDebt
            });
          } else {
            const stats = userStatsMap.get(summary.debtor.id)!;
            stats.totalOwing += summary.totalDebt;
          }

          // Update creditor stats
          if (!userStatsMap.has(summary.creditor.id)) {
            userStatsMap.set(summary.creditor.id, {
              userId: summary.creditor.id,
              userName: summary.creditor.name,
              totalOwed: summary.totalDebt,
              totalOwing: 0
            });
          } else {
            const stats = userStatsMap.get(summary.creditor.id)!;
            stats.totalOwed += summary.totalDebt;
          }
        });

        setUserStats(Array.from(userStatsMap.values()));
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      title: 'Add New Debt',
      description: 'Record new debts for group members',
      href: '/debts/new',
      color: 'bg-purple-500',
    },
    {
      title: 'Group Overview',
      description: 'View total debts for the entire group',
      href: '/debts/group',
      color: 'bg-orange-500',
    },
    {
      title: 'Individual Debts',
      description: 'Check detailed debts for each person',
      href: '/debts/individual',
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const topDebtor = userStats.reduce((max, stat) => 
    stat.totalOwing > max.totalOwing ? stat : max
  , userStats[0]);

  const topCreditor = userStats.reduce((max, stat) => 
    stat.totalOwed > max.totalOwed ? stat : max
  , userStats[0]);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Group Debt Manager
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Track and manage shared expenses within your group
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 mb-12 grid-cols-1 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Total Debts</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(monthlyTotal)}</p>
            <p className="text-sm text-gray-500 mt-1">Total debts for current month</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Debtor</h3>
            <p className="text-3xl font-bold text-red-600">{topDebtor?.userName}</p>
            <p className="text-sm text-gray-500 mt-1">
              Owes {formatCurrency(topDebtor?.totalOwing || 0)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Creditor</h3>
            <p className="text-3xl font-bold text-green-600">{topCreditor?.userName}</p>
            <p className="text-sm text-gray-500 mt-1">
              Owed {formatCurrency(topCreditor?.totalOwed || 0)}
            </p>
          </div>
        </div>

        {/* User Statistics Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-12 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Owed (Lending)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Owing (Borrowing)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userStats.map((stat) => (
                  <tr key={stat.userId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(stat.totalOwed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {formatCurrency(stat.totalOwing)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={stat.totalOwed - stat.totalOwing >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(stat.totalOwed - stat.totalOwing)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="relative group rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200 hover:shadow-lg bg-white"
            >
              <div>
                <div className={`inline-flex p-3 ${feature.color} rounded-lg text-white mb-4`}>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {feature.description}
                </p>
              </div>
              <span
                className="absolute inset-0 rounded-lg"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

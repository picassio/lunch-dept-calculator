'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from './lib/formatCurrency';

interface Debt {
  date: string;
  totalPrice: number;
}

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
  const [userStats, setUserStats] = useState<UserDebtStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch debt summaries
        // Fetch debt summaries and calculate user statistics
        const summariesRes = await fetch('/api/debts', {
          method: 'PUT'
        });
        const summariesData = await summariesRes.json();

        const debtsRes = await fetch('/api/debts');
        const debtsData = await debtsRes.json();
        
        // Filter debts for current month
        const now = new Date();
        const currentMonthDebts = debtsData.filter((debt: Debt) => {
          const debtDate = new Date(debt.date);
          return debtDate.getMonth() === now.getMonth() && 
                 debtDate.getFullYear() === now.getFullYear();
        });

        // Calculate monthly total
        const monthTotal = currentMonthDebts.reduce((acc: number, debt: Debt) =>
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
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      title: 'Group Overview',
      description: 'View total debts for the entire group',
      href: '/debts/group',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Individual Debts',
      description: 'Check detailed debts for each person',
      href: '/debts/individual',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-12 w-64 skeleton mx-auto mb-4"></div>
            <div className="h-6 w-96 skeleton mx-auto"></div>
          </div>
          <div className="grid gap-6 mb-12 grid-cols-1 md:grid-cols-3">
            <div className="h-32 skeleton"></div>
            <div className="h-32 skeleton"></div>
            <div className="h-32 skeleton"></div>
          </div>
          <div className="h-96 skeleton mb-12"></div>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-48 skeleton"></div>
            <div className="h-48 skeleton"></div>
            <div className="h-48 skeleton"></div>
          </div>
        </div>
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
    <div className="py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold sm:text-5xl mb-4">
            Group Debt Manager
          </h1>
          <p className="text-xl text-muted-foreground">
            Track and manage shared expenses within your group
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 mb-12 grid-cols-1 md:grid-cols-3">
          <div className="card bg-primary/5 border-primary/20">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">Monthly Total Debts</h3>
              <p className="text-3xl font-bold text-primary">{formatCurrency(monthlyTotal)}</p>
              <p className="text-sm text-primary/70 mt-1">Total debts for current month</p>
            </div>
          </div>

          <div className="card bg-red-50 dark:bg-red-900/10">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">Top Debtor</h3>
              <p className="text-3xl font-bold text-red-900 dark:text-red-400">{topDebtor?.userName}</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Owes {formatCurrency(topDebtor?.totalOwing || 0)}
              </p>
            </div>
          </div>

          <div className="card bg-green-50 dark:bg-green-900/10">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-400 mb-2">Top Creditor</h3>
              <p className="text-3xl font-bold text-green-900 dark:text-green-400">{topCreditor?.userName}</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Owed {formatCurrency(topCreditor?.totalOwed || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* User Statistics Table */}
        <div className="card mb-12">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">User Statistics</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th className="text-right">Total Owed (Lending)</th>
                  <th className="text-right">Total Owing (Borrowing)</th>
                  <th className="text-right">Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {userStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      No user statistics available.
                    </td>
                  </tr>
                ) : (
                  userStats.map((stat) => (
                    <tr key={stat.userId}>
                      <td className="font-medium">{stat.userName}</td>
                      <td className="text-right text-green-600 dark:text-green-400">
                        {formatCurrency(stat.totalOwed)}
                      </td>
                      <td className="text-right text-red-600 dark:text-red-400">
                        {formatCurrency(stat.totalOwing)}
                      </td>
                      <td className="text-right font-medium">
                        <span className={
                          stat.totalOwed - stat.totalOwing >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }>
                          {formatCurrency(stat.totalOwed - stat.totalOwing)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="card group hover:shadow-lg transition-all duration-200"
            >
              <div className="p-6">
                <div className="inline-flex p-3 bg-primary/10 text-primary rounded-lg mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

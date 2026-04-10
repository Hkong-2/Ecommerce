import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../stores/store';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome back, {user?.fullName || 'Admin'}. Here's an overview of your store.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder Stats Cards */}
        {[
          { title: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', trend: 'up' },
          { title: 'Subscriptions', value: '+2350', change: '+180.1% from last month', trend: 'up' },
          { title: 'Sales', value: '+12,234', change: '+19% from last month', trend: 'up' },
          { title: 'Active Now', value: '+573', change: '+201 since last hour', trend: 'up' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
            <p className={`mt-2 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder Charts/Tables Area */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-4 min-h-[400px] flex items-center justify-center">
            <span className="text-gray-400 font-medium">Revenue Chart Placeholder</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-3 min-h-[400px] flex items-center justify-center">
            <span className="text-gray-400 font-medium">Recent Sales Placeholder</span>
        </div>
      </div>
    </div>
  );
};

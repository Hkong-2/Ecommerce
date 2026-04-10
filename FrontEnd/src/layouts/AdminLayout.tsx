import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../stores/authSlice';
import { Button } from '../components/ui/button';
import { SignOut, Users, Package, ChartBar, Layout } from '@phosphor-icons/react';

export function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200 flex items-center justify-center">
          <Link to="/admin/dashboard" className="text-2xl font-black tracking-tighter text-indigo-600 uppercase">
            Shoora Admin
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium transition-colors">
            <Layout className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
            <Package className="w-5 h-5" />
            Products
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
            <Users className="w-5 h-5" />
            Users
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
            <ChartBar className="w-5 h-5" />
            Reports
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <SignOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (placeholder for now) */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:hidden">
            <Link to="/admin/dashboard" className="text-xl font-bold text-indigo-600">
              Shoora Admin
            </Link>
            <button onClick={handleLogout} className="p-2 text-gray-600">
              <SignOut className="w-6 h-6" />
            </button>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
}

import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../stores/authSlice';
import { Button } from '../components/ui/button';
import {
  CaretDown,
  SignOut,
  Users,
  Package,
  ChartBar,
  Layout,
  UserCircle,
} from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useProfile } from '../hooks/useProfile';
import type { RootState } from '../stores/store';

export function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: profile } = useProfile();

  const displayName = profile?.fullName || authUser?.fullName || 'Admin';
  const displayEmail = profile?.email || authUser?.email || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

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
            DigiPro Admin
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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <Link to="/admin/dashboard" className="text-xl font-bold text-indigo-600 md:hidden">
            DigiPro Admin
          </Link>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">Admin Console</p>
            <p className="text-xs text-gray-500">Quản lý cửa hàng DigiPro</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left outline-none transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Mở menu tài khoản quản trị"
              >
                <Avatar size="lg">
                  <AvatarFallback className="bg-indigo-100 font-semibold text-indigo-700">
                    {initials || 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-40 truncate text-sm font-semibold text-gray-900">
                    {displayName}
                  </p>
                  <p className="max-w-40 truncate text-xs text-gray-500">
                    {displayEmail || 'Quản trị viên'}
                  </p>
                </div>
                <CaretDown className="hidden h-4 w-4 text-gray-400 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <span className="block truncate font-semibold text-gray-900">
                  {displayName}
                </span>
                <span className="mt-0.5 block truncate font-normal text-gray-500">
                  {displayEmail}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onSelect={() => navigate('/admin/profile')}
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm"
              >
                <UserCircle className="h-5 w-5" />
                Thông tin cá nhân
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                variant="destructive"
                onSelect={handleLogout}
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm"
              >
                <SignOut className="h-5 w-5" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
}

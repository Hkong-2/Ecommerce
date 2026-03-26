import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProfile } from '../../hooks/useProfile';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function Header() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight text-blue-600">
          ShopApp
        </Link>

        {/* Search Bar - Placeholder */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Placeholder */}
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              0
            </span>
          </button>

          {/* User Auth/Avatar will go here */}
          <div>
            {!token ? (
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-gray-100 hover:border-blue-200 transition-colors">
                      {/* We'll use a placeholder image or initials. Assuming we don't have avatar URL in profile yet */}
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {getInitials(profile?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.fullName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

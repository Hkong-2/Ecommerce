import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} E-commerce Platform. All rights reserved.
      </footer>
    </div>
  );
}

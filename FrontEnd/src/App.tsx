import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminProtectedRoute } from './components/layout/AdminProtectedRoute';

// Lazy loading cho các trang để tối ưu tốc độ tải (Code Splitting)
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })));
const BrandPage = lazy(() => import('./pages/BrandPage').then(module => ({ default: module.BrandPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const CartPage = lazy(() => import('./pages/cart/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const VnPayMockPage = lazy(() => import('./pages/checkout/VnPayMockPage').then(module => ({ default: module.VnPayMockPage })));
const OrderSuccessPage = lazy(() => import('./pages/checkout/OrderSuccessPage').then(module => ({ default: module.OrderSuccessPage })));
const OrderFailedPage = lazy(() => import('./pages/checkout/OrderFailedPage').then(module => ({ default: module.OrderFailedPage })));
const VnPayReturnPage = lazy(() => import('./pages/checkout/VnPayReturnPage').then(module => ({ default: module.VnPayReturnPage })));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage').then(module => ({ default: module.AdminProfilePage })));

// Loading spinner hoặc placeholder trong lúc tải code mới
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public & User Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/brand/:id" element={<BrandPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/success" element={<OrderSuccessPage />} />
          <Route path="/order/failed" element={<OrderFailedPage />} />
        </Route>

        <Route path="/vnpay-mock" element={<VnPayMockPage />} />
        <Route path="/vnpay-return" element={<VnPayReturnPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Protected Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            {/* Add more admin routes here like /admin/products, etc */}
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

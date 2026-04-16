import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { BrandPage } from './pages/BrandPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { VnPayMockPage } from './pages/checkout/VnPayMockPage';
import { OrderSuccessPage } from './pages/checkout/OrderSuccessPage';
import { OrderFailedPage } from './pages/checkout/OrderFailedPage';
import { VnPayReturnPage } from './pages/checkout/VnPayReturnPage';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminProtectedRoute } from './components/layout/AdminProtectedRoute';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

function App() {
  return (
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
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          {/* Add more admin routes here like /admin/products, etc */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

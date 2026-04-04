import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { HomePage } from './pages/HomePage';
import ProfilePage from './pages/profile/ProfilePage';
import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
    </Routes>
  );
}

export default App;

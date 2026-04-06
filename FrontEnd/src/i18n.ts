import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "brand": "DigiPro",
      "search_placeholder": "Search products...",
      "login": "Login",
      "my_profile": "My Profile",
      "my_orders": "My Orders",
      "logout": "Log out",
      "hero_title": "Experience the",
      "hero_title_highlight": "Future.",
      "hero_subtitle": "Discover the latest and greatest smartphones tailored for your lifestyle.",
      "welcome_back": "Welcome Back",
      "sign_in_continue": "Sign in to your account to continue",
      "continue_google": "Continue with Google",
      "terms_prefix": "By continuing, you agree to DigiPro's",
      "terms": "Terms of Service",
      "and": "and",
      "privacy": "Privacy Policy",
      "auth_hero_title": "DIGIPRO",
      "auth_hero_subtitle": "Step into the future. Discover premium smartphones and elevate your tech experience.",
      "loading": "LOADING..."
    }
  },
  vi: {
    translation: {
      "brand": "DigiPro",
      "search_placeholder": "Tìm kiếm sản phẩm...",
      "login": "Đăng nhập",
      "my_profile": "Hồ sơ của tôi",
      "my_orders": "Đơn hàng của tôi",
      "logout": "Đăng xuất",
      "hero_title": "Trải nghiệm",
      "hero_title_highlight": "Tương lai.",
      "hero_subtitle": "Khám phá những mẫu điện thoại thông minh mới nhất và tốt nhất dành cho bạn.",
      "welcome_back": "Chào mừng trở lại",
      "sign_in_continue": "Đăng nhập vào tài khoản của bạn để tiếp tục",
      "continue_google": "Tiếp tục với Google",
      "terms_prefix": "Bằng cách tiếp tục, bạn đồng ý với",
      "terms": "Điều khoản Dịch vụ",
      "and": "và",
      "privacy": "Chính sách Bảo mật",
      "auth_hero_title": "DIGIPRO",
      "auth_hero_subtitle": "Bước vào tương lai. Khám phá điện thoại thông minh cao cấp và nâng tầm trải nghiệm công nghệ của bạn.",
      "loading": "ĐANG TẢI..."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

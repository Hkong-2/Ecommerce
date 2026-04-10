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
      "loading": "LOADING...",
      "home": {
        "hero": {
          "badge": "100% Genuine Guaranteed",
          "title1": "Elevate Your",
          "title2": "Digital Experience",
          "subtitle": "Discover the ultimate smartphone world at DigiPro. We bring you the most powerful flagship models, beautiful designs at the best market prices.",
          "shopNow": "Shop Now",
          "promotions": "Promotions"
        },
        "products": {
          "featured": "Featured Products",
          "subtitle": "A collection of the most worth-buying phones.",
          "loadMore": "Load more products",
          "loadingMore": "Loading..."
        }
      }
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
      "loading": "ĐANG TẢI...",
      "home": {
        "hero": {
          "badge": "Cam kết chính hãng 100%",
          "title1": "Nâng tầm",
          "title2": "Trải nghiệm Số",
          "subtitle": "Khám phá thế giới smartphone đỉnh cao tại DigiPro. Chúng tôi mang đến những dòng máy flagship mạnh mẽ nhất, thiết kế đẹp nhất với giá tốt nhất thị trường.",
          "shopNow": "Mua sắm ngay",
          "promotions": "Khuyến mãi"
        },
        "products": {
          "featured": "Sản phẩm Nổi bật",
          "subtitle": "Tuyển tập những chiếc điện thoại đáng mua nhất.",
          "loadMore": "Xem thêm sản phẩm",
          "loadingMore": "Đang tải..."
        }
      }
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

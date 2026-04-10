import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import { productsApi } from '../api/products';
import type { HomepageProduct } from '../api/products';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../utils/image';
import { Loader2, Smartphone, TrendingUp, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, setUser, isLoading: isAuthLoading } = useAuthStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();
  const [products, setProducts] = useState<HomepageProduct[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 6;

  useEffect(() => {
     // If authenticated but user profile is missing, try fetching it.
     const fetchProfile = async () => {
        if (isAuthenticated && !user) {
           try {
              const fetchedUser = await authApi.getProfile();
              setUser(fetchedUser);
           } catch (e) {
              console.error(e);
           }
        }
     }
     fetchProfile();
  }, [isAuthenticated, user, setUser]);

  // Initial Fetch
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setIsProductsLoading(true);
        const response = await productsApi.getHomepageProducts(1, limit);
        setProducts(response.data);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setProductsError("Could not load products. Please try again later.");
      } finally {
        setIsProductsLoading(false);
      }
    };
    fetchInitialProducts();
  }, []);

  const loadMore = async () => {
    if (isFetchingMore || !hasMore) return;

    try {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      const response = await productsApi.getHomepageProducts(nextPage, limit);

      setProducts(prev => [...prev, ...response.data]);
      setPage(nextPage);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Failed to fetch more data:", error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  const renderSkeletons = (count: number) => {
    return Array(count).fill(0).map((_, idx) => (
      <div key={`skeleton-${idx}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden animate-pulse">
        <div className="aspect-square bg-slate-100 relative p-6 w-full" />
        <div className="p-6 flex flex-col flex-grow bg-white border-t border-slate-50">
          <div className="h-3 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-5 bg-slate-200 rounded w-1/2 mb-6"></div>
          <div className="mt-auto pt-4 border-t border-slate-50">
            <div className="h-3 bg-slate-200 rounded w-1/6 mb-2"></div>
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    ));
  };

  const renderContent = () => {
    if (isProductsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
          {renderSkeletons(6)}
        </div>
      );
    }

    if (productsError) {
      return (
        <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-red-500 font-medium">{productsError}</p>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <Smartphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Chưa có sản phẩm nào.</p>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {/* Brand Highlights Row */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['Apple', 'Samsung', 'Google', 'Xiaomi', 'Oppo'].map(brand => (
                <div key={brand} className="px-6 py-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-600 font-medium hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                    {brand}
                </div>
            ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
              // Add a "Premium" badge to the first 3 items (mocking top tier)
              const isPremium = index < 3;

              return (
              <Link to={`/product/${product.slug}`} key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative">

                {isPremium && (
                  <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Premium
                  </div>
                )}

                {/* Image Section */}
                <div className="aspect-square bg-gradient-to-b from-slate-50 to-white relative p-8 flex items-center justify-center">
                    {product.thumbnailUrl ? (
                        <img
                            src={getFullImageUrl(product.thumbnailUrl)}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 drop-shadow-sm"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                            <Smartphone className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm">No Image</span>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-6 flex flex-col flex-grow bg-white z-10 border-t border-slate-50">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">{product.brandName}</span>
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-2 leading-snug flex-grow group-hover:text-blue-600 transition-colors">{product.name}</h3>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-end justify-between">
                        <div>
                            <p className="text-xs text-slate-400 mb-1 font-medium">Giá từ</p>
                            <p className="text-blue-600 font-black text-xl">
                                {product.lowestPrice !== null && product.lowestPrice !== 0
                                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.lowestPrice)
                                    : 'Liên hệ'}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
              </Link>
          )})}

          {/* Render extra skeletons while loading more */}
          {isFetchingMore && renderSkeletons(3)}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="pt-12 text-center">
            <button
              onClick={loadMore}
              disabled={isFetchingMore}
              className="px-8 py-4 bg-white border-2 border-blue-500 text-blue-600 font-bold rounded-full hover:bg-blue-50 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isFetchingMore ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tải...
                </>
              ) : (
                'Xem thêm sản phẩm'
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-24">

      {/* Hero Section Revamp */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-20 px-8 relative overflow-hidden">
         {/* Decorative background elements */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>

         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-2">
                <ShieldCheck className="w-4 h-4" /> Cam kết chính hãng 100%
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight text-slate-800 leading-[1.1]">
                {t('home.hero.title1')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{t('home.hero.title2')}</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-lg font-light leading-relaxed mx-auto md:mx-0">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-blue-500/25 transition-all">
                  Mua sắm ngay
                </button>
                <button className="px-8 py-4 bg-white text-slate-700 font-bold rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">
                  Khuyến mãi
                </button>
              </div>
            </div>
            <div className="hidden md:flex justify-center items-center relative">
               {/* Illustration / Placeholder for Hero Image */}
               <div className="relative w-full max-w-md aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full animate-pulse opacity-50"></div>
                  <div className="absolute inset-4 bg-white rounded-full shadow-2xl flex items-center justify-center p-8">
                      <Smartphone className="w-32 h-32 text-blue-500" strokeWidth={1} />
                  </div>
                  {/* Floating Elements */}
                  <div className="absolute top-10 right-10 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce">
                    <span className="text-2xl font-black text-blue-600">5G</span>
                  </div>
                  <div className="absolute bottom-20 left-4 w-24 h-12 bg-white rounded-xl shadow-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700">Pro Max</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pt-20">
         <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h3 className="text-3xl font-black text-slate-800">{t('home.products.featured')}</h3>
              <p className="text-slate-500 mt-2">{t('home.products.subtitle')}</p>
            </div>
         </div>
         {renderContent()}
      </div>
    </div>
  );
};

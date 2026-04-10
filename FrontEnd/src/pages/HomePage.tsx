import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../stores/store';
import { setUser } from '../stores/authSlice';
import { authApi } from '../api/auth';
import { productsApi } from '../api/products';
import type { HomepageProduct } from '../api/products';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../utils/image';
import { Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import heroPhone from '../assets/hero-phone.png';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
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
              dispatch(setUser(fetchedUser));
           } catch (e) {
              console.error(e);
           }
        }
     }
     fetchProfile();
  }, [isAuthenticated, user, dispatch]);

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
        <div className="flex flex-wrap justify-center gap-4 mb-10 relative z-20">
            {['Apple', 'Samsung', 'Google', 'Xiaomi', 'Oppo'].map(brand => (
                <div key={brand} className="px-8 py-2.5 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-slate-200/50 text-slate-700 font-bold hover:bg-white hover:text-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                    {brand}
                </div>
            ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {


              return (
              <Link to={`/product/${product.slug}`} key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative">


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

      {/* Hero Section Revamp - Vibrant Glassmorphism */}
      <div className="relative pt-24 pb-32 px-8 overflow-hidden bg-slate-900 isolate">
         {/* Animated Mesh Gradient Background Elements */}
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
         <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-pink-500 rounded-full mix-blend-screen filter blur-[90px] opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
         
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8 text-center md:text-left pt-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 text-sm font-semibold shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Cam kết chính hãng 100%
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] drop-shadow-md">
                {t('home.hero.title1')} <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-sm">{t('home.hero.title2')}</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-lg font-light leading-relaxed mx-auto md:mx-0">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all">
                  Mua sắm ngay
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-full shadow-sm border border-white/20 hover:bg-white/20 transition-all">
                  Khuyến mãi
                </button>
              </div>
            </div>
            
            <div className="mt-10 md:mt-0 flex justify-center items-center relative">
               {/* 3D Image & Glassmorphism Orbiting Cards */}
               <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
                  {/* Glowing backdrop behind the phone */}
                  <div className="absolute inset-10 bg-gradient-to-tr from-cyan-400/30 to-purple-500/30 rounded-full blur-3xl"></div>
                  
                  <img src={heroPhone} alt="Premium Smartphone" className="w-[85%] h-[85%] object-contain z-20 animate-float drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]" />
                  
                  {/* Floating Glass Cards */}
                  <div className="absolute top-[15%] right-[5%] z-30 px-5 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl animate-float-reverse flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                      5G
                    </div>
                    <span className="text-sm font-bold text-white shadow-sm">Siêu tốc độ</span>
                  </div>
                  
                  <div className="absolute bottom-[20%] left-[0%] z-30 px-5 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl animate-float flex flex-col items-start gap-1" style={{ animationDelay: '1.5s' }}>
                    <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">Phiên bản</span>
                    <span className="text-lg font-black text-white">Pro Max</span>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Bottom Fade out into white content area */}
         <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
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

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
import { ChevronLeft, ChevronRight, Loader2, Smartphone } from 'lucide-react';
import heroPhone from '../assets/hero-phone.png';
import { ProductFilter } from '../components/ui/ProductFilter';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const [products, setProducts] = useState<HomepageProduct[]>([]);
  const [heroProducts, setHeroProducts] = useState<HomepageProduct[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  // Filter State
  const [filters, setFilters] = useState<{ minPrice?: number; maxPrice?: number; sortBy?: string }>({});

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

  // Fetch Function
  const fetchProducts = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsFetchingMore(true);
      } else {
        setIsProductsLoading(true);
      }

      const currentPage = isLoadMore ? page + 1 : 1;

      const params = {
        page: currentPage,
        limit,
        ...filters
      };

      let response;
      if (filters.minPrice || filters.maxPrice || filters.sortBy) {
         response = await productsApi.searchProducts(params);
      } else {
         response = await productsApi.getHomepageProducts(params.page, params.limit);
      }

      if (isLoadMore) {
        setProducts(prevProducts => [...prevProducts, ...response.data]);
        setPage(currentPage);
      } else {
        setProducts(response.data);
        setPage(1);

        const hasActiveFilters = Boolean(filters.minPrice || filters.maxPrice || filters.sortBy);
        if (!hasActiveFilters) {
          setHeroProducts(response.data.filter((product) => product.thumbnailUrl).slice(0, 6));
        }
      }

      setHasMore(response.hasMore);

    } catch (err: any) {
       console.error("Failed to fetch data:", err);
       setProductsError("Could not load products. Please try again later.");
    } finally {
      setIsProductsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(false);
  }, [filters]);

  useEffect(() => {
    if (heroProducts.length < 2 || isHeroPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((currentIndex) => (currentIndex + 1) % heroProducts.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [heroProducts.length, isHeroPaused]);

  useEffect(() => {
    if (activeHeroIndex >= heroProducts.length) {
      setActiveHeroIndex(0);
    }
  }, [activeHeroIndex, heroProducts.length]);

  const loadMore = () => {
     if (isFetchingMore || !hasMore) return;
     fetchProducts(true);
  };

  const showPreviousHeroProduct = () => {
    setActiveHeroIndex((currentIndex) =>
      currentIndex === 0 ? heroProducts.length - 1 : currentIndex - 1
    );
  };

  const showNextHeroProduct = () => {
    setActiveHeroIndex((currentIndex) => (currentIndex + 1) % heroProducts.length);
  };

  const activeHeroProduct = heroProducts[activeHeroIndex];

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
        <ProductFilter onFilterChange={setFilters} initialFilters={filters} />

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
            
            <div
              className="mt-10 md:mt-0 flex justify-center items-center relative"
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
            >
               {/* 3D Image & Glassmorphism Orbiting Cards */}
               <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
                  {/* Glowing backdrop behind the phone */}
                  <div className="absolute inset-10 bg-gradient-to-tr from-cyan-400/30 to-purple-500/30 rounded-full blur-3xl"></div>
                  
                  <div className="absolute inset-0 z-20">
                    {heroProducts.length > 0 ? (
                      heroProducts.map((product, index) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug}`}
                          aria-label={`Xem ${product.name}`}
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                            index === activeHeroIndex
                              ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto'
                              : 'opacity-0 translate-x-10 scale-95 pointer-events-none'
                          }`}
                        >
                          <img
                            src={getFullImageUrl(product.thumbnailUrl)}
                            alt={product.name}
                            className="w-[82%] h-[82%] object-contain animate-float drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                          />
                        </Link>
                      ))
                    ) : (
                      <img
                        src={heroPhone}
                        alt="Premium Smartphone"
                        className="w-[85%] h-[85%] object-contain mx-auto animate-float drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                      />
                    )}
                  </div>

                  {activeHeroProduct && (
                    <Link
                      to={`/product/${activeHeroProduct.slug}`}
                      className="absolute bottom-[5%] left-1/2 z-30 w-[76%] -translate-x-1/2 rounded-2xl border border-white/20 bg-slate-950/50 px-5 py-3 text-left shadow-2xl backdrop-blur-xl transition-colors hover:bg-slate-950/70"
                    >
                      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        {activeHeroProduct.brandName}
                      </span>
                      <span className="block truncate text-base font-black text-white sm:text-lg">
                        {activeHeroProduct.name}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-slate-200">
                        {activeHeroProduct.lowestPrice
                          ? `Từ ${new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(activeHeroProduct.lowestPrice)}`
                          : 'Liên hệ'}
                      </span>
                    </Link>
                  )}

                  {heroProducts.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousHeroProduct}
                        aria-label="Điện thoại trước"
                        className="absolute left-0 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={showNextHeroProduct}
                        aria-label="Điện thoại tiếp theo"
                        className="absolute right-0 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>

                      <div className="absolute -bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2">
                        {heroProducts.map((product, index) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => setActiveHeroIndex(index)}
                            aria-label={`Hiển thị ${product.name}`}
                            aria-current={index === activeHeroIndex ? 'true' : undefined}
                            className={`h-2.5 rounded-full transition-all ${
                              index === activeHeroIndex
                                ? 'w-8 bg-cyan-400'
                                : 'w-2.5 bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
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
            </div>
         </div>
         {renderContent()}
      </div>
    </div>
  );
};

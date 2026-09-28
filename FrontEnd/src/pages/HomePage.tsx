import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../stores/store';
import { setUser } from '../stores/authSlice';
import { authApi } from '../api/auth';
import { productsApi } from '../api/products';
import { brandsApi } from '../api/brands';
import type { Brand } from '../api/brands';
import type { HomepageProduct } from '../api/products';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../utils/image';
import heroBg from '../assets/hero-bg.png';
import { Loader2, Smartphone, ShoppingCart } from 'lucide-react';

import { ProductFilter } from '../components/ui/ProductFilter';

const LOCAL_BRAND_LOGOS: Record<string, string> = {
  'apple': '/brands/apple.png',
  'iphone': '/brands/apple.png',
  'samsung': '/brands/samsung.png',
  'xiaomi': '/brands/xiaomi.png',
};

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const [products, setProducts] = useState<HomepageProduct[]>([]);
        const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  // Filter State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filters, setFilters] = useState<{ minPrice?: number; maxPrice?: number; sortBy?: string; brandId?: number }>({});

  useEffect(() => {
    brandsApi.getAllBrands().then(apiBrands => {
      const seen = new Set();
      const filtered = [];
      for (const b of apiBrands) {
        const name = b.name.toLowerCase();
        if (name === 'google pixal') continue;
        if (!seen.has(name)) {
          seen.add(name);
          filtered.push(b);
        }
      }
      filtered.sort((a, b) => {
        const aHasLogo = a.logoUrl || LOCAL_BRAND_LOGOS[a.name.toLowerCase()] ? 1 : 0;
        const bHasLogo = b.logoUrl || LOCAL_BRAND_LOGOS[b.name.toLowerCase()] ? 1 : 0;
        return bHasLogo - aHasLogo;
      });
      setBrands(filtered);
    }).catch(console.error);
  }, []);

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

  const loadMore = () => {
     if (isFetchingMore || !hasMore) return;
     fetchProducts(true);
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
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: Filters */}
        <div className="w-full lg:w-1/4 flex-shrink-0">
          <ProductFilter onFilterChange={setFilters} initialFilters={filters} />
        </div>

        {/* Right Content: Brands + Product Grid */}
        <div className="w-full lg:w-3/4 space-y-8">
          {/* Brands Filter placeholder */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide items-center border-b border-slate-200">
            <button 
              onClick={() => setFilters(prev => ({...prev, brandId: undefined}))} 
              className={`h-14 px-6 min-w-[100px] rounded-xl border font-bold text-sm whitespace-nowrap transition-all flex items-center justify-center flex-shrink-0 ${!filters.brandId ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30" : "bg-white text-slate-700 border-slate-200 hover:border-blue-500"}`}
            >
              Tất cả
            </button>
            {brands.map(brand => (
              <button 
                key={brand.id} 
                onClick={() => setFilters(prev => ({...prev, brandId: brand.id}))} 
                className={`h-14 px-6 min-w-[120px] rounded-xl border font-bold text-sm whitespace-nowrap transition-all flex items-center justify-center flex-shrink-0 ${filters.brandId === brand.id ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30" : "bg-white text-slate-700 border-slate-200 hover:border-blue-500 hover:shadow-md"}`}
              >
                {brand.logoUrl || LOCAL_BRAND_LOGOS[brand.name.toLowerCase()] ? (
                   <img src={brand.logoUrl ? getFullImageUrl(brand.logoUrl) : LOCAL_BRAND_LOGOS[brand.name.toLowerCase()]} alt={brand.name} className="h-8 object-contain" />
                ) : brand.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {


              return (
              <Link to={`/product/${product.slug}`} key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative">


                {/* Image Section */}
                <div className="aspect-square bg-gradient-to-b from-slate-50 to-white relative p-8 flex items-center justify-center overflow-hidden">
                    {product.thumbnailUrl ? (
                        <img
                            src={getFullImageUrl(product.thumbnailUrl)}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" loading="lazy" decoding="async"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                            <Smartphone className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm">No Image</span>
                        </div>
                    )}
                    {/* Hover Quick Action Button */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-20 px-6">
                       <div className="w-full py-3 bg-slate-900/95 backdrop-blur-md text-white text-sm font-bold rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-black flex items-center justify-center gap-2 transform active:scale-95 transition-transform">
                         <ShoppingCart className="w-4 h-4" />
                         Xem chi tiết
                       </div>
                    </div>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-24">

      {/* Hero Section */}
      <div 
         className="relative overflow-hidden isolate flex items-center justify-center min-h-[500px] md:min-h-[700px]"
         style={{ 
            backgroundImage: "url(" + heroBg + ")",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
         }}
      >
         {/* Dark overlay for text readability */}
         <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-0"></div>
         
         <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center px-4">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.2] drop-shadow-2xl mb-6">
              {t('home.hero.title1')} <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-lg">{t('home.hero.title2')}</span>
            </h2>
            <p className="text-lg md:text-2xl text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md mb-10">
              {t('home.hero.subtitle')}
            </p>
            
         </div>
         
         {/* Bottom Fade out into white content area */}
         <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
      </div>


      <div className="max-w-6xl mx-auto px-8 pt-10">
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

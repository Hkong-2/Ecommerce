import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import { productsApi } from '../api/products';
import type { HomepageProduct } from '../api/products';
import { useTranslation } from 'react-i18next';
import { getFullImageUrl } from '../utils/image';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, setUser, isLoading: isAuthLoading } = useAuthStore();
  const { t } = useTranslation();
  const [products, setProducts] = useState<HomepageProduct[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchProductsAndBrands = async () => {
      try {
        setIsProductsLoading(true);
        const productsData = await productsApi.getHomepageProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setProductsError("Could not load products. Please try again later.");
      } finally {
        setIsProductsLoading(false);
      }
    };
    fetchProductsAndBrands();
  }, []);

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><span className="text-xl animate-pulse text-blue-500 font-bold tracking-widest">{t('loading')}</span></div>;
  }

  // Fallback to dummy products if API fails or returns no products (just for visual structure while developing)
  const renderContent = () => {
    if (isProductsLoading) {
      return <div className="text-center py-12"><span className="animate-pulse text-slate-500">{t('loading')}</span></div>;
    }

    if (productsError) {
      return <div className="text-center py-12 text-red-500">{productsError}</div>;
    }

    if (products.length === 0) {
      return <div className="text-center py-12 text-slate-500">No products available yet.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
        {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1">
              {/* Image Section */}
              <div className="aspect-square bg-slate-50 relative p-6 flex items-center justify-center">
                  {product.thumbnailUrl ? (
                      <img
                          src={getFullImageUrl(product.thumbnailUrl)}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />
                  ) : (
                      <div className="text-slate-300">No Image</div>
                  )}
              </div>

              {/* Info Section */}
              <div className="p-6 flex flex-col flex-grow bg-white z-10 border-t border-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{product.brandName}</span>
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-2 leading-snug flex-grow">{product.name}</h3>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                      <p className="text-sm text-slate-500 mb-1">Từ</p>
                      <p className="text-blue-600 font-black text-xl">
                          {product.lowestPrice !== null && product.lowestPrice !== 0
                              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.lowestPrice)
                              : 'Liên hệ'}
                      </p>
                  </div>
              </div>
            </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <main className="py-12 space-y-16">
           <section className="text-center space-y-6">
             <h2 className="text-6xl font-black tracking-tight text-slate-800">
               {t('hero_title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{t('hero_title_highlight')}</span>
             </h2>
             <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
               {t('hero_subtitle')}
             </p>
           </section>

           {renderContent()}

        </main>
      </div>
    </div>
  );
};

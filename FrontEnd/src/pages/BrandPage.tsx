import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../api/products';
import type { SearchProductsParams } from '../api/products';
import { brandsApi } from '../api/brands';
import type { Brand } from '../api/brands';
import type { HomepageProduct } from '../api/products';
import { getFullImageUrl } from '../utils/image';
import { Smartphone, Loader2 } from 'lucide-react';
import { ProductFilter } from '../components/ui/ProductFilter';

export function BrandPage() {
  const { id } = useParams<{ id: string }>();
  const brandId = id ? parseInt(id, 10) : undefined;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<HomepageProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{ minPrice?: number; maxPrice?: number; sortBy?: string }>({});

  // Fetch brand details
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBrandDetails = async () => {
      if (!brandId) return;
      try {
        const brands = await brandsApi.getAllBrands();
        const found = brands.find(b => b.id === brandId);
        if (found) setBrand(found);
      } catch (error) {
        console.error("Failed to load brand", error);
      }
    };
    fetchBrandDetails();
  }, [brandId]);

  const fetchProducts = async (isLoadMore = false) => {
    if (!brandId) return;
    try {
      if (isLoadMore) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }

      const currentPage = isLoadMore ? page + 1 : 1;
      const params: SearchProductsParams = {
        brandId,
        page: currentPage,
        limit: 12,
        ...filters
      };

      const response = await productsApi.searchProducts(params);

      if (isLoadMore) {
        setProducts(prev => [...prev, ...response.data]);
        setPage(currentPage);
      } else {
        setProducts(response.data);
        setPage(1);
      }

      setHasMore(response.hasMore);
      setTotal(response.total);

    } catch (error) {
      console.error('Failed to fetch brand products:', error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(false);
  }, [brandId, filters]); // Re-fetch when brand ID or filters changes

  const loadMore = () => {
    fetchProducts(true);
  };

  const renderSkeletons = (count: number) => {
    return Array(count).fill(0).map((_, i) => (
      <div key={`skel-${i}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[400px] animate-pulse">
        <div className="w-full h-48 bg-slate-100 rounded-xl mb-6"></div>
        <div className="w-20 h-4 bg-slate-100 rounded mb-4"></div>
        <div className="w-full h-6 bg-slate-100 rounded mb-2"></div>
        <div className="w-2/3 h-6 bg-slate-100 rounded mb-auto"></div>
        <div className="w-32 h-8 bg-slate-100 rounded mt-4"></div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-24 pt-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* Filter Component */}
        <ProductFilter onFilterChange={setFilters} initialFilters={filters} />

        {/* Brand Header */}
        <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          {brand?.logoUrl ? (
            <img src={getFullImageUrl(brand.logoUrl)} alt={brand.name} className="h-12 object-contain" />
          ) : (
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
              {brand?.name?.substring(0, 2) || 'BR'}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{brand?.name || 'Đang tải...'}</h1>
            <p className="text-slate-500 mt-1">{total} sản phẩm</p>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {renderSkeletons(8)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Smartphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Chưa có sản phẩm nào cho thương hiệu này.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link to={`/product/${product.slug}`} key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
                  <div className="aspect-square bg-white relative p-6 flex items-center justify-center">
                    {product.thumbnailUrl ? (
                      <img
                        src={getFullImageUrl(product.thumbnailUrl)}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <Smartphone className="w-12 h-12 mb-2 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow bg-slate-50 z-10 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{product.brandName}</span>
                    <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug flex-grow group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <div className="mt-3 pt-3 border-t border-slate-200/50">
                      <p className="text-blue-600 font-black text-lg">
                        {product.lowestPrice !== null && product.lowestPrice !== 0
                          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.lowestPrice)
                          : 'Liên hệ'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {isFetchingMore && renderSkeletons(4)}
            </div>

            {hasMore && (
              <div className="pt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={isFetchingMore}
                  className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto shadow-sm"
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    'Xem thêm'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

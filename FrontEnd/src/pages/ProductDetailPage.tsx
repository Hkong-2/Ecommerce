import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../api/products';
import type { ProductDetail, SKU } from '../types/products';
import { ChevronRight, ShoppingCart, Info } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await productsApi.getProductBySlug(slug);
        setProduct(data);

        // Default to first SKU if available
        if (data.skus && data.skus.length > 0) {
          setSelectedSku(data.skus[0]);
        }

        // Default to first image
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0].imageUrl);
        } else if (data.thumbnailUrl) {
          setMainImage(data.thumbnailUrl);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Handle SKU selection
  const handleSkuSelect = (sku: SKU) => {
    setSelectedSku(sku);
    // Find image associated with this SKU if any
    const skuImage = product?.images?.find(img => img.skuId === sku.id);
    if (skuImage) {
      setMainImage(skuImage.imageUrl);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-slate-600 mb-8">{error || 'Product not found.'}</p>
        <Link to="/" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 mb-8 items-center">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="hover:text-blue-600 cursor-pointer">{product.category?.name || 'Category'}</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

            {/* Product Images */}
            <div className="w-full md:w-1/2">
              <div className="aspect-square bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center p-4 mb-4">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400">No image available</div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setMainImage(img.imageUrl)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 p-1 overflow-hidden transition-all ${
                        mainImage === img.imageUrl ? 'border-blue-500' : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <img src={img.imageUrl} alt={img.altText || ''} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium uppercase tracking-wider">
                  {product.brand?.name}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6 flex items-end gap-3">
                <span className="text-3xl font-bold text-red-600">
                  {selectedSku ? formatCurrency(selectedSku.price) : 'Contact for price'}
                </span>
                {selectedSku && selectedSku.originalPrice && selectedSku.originalPrice > selectedSku.price && (
                  <span className="text-lg text-slate-400 line-through mb-1">
                    {formatCurrency(selectedSku.originalPrice)}
                  </span>
                )}
              </div>

              {/* Variants / SKUs */}
              {product.skus && product.skus.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wide">
                    Options:
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.skus.map((sku) => {
                      // Extract simple display name from attributes if possible, else use skuCode
                      let displayName = sku.skuCode;
                      if (sku.attributes) {
                        const attrValues = Object.values(sku.attributes);
                        if (attrValues.length > 0) {
                          displayName = attrValues.join(' - ');
                        }
                      }

                      const isSelected = selectedSku?.id === sku.id;

                      return (
                        <button
                          key={sku.id}
                          onClick={() => handleSkuSelect(sku)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {displayName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto pt-6 border-t border-slate-100 flex gap-4">
                <button
                  onClick={() => alert('Add to cart clicked! Logic will be implemented later.')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              {/* Short Description */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-400" />
                  About this product
                </h3>
                <div className="text-slate-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} />
              </div>

            </div>
          </div>
        </div>

        {/* Tech Specs */}
        {product.techSpecs && Object.keys(product.techSpecs).length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Technical Specifications</h2>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <tbody>
                  {Object.entries(product.techSpecs).map(([key, value], index) => (
                    <tr key={key} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="w-1/3 py-3 px-4 font-medium text-slate-700 border-b border-slate-100 last:border-0 capitalize">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="w-2/3 py-3 px-4 text-slate-600 border-b border-slate-100 last:border-0">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

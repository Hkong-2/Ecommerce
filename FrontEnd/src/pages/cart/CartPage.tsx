import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../../stores/store';
import { useCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation } from '../../hooks/useCart';
import { getFullImageUrl } from '../../utils/image';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { useState } from 'react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { data: cartItems, isLoading } = useCartQuery(isAuthenticated);
  const updateItemMutation = useUpdateCartItemMutation();
  const removeItemMutation = useRemoveCartItemMutation();
  const clearCartMutation = useClearCartMutation();

  // Dialog states
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
    }
  }, [isAuthenticated, navigate]);

  const handleUpdateQuantity = (skuId: number, currentQuantity: number, change: number, stock: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0 && newQuantity <= stock) {
      updateItemMutation.mutate({ skuId, quantity: newQuantity });
    }
  };

  const handleRemove = (skuId: number) => {
    setItemToRemove(skuId);
  };

  const confirmRemoveItem = () => {
    if (itemToRemove !== null) {
      removeItemMutation.mutate(itemToRemove);
      setItemToRemove(null);
    }
  };

  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = () => {
    clearCartMutation.mutate();
    setShowClearConfirm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const calculateTotal = () => {
    return cartItems?.reduce((total, item) => total + item.sku.price * item.quantity, 0) || 0;
  };

  const formatAttributes = (attributes: Record<string, any>) => {
    return Object.values(attributes).join(' - ');
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 mb-8 items-center">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 font-medium">Giỏ hàng của bạn</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Giỏ hàng</h1>

        {!cartItems || cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-16 h-16 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Giỏ hàng của bạn đang trống</h2>
            <p className="text-slate-500 mb-8 max-w-md">
              Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Khám phá các sản phẩm nổi bật của chúng tôi ngay!
            </p>
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b flex justify-between items-center bg-slate-50/50">
                  <span className="font-semibold text-slate-700">
                    Bạn đang có {cartItems.length} sản phẩm trong giỏ hàng
                  </span>
                  <button
                    onClick={handleClearCart}
                    disabled={clearCartMutation.isPending || cartItems.length === 0}
                    className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Xóa tất cả</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:bg-slate-50/50 transition-colors">
                      {/* Image */}
                      <Link to={`/product/${item.product.slug}`} className="shrink-0 mx-auto sm:mx-0">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2">
                          <img
                            src={getFullImageUrl(item.product.thumbnailUrl)}
                            alt={item.product.name}
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                          />
                        </div>
                      </Link>

                      {/* Info & Controls */}
                      <div className="flex-1 flex flex-col sm:flex-row gap-4">
                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-center">
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="text-base sm:text-lg font-semibold text-slate-800 hover:text-blue-600 mb-1"
                          >
                            {item.product.name}
                          </Link>

                          {item.sku.attributes && Object.keys(item.sku.attributes).length > 0 && (
                            <p className="text-sm text-slate-500 mb-3">
                              {formatAttributes(item.sku.attributes)}
                            </p>
                          )}

                          {item.sku.stock < 10 && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                               <AlertCircle className="w-3 h-3" />
                               Chỉ còn {item.sku.stock} sản phẩm
                            </div>
                          )}
                        </div>

                        {/* Price & Quantity & Actions */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4 sm:min-w-[120px]">
                           <div className="text-right">
                            <div className="font-bold text-red-600 text-lg">
                              {formatCurrency(item.sku.price)}
                            </div>
                            {item.sku.originalPrice && item.sku.originalPrice > item.sku.price && (
                              <div className="text-sm text-slate-400 line-through">
                                {formatCurrency(item.sku.originalPrice)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border shadow-sm">
                              <button
                                disabled={item.quantity <= 1 || updateItemMutation.isPending}
                                onClick={() => handleUpdateQuantity(item.skuId, item.quantity, -1, item.sku.stock)}
                                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-semibold w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                disabled={item.quantity >= item.sku.stock || updateItemMutation.isPending}
                                onClick={() => handleUpdateQuantity(item.skuId, item.quantity, 1, item.sku.stock)}
                                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemove(item.skuId)}
                              disabled={removeItemMutation.isPending}
                              className="text-slate-400 hover:text-red-500 transition-colors p-2"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Tóm tắt đơn hàng</h3>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-medium text-slate-800">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pb-4 border-b">
                    <span>Phí vận chuyển</span>
                    <span className="text-slate-400 italic">Chưa tính</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-slate-800">Tổng cộng</span>
                    <span className="text-2xl font-bold text-red-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="text-right text-xs text-slate-500 mt-1">
                    (Đã bao gồm VAT nếu có)
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm mb-3"
                  asChild
                  disabled={cartItems.length === 0}
                >
                  <Link to="/checkout">Tiến hành thanh toán</Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  <Link to="/">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Remove Single Item Confirm Dialog */}
        <Dialog open={itemToRemove !== null} onOpenChange={(open) => !open && setItemToRemove(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xóa sản phẩm</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setItemToRemove(null)}>
                Hủy bỏ
              </Button>
              <Button variant="destructive" onClick={confirmRemoveItem}>
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear All Confirm Dialog */}
        <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xóa toàn bộ giỏ hàng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa TẤT CẢ sản phẩm khỏi giỏ hàng? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                Hủy bỏ
              </Button>
              <Button variant="destructive" onClick={confirmClearCart}>
                Xóa tất cả
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

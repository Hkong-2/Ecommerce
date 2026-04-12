import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../../../stores/store';
import { setCartDrawerOpen } from '../../../stores/cartSlice';
import { useCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation } from '../../../hooks/useCart';
import { getFullImageUrl } from '../../../utils/image';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const CartDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state: RootState) => state.cart.isCartDrawerOpen);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { data: cartItems, isLoading } = useCartQuery(isAuthenticated);
  const updateItemMutation = useUpdateCartItemMutation();
  const removeItemMutation = useRemoveCartItemMutation();

  // Close drawer on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(setCartDrawerOpen(false));
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [dispatch]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => dispatch(setCartDrawerOpen(false));

  const handleUpdateQuantity = (skuId: number, currentQuantity: number, change: number, stock: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0 && newQuantity <= stock) {
      updateItemMutation.mutate({ skuId, quantity: newQuantity });
    }
  };

  const handleRemove = (skuId: number) => {
    removeItemMutation.mutate(skuId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const calculateTotal = () => {
    return cartItems?.reduce((total: number, item: any) => total + item.sku.price * item.quantity, 0) || 0;
  };

  const formatAttributes = (attributes: Record<string, any>) => {
    return Object.values(attributes).join(' - ');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-800">Giỏ hàng của bạn</h2>
            {cartItems && cartItems.length > 0 && (
               <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                 {cartItems.length} sản phẩm
               </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isAuthenticated ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                 <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-500">Bạn cần đăng nhập để xem giỏ hàng.</p>
              <Button
                onClick={() => {
                  handleClose();
                  navigate('/login');
                }}
              >
                Đăng nhập ngay
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !cartItems || cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                 <ShoppingBag className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-800">Giỏ hàng trống</h3>
              <p className="text-slate-500 text-sm">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
              <Button variant="outline" onClick={handleClose} className="mt-4">
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-3 bg-white border rounded-xl shadow-sm">
                  {/* Image */}
                  <Link to={`/product/${item.product.slug}`} onClick={handleClose} className="shrink-0">
                    <div className="w-20 h-20 rounded-lg bg-slate-50 border overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={getFullImageUrl(item.product.thumbnailUrl)}
                        alt={item.product.name}
                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      onClick={handleClose}
                      className="text-sm font-semibold text-slate-800 hover:text-blue-600 truncate mb-1"
                    >
                      {item.product.name}
                    </Link>

                    {item.sku.attributes && Object.keys(item.sku.attributes).length > 0 && (
                      <p className="text-xs text-slate-500 mb-2 truncate">
                        {formatAttributes(item.sku.attributes)}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-red-600 text-sm">
                        {formatCurrency(item.sku.price)}
                      </span>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border">
                        <button
                          disabled={item.quantity <= 1 || updateItemMutation.isPending}
                          onClick={() => handleUpdateQuantity(item.skuId, item.quantity, -1, item.sku.stock)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white rounded shadow-sm disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= item.sku.stock || updateItemMutation.isPending}
                          onClick={() => handleUpdateQuantity(item.skuId, item.quantity, 1, item.sku.stock)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white rounded shadow-sm disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete btn */}
                  <button
                    onClick={() => handleRemove(item.skuId)}
                    disabled={removeItemMutation.isPending}
                    className="shrink-0 text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && cartItems && cartItems.length > 0 && (
          <div className="border-t p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 font-medium">Tổng tiền tạm tính:</span>
              <span className="text-xl font-bold text-red-600">{formatCurrency(calculateTotal())}</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-white"
                onClick={() => {
                  handleClose();
                  navigate('/cart');
                }}
              >
                Xem giỏ hàng
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  handleClose();
                  navigate('/checkout'); // Placeholder for checkout
                }}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useOrderQuery } from '../../hooks/useOrders';
import { getFullImageUrl } from '../../utils/image';
import { CheckCircle2, Package, Truck, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);

  useEffect(() => {
    // Check if we just came from checkout success
    if (location.state?.showSuccessDialog) {
      setShowThankYouDialog(true);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const { data: order, isLoading, error } = useOrderQuery(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex flex-col items-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy đơn hàng</h2>
        <p className="text-slate-500 mb-6 mt-2">Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p>
        <Button asChild>
          <Link to="/">Quay về trang chủ</Link>
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING': return { text: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700', icon: Clock };
      case 'PROCESSING': return { text: 'Đang chuẩn bị hàng', color: 'bg-blue-100 text-blue-700', icon: Package };
      case 'SHIPPING': return { text: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-700', icon: Truck };
      case 'COMPLETED': return { text: 'Đã giao thành công', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
      case 'CANCELLED': return { text: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: AlertCircle };
      default: return { text: status, color: 'bg-slate-100 text-slate-700', icon: Clock };
    }
  };

  const StatusIcon = getStatusDisplay(order.status).icon;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 mb-6 items-center">
          <Link to="/profile" className="hover:text-blue-600">Tài khoản</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 font-medium">Chi tiết đơn hàng</span>
        </nav>

        {/* Order Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Đơn hàng <span className="text-blue-600">#{order.orderCode}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                 hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
              })}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-semibold text-sm ${getStatusDisplay(order.status).color}`}>
            <StatusIcon className="w-5 h-5" />
            {getStatusDisplay(order.status).text}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:col-span-2">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Địa chỉ nhận hàng</h3>
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">{order.address.receiverName}</p>
              <p className="text-slate-600">SĐT: {order.address.receiverPhone}</p>
              <p className="text-slate-600">
                {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.city}
              </p>
            </div>
            {order.note && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-800"><span className="font-semibold">Ghi chú:</span> {order.note}</p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Hình thức thanh toán</h3>
             <p className="text-slate-700 font-medium mb-1">
               {order.paymentMethod === 'COD' ? 'Thanh toán tiền mặt khi nhận hàng' : 'Thanh toán Online (VNPAY)'}
             </p>
             <p className={`text-sm font-semibold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
               Trạng thái: {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
             </p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Sản phẩm đã đặt</h3>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <Link to={item.sku?.product?.slug ? `/product/${item.sku.product.slug}` : '#'} className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl p-2 shrink-0">
                  {item.sku?.product?.thumbnailUrl ? (
                    <img
                      src={getFullImageUrl(item.sku.product.thumbnailUrl)}
                      alt={item.productNameSnapshot}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 rounded flex items-center justify-center text-slate-400">Ảnh</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <Link to={item.sku?.product?.slug ? `/product/${item.sku.product.slug}` : '#'} className="font-semibold text-slate-800 hover:text-blue-600 truncate mb-1">
                    {item.productNameSnapshot}
                  </Link>
                  <p className="text-sm text-slate-500 mb-2">
                    {item.skuAttributesSnapshot ? Object.values(item.skuAttributesSnapshot).join(' - ') : ''}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">SL: {item.quantity}</span>
                    <span className="font-bold text-slate-800">{formatCurrency(item.finalPrice)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-end">
          <div className="w-full md:w-1/2 space-y-3 text-sm">
             <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(order.totalAmount - order.shippingFee)}
                </span>
             </div>
             <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-slate-800">
                  {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
                </span>
             </div>
             <div className="flex justify-between items-center pt-4 border-t mt-2">
                <span className="font-bold text-slate-800 text-base">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-red-600">{formatCurrency(order.totalAmount)}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Thank you Dialog */}
      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent className="sm:max-w-[425px] text-center p-8">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Đặt hàng thành công!</DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              Cảm ơn bạn đã mua sắm tại DigiPro.<br/>
              Mã đơn hàng của bạn là <strong className="text-slate-800">{order?.orderCode}</strong>.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-slate-500 mt-4 mb-6">
            Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng và giao hàng cho bạn trong thời gian sớm nhất.
          </p>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowThankYouDialog(false)} className="bg-blue-600 hover:bg-blue-700 px-8">
              Xem chi tiết đơn hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

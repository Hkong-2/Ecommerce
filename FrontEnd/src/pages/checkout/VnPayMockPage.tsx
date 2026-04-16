import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

export function VnPayMockPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    if (!orderId || !amount) {
      toast.error('Thông tin thanh toán không hợp lệ');
      navigate('/');
    }
  }, [orderId, amount, navigate]);

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      // Mock call to backend IPN webhook
      await api.post(`/orders/${orderId}/payment-callback`);
      toast.success('Thanh toán thành công!');
      navigate('/order/success');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentCancel = () => {
    toast.error('Bạn đã huỷ thanh toán');
    navigate('/cart');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header VNPay */}
        <div className="bg-[#005BAA] p-6 text-center">
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            VNPAY<span className="text-[#ED1C24]">QR</span>
          </h1>
          <p className="text-blue-100 text-sm">Cổng thanh toán an toàn</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center space-y-2">
            <p className="text-slate-500 text-sm">Số tiền thanh toán</p>
            <p className="text-3xl font-bold text-blue-700">
              {amount ? formatCurrency(Number(amount)) : '0 ₫'}
            </p>
            <div className="text-sm font-medium text-slate-600 mt-2">
              Mã ĐH: {orderCode}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-700 leading-relaxed">
              Đây là trang giả lập thanh toán (Mock). Vui lòng chọn kết quả thanh toán bên dưới để tiếp tục.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold shadow-sm"
              onClick={handlePaymentSuccess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Giả lập: Thanh toán thành công
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-base text-slate-600 hover:bg-slate-50"
              onClick={handlePaymentCancel}
              disabled={isProcessing}
            >
              Huỷ thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

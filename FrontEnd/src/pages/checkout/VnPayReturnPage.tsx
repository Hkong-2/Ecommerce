import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api as axiosInstance } from '../../api/axios';
import { Loader2 } from 'lucide-react';

export function VnPayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await axiosInstance.get(`/payment/vnpay-return?${searchParams.toString()}`);
        const result = res.data;

        if (result.isSuccess) {
           navigate(`/order/success?orderCode=${result.orderCode}&vnp_TransactionNo=${result.transactionNo}`, { replace: true });
        } else {
           navigate(`/order/failed?orderCode=${result.orderCode}`, { replace: true });
        }
      } catch (error) {
        console.error('Lỗi xác thực VNPay', error);
        navigate('/order/failed', { replace: true });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (verifying) {
    return (
      <div className="container max-w-3xl py-32 px-4 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Đang xử lý thanh toán...</h2>
        <p className="text-slate-500">Vui lòng không đóng trình duyệt trong quá trình này.</p>
      </div>
    );
  }

  return null;
}

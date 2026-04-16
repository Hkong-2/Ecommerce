import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { XCircle, ArrowRight } from 'lucide-react';

export function OrderFailedPage() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  return (
    <div className="container max-w-3xl py-16 px-4 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-12 h-12 text-red-600" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
        Thanh toán thất bại!
      </h1>

      <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
        Rất tiếc, quá trình thanh toán của bạn không thành công hoặc đã bị hủy. Vui lòng thử lại.
      </p>

      {orderCode && (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-8 inline-block">
          <p className="text-sm text-slate-500 mb-1">Mã đơn hàng của bạn</p>
          <p className="font-semibold text-slate-800">{orderCode}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link to="/checkout">
            <ArrowRight className="w-4 h-4 mr-2" />
            Quay lại thanh toán
          </Link>
        </Button>
      </div>
    </div>
  );
}

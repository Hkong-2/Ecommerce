import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';

export function OrderSuccessPage() {
  return (
    <div className="container max-w-3xl py-16 px-4 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
        Đặt hàng thành công!
      </h1>

      <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
        Cảm ơn bạn đã mua sắm tại DigiPro. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link to="/">
            Tiếp tục mua sắm
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/profile">
            <Package className="w-4 h-4 mr-2" />
            Theo dõi đơn hàng
          </Link>
        </Button>
      </div>
    </div>
  );
}

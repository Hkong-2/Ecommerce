import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features / Guarantees row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-800 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
               <Truck className="w-6 h-6" />
             </div>
             <div>
                <h4 className="font-bold text-white">Miễn phí giao hàng</h4>
                <p className="text-sm text-slate-400">Cho mọi đơn hàng trên 500k</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-800 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <div>
                <h4 className="font-bold text-white">Bảo hành 12 tháng</h4>
                <p className="text-sm text-slate-400">Chính hãng 100% toàn quốc</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-800 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
               <RefreshCw className="w-6 h-6" />
             </div>
             <div>
                <h4 className="font-bold text-white">Đổi trả dễ dàng</h4>
                <p className="text-sm text-slate-400">7 ngày đổi trả miễn phí</p>
             </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-12 border-b border-slate-800">
          
          {/* Brand & Contact */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                DigiPro
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hệ thống bán lẻ điện thoại di động, máy tính bảng, đồng hồ thông minh và phụ kiện chính hãng, uy tín hàng đầu Việt Nam.
            </p>
            <div className="space-y-3">
               <div className="flex items-start gap-3 text-sm text-slate-400">
                 <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                 <span> TP.HCM</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-400">
                 <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                 <span>1900 6789 (1000đ/phút)</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-400">
                 <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                 <span>support@techstore.vn</span>
               </div>
            </div>
          </div>

          {/* About Us */}
          <div>
            <h3 className="font-bold text-white text-lg mb-6">Về chúng tôi</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Giới thiệu DigiPro</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Tuyển dụng</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Gửi góp ý, khiếu nại</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Tìm siêu thị (100+ shop)</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Xem bản mobile</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white text-lg mb-6">Hỗ trợ khách hàng</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Chính sách bảo hành</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Giao hàng & Thanh toán</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Hướng dẫn mua trả góp</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Social & Payment */}
          <div>
            <h3 className="font-bold text-white text-lg mb-6">Kết nối với chúng tôi</h3>


            <h3 className="font-bold text-white text-lg mb-6">Phương thức thanh toán</h3>
            <div className="flex flex-wrap gap-2">
               <div className="w-12 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">VISA</div>
               <div className="w-12 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">MASTER</div>
               <div className="w-12 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] font-bold text-blue-600">VNPAY</div>
               <div className="w-12 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] font-bold text-pink-600">MOMO</div>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
           <p>&copy; {new Date().getFullYear()} DigiPro. Tất cả quyền được bảo lưu.</p>
           <p>Thiết kế bởi DigiPro Team</p>
        </div>
      </div>
    </footer>
  );
};

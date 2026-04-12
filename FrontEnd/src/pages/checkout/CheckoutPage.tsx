import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCartQuery } from '../../hooks/useCart';
import { useAddressesQuery, useAddAddress } from '../../hooks/useAddress';
import { useCheckoutMutation } from '../../hooks/useOrders';
import { getFullImageUrl } from '../../utils/image';
import { Button } from '../../components/ui/button';
import { ChevronRight, MapPin, Plus, CreditCard, Banknote, ShieldCheck, Ticket } from 'lucide-react';
import { AddressForm } from './AddressForm';
import { useSelector } from 'react-redux';
import type { RootState } from '../../stores/store';
import { Input } from '../../components/ui/input';

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Get selected items from previous step
  const selectedCartItemIds = useMemo(() => {
    return (location.state?.selectedCartItemIds as number[]) || [];
  }, [location.state?.selectedCartItemIds]);

  // Redirect if accessed without selecting items
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
    } else if (selectedCartItemIds.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, selectedCartItemIds, navigate]);

  const { data: cartItems, isLoading: isLoadingCart } = useCartQuery(isAuthenticated);
  const { data: addresses, isLoading: isLoadingAddresses } = useAddressesQuery();
  const createAddressMutation = useAddAddress();
  const checkoutMutation = useCheckoutMutation();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [note, setNote] = useState('');
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

  // Automatically select default address if available
  useEffect(() => {
    if (addresses && addresses.length > 0 && selectedAddressId === null) {
      const defaultAddr = addresses.find((a: any) => a.isDefault);
      setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const selectedItemsDetails = useMemo(() => {
    if (!cartItems) return [];
    return cartItems.filter(item => selectedCartItemIds.includes(item.id));
  }, [cartItems, selectedCartItemIds]);

  const subTotal = useMemo(() => {
    return selectedItemsDetails.reduce((total, item) => total + (item.sku.price * item.quantity), 0);
  }, [selectedItemsDetails]);

  const shippingFee = useMemo(() => {
    if (subTotal >= 10000000) return 0; // Freeship over 10M

    const selectedAddr = addresses?.find((a: any) => a.id === selectedAddressId);
    if (!selectedAddr) return 40000;

    if (selectedAddr.city.includes('Hà Nội') || selectedAddr.city.includes('Hồ Chí Minh')) {
      return 20000;
    }
    return 40000;
  }, [subTotal, addresses, selectedAddressId]);

  const totalAmount = subTotal + shippingFee;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleSaveAddress = async (addressData: any) => {
    try {
      await createAddressMutation.mutateAsync(addressData);
      setIsAddressFormOpen(false);
    } catch (error) {
      console.error('Failed to save address', error);
      alert('Không thể lưu địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    try {
      const order = await checkoutMutation.mutateAsync({
        cartItemIds: selectedCartItemIds,
        addressId: selectedAddressId,
        paymentMethod,
        note
      });

      // Navigate to order detail page with success state
      navigate(`/order/${order.id}`, { state: { showSuccessDialog: true } });
    } catch (error: any) {
      console.error('Checkout failed', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
  };

  if (isLoadingCart || isLoadingAddresses) {
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
          <Link to="/cart" className="hover:text-blue-600">Giỏ hàng</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 font-medium">Thanh toán</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Form Details */}
          <div className="flex-1 space-y-6">

            {/* Address Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Địa chỉ giao hàng
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => setIsAddressFormOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Thêm địa chỉ mới
                </Button>
              </div>

              {!addresses || addresses.length === 0 ? (
                 <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                   <p className="text-slate-500 mb-3">Bạn chưa có địa chỉ giao hàng nào.</p>
                   <Button onClick={() => setIsAddressFormOpen(true)}>Thêm ngay</Button>
                 </div>
              ) : (
                <div className="grid gap-4">
                  {addresses.map((address: any) => (
                    <label
                      key={address.id}
                      className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddressId === address.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{address.receiverName}</span>
                          <span className="text-slate-400">|</span>
                          <span className="font-medium text-slate-700">{address.receiverPhone}</span>
                          {address.isDefault && (
                             <span className="text-[10px] uppercase font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Mặc định</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {address.street}, {address.ward}, {address.district}, {address.city}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Phương thức thanh toán
               </h2>

               <div className="grid gap-4">
                  <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <Banknote className="w-6 h-6 text-emerald-600 ml-4 mr-3" />
                    <span className="font-semibold text-slate-800">Thanh toán tiền mặt khi nhận hàng (COD)</span>
                  </label>

                  <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="VNPAY"
                      checked={paymentMethod === 'VNPAY'}
                      onChange={() => setPaymentMethod('VNPAY')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <img src="https://vnpay.vn/s1/vnpay/assets/images/logo-icon/logo-primary.svg" alt="VNPAY" className="h-6 ml-4 mr-3 object-contain" />
                    <span className="font-semibold text-slate-800">Thanh toán qua VNPAY (MOCK)</span>
                  </label>
               </div>
            </div>

            {/* Note Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Ghi chú đơn hàng</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm về đơn hàng, thời gian giao hàng mong muốn..."
                className="w-full rounded-lg border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border-t-4 border-blue-600">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Thông tin đơn hàng</h3>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedItemsDetails.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center p-1 border border-slate-100 shrink-0">
                       <img src={getFullImageUrl(item.product.thumbnailUrl)} alt={item.product.name} className="max-w-full max-h-full mix-blend-multiply" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate" title={item.product.name}>
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-slate-500 mt-1 truncate">
                        {item.sku.attributes ? Object.values(item.sku.attributes).join(' - ') : ''}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-500">SL: {item.quantity}</span>
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(item.sku.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher Mock */}
              <div className="mb-6 pb-6 border-b border-dashed border-slate-200">
                <div className="flex gap-2">
                  <Input placeholder="Nhập mã giảm giá..." className="text-sm" />
                  <Button variant="outline" className="shrink-0 text-blue-600 border-blue-200">Áp dụng</Button>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2">
                  <Ticket className="w-3 h-3" />
                  <span>Chưa có mã giảm giá nào được áp dụng</span>
                </div>
              </div>

              {/* Calculations */}
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính ({selectedCartItemIds.length} sản phẩm)</span>
                  <span className="font-medium text-slate-800">{formatCurrency(subTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-slate-800">
                    {shippingFee === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : formatCurrency(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-bold text-slate-800 text-base">Tổng thanh toán</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-red-600 block">{formatCurrency(totalAmount)}</span>
                    <span className="text-xs text-slate-500">(Đã bao gồm VAT nếu có)</span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md text-base h-12"
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending || !selectedAddressId}
              >
                {checkoutMutation.isPending ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Thanh toán an toàn & bảo mật 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddressForm
        isOpen={isAddressFormOpen}
        onClose={() => setIsAddressFormOpen(false)}
        onSave={handleSaveAddress}
      />
    </div>
  );
};

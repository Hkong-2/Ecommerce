import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { type RootState } from '../../stores/store';
import { openAddressModal } from '../../stores/uiSlice';
import { useCartQuery } from '../../hooks/useCart';
import { useProfile } from '../../hooks/useProfile';
import { useCalculateShippingFee, useCreateOrder } from '../../hooks/useOrders';
import { getFullImageUrl } from '../../utils/image';
import { Button } from '../../components/ui/button';
import { Loader2, Plus, MapPin, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { AddressModal } from '../profile/AddressModal';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';

export function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);

  // Queries
  const { data: cartItems = [], isLoading: isCartLoading } = useCartQuery(isAuthenticated);
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  // Mutations
  const { mutateAsync: calculateFee, isPending: isCalculatingFee } = useCalculateShippingFee();
  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  // State
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Set default address
  useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = profile.addresses.find(a => a.isDefault) || profile.addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [profile, selectedAddressId]);

  // Calculate Shipping Fee when address changes
  useEffect(() => {
    const fetchShippingFee = async () => {
      if (!selectedAddressId || !profile?.addresses) return;

      const address = profile.addresses.find(a => a.id === selectedAddressId);
      if (address?.districtId && address?.wardCode) {
        try {
          const res = await calculateFee({
            districtId: address.districtId,
            wardCode: address.wardCode
          });
          setShippingFee(res.fee);
        } catch (error) {
          console.error('Lỗi tính phí ship', error);
          setShippingFee(35000); // Fallback
        }
      } else {
         setShippingFee(35000); // Fallback if no full info
      }
    };

    fetchShippingFee();
  }, [selectedAddressId, profile?.addresses, calculateFee]);

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity * item.sku.price), 0);
  }, [cartItems]);

  const finalShippingFee = subtotal > 15000000 ? 0 : shippingFee;
  const totalAmount = subtotal + finalShippingFee;

  // Handlers
  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    try {
      const res = await createOrder({
        addressId: selectedAddressId,
        paymentMethod
      });

      if (res.paymentUrl) {
         window.location.href = res.paymentUrl; // Redirect to VNPay
      } else {
         navigate(`/order/success?orderCode=${res.order.orderCode}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatAttributes = (attributes: Record<string, any>) => {
    if (!attributes) return '';
    return Object.entries(attributes)
      .map(([, value]) => value)
      .join(' - ');
  };

  if (isCartLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <p className="text-slate-500 mb-8">Bạn cần có sản phẩm trong giỏ hàng để thanh toán</p>
        <Button asChild>
          <Link to="/">Quay lại mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 md:py-12 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">Thanh toán</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Form */}
        <div className="flex-1 w-full space-y-6">

          {/* Section 1: Address */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Địa chỉ giao hàng
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(openAddressModal(null))}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm địa chỉ mới
              </Button>
            </div>

            {profile?.addresses && profile.addresses.length > 0 ? (
              <RadioGroup
                value={selectedAddressId?.toString()}
                onValueChange={(val) => setSelectedAddressId(parseInt(val))}
                className="space-y-3"
              >
                {profile.addresses.map((address) => (
                  <div key={address.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${selectedAddressId === address.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <RadioGroupItem value={address.id.toString()} id={`addr-${address.id}`} className="mt-1" />
                    <Label htmlFor={`addr-${address.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">{address.receiverName}</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-600">{address.receiverPhone}</span>
                        {address.isDefault && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium ml-2">Mặc định</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 leading-relaxed">
                        {address.street}, {address.ward}, {address.district}, {address.city}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 mb-4">Bạn chưa có địa chỉ giao hàng nào</p>
                <Button onClick={() => dispatch(openAddressModal(null))}>
                  Thêm địa chỉ ngay
                </Button>
              </div>
            )}
          </section>

          {/* Section 2: Payment Method */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Phương thức thanh toán
             </h2>

             <RadioGroup
                value={paymentMethod}
                onValueChange={(val: any) => setPaymentMethod(val)}
                className="grid sm:grid-cols-2 gap-4"
              >
                {/* COD */}
                <div className="relative">
                  <RadioGroupItem value="COD" id="pay-cod" className="peer sr-only" />
                  <Label
                    htmlFor="pay-cod"
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-slate-100 bg-white cursor-pointer transition-all hover:border-blue-200 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-slate-800">Thanh toán khi nhận hàng</div>
                      <div className="text-xs text-slate-500 mt-1">COD - Nhận hàng rồi thanh toán</div>
                    </div>
                  </Label>
                </div>

                {/* VNPAY */}
                <div className="relative">
                  <RadioGroupItem value="VNPAY" id="pay-vnpay" className="peer sr-only" />
                  <Label
                    htmlFor="pay-vnpay"
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-slate-100 bg-white cursor-pointer transition-all hover:border-blue-200 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50"
                  >
                    <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                      {/* VNPAY Logo (Mock SVG/Text) */}
                      <span className="font-black text-2xl text-[#005BAA] tracking-tighter">VNPAY<span className="text-[#ED1C24]">QR</span></span>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-slate-800">Thanh toán VNPAY</div>
                      <div className="text-xs text-slate-500 mt-1">Quét mã QR / Thẻ ATM / Visa</div>
                    </div>
                  </Label>
                </div>
             </RadioGroup>
          </section>

        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Đơn hàng của bạn</h3>
            </div>

            <div className="p-6">
              {/* Product List */}
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg border border-slate-100 p-1 shrink-0">
                      <img
                        src={getFullImageUrl(item.product.thumbnailUrl)}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800 truncate" title={item.product.name}>
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatAttributes(item.sku.attributes)}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-red-600">{formatCurrency(item.sku.price)}</span>
                        <span className="text-xs text-slate-500">x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="mb-6" />

              {/* Totals */}
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-slate-800">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Phí vận chuyển
                    {isCalculatingFee && <Loader2 className="w-3 h-3 animate-spin" />}
                  </span>
                  {selectedAddressId ? (
                    <span className="font-medium text-slate-800">
                      {finalShippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : formatCurrency(finalShippingFee)}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Chưa tính</span>
                  )}
                </div>
                {subtotal > 15000000 && shippingFee > 0 && (
                  <div className="text-right text-xs text-green-600">
                    (Đã giảm {formatCurrency(shippingFee)} phí ship do đơn {'>'} 15tr)
                  </div>
                )}

                <Separator className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-base">Tổng thanh toán</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="text-right text-xs text-slate-500 mt-1">
                  (Đã bao gồm VAT nếu có)
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCheckout}
                disabled={isCreatingOrder || !selectedAddressId}
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Đặt hàng
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Profile Address Modal */}
      {profile?.addresses && <AddressModal addresses={profile.addresses} />}
    </div>
  );
}

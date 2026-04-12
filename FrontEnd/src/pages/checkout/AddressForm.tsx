import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: any) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({ isOpen, onClose, onSave }) => {
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('https://provinces.open-api.vn/api/p/')
        .then((res) => res.json())
        .then((data) => setProvinces(data))
        .catch((err) => console.error('Failed to fetch provinces', err));
    }
  }, [isOpen]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    setCity(provinceName);
    setDistrict('');
    setWard('');
    setWards([]);

    const selectedProvince = provinces.find((p) => p.name === provinceName);
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts))
        .catch((err) => console.error('Failed to fetch districts', err));
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.value;
    setDistrict(districtName);
    setWard('');

    const selectedDistrict = districts.find((d) => d.name === districtName);
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards))
        .catch((err) => console.error('Failed to fetch wards', err));
    } else {
      setWards([]);
    }
  };

  const handleSave = () => {
    if (!receiverName || !receiverPhone || !street || !city || !district || !ward) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }

    onSave({
      receiverName,
      receiverPhone,
      street,
      city,
      district,
      ward,
      isDefault: false
    });

    // Reset form
    setReceiverName('');
    setReceiverPhone('');
    setStreet('');
    setCity('');
    setDistrict('');
    setWard('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm địa chỉ giao hàng mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="receiverName">Họ và tên người nhận</Label>
              <Input
                id="receiverName"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receiverPhone">Số điện thoại</Label>
              <Input
                id="receiverPhone"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                placeholder="VD: 0987654321"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tỉnh/Thành phố</Label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={city}
              onChange={handleCityChange}
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Quận/Huyện</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={district}
                onChange={handleDistrictChange}
                disabled={!city}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Phường/Xã</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                disabled={!district}
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="street">Số nhà, Tên đường</Label>
            <Input
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="VD: 123 Đường Lê Lợi"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Lưu địa chỉ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

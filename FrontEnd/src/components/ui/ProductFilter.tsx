import { useState } from 'react';

const PRICE_OPTIONS = [
  { value: '5000000', label: '5.000.000đ' },
  { value: '10000000', label: '10.000.000đ' },
  { value: '15000000', label: '15.000.000đ' },
  { value: '20000000', label: '20.000.000đ' },
  { value: '25000000', label: '25.000.000đ' },
  { value: '30000000', label: '30.000.000đ' },
  { value: '40000000', label: '40.000.000đ' },
  { value: '50000000', label: '50.000.000đ' },
  { value: '60000000', label: '60.000.000đ' },
  { value: '70000000', label: '70.000.000đ' },
  { value: '80000000', label: '80.000.000đ' },
  { value: '90000000', label: '90.000.000đ' },
  { value: '100000000', label: '100.000.000đ' },
];

interface ProductFilterProps {
  onFilterChange: (filters: { minPrice?: number; maxPrice?: number; sortBy?: string }) => void;
  initialFilters?: { minPrice?: number; maxPrice?: number; sortBy?: string };
}

export function ProductFilter({ onFilterChange, initialFilters }: ProductFilterProps) {
  const [minPrice, setMinPrice] = useState<string>(initialFilters?.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters?.maxPrice?.toString() || '');
  const [sortBy, setSortBy] = useState<string>(initialFilters?.sortBy || '');

  const handleApply = () => {
    onFilterChange({
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      sortBy: sortBy || undefined,
    });
  };

  const handleClear = () => {
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
    onFilterChange({ minPrice: undefined, maxPrice: undefined, sortBy: undefined });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 sticky top-24">
      
      <div>
        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">Bộ lọc sản phẩm</h3>
      </div>

      {/* Sorting */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Sắp xếp theo</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all hover:bg-slate-100 cursor-pointer"
        >
          <option value="">Mặc định</option>
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-4">
        <label className="text-sm font-bold text-slate-700">Mức giá</label>
        
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Từ</span>
          <select
            value={minPrice}
            onChange={(e) => {
              const val = e.target.value;
              setMinPrice(val);
              if (val && maxPrice && parseInt(val) > parseInt(maxPrice)) {
                setMaxPrice(val);
              }
            }}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all hover:bg-slate-100 cursor-pointer"
          >
            <option value="">0đ</option>
            {PRICE_OPTIONS.map((opt) => (
              <option 
                key={opt.value} 
                value={opt.value}
                disabled={maxPrice ? parseInt(opt.value) > parseInt(maxPrice) : false}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đến</span>
          <select
            value={maxPrice}
            onChange={(e) => {
              const val = e.target.value;
              setMaxPrice(val);
              if (val && minPrice && parseInt(val) < parseInt(minPrice)) {
                setMinPrice(val);
              }
            }}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all hover:bg-slate-100 cursor-pointer"
          >
            <option value="">Không giới hạn</option>
            {PRICE_OPTIONS.map((opt) => (
              <option 
                key={opt.value} 
                value={opt.value}
                disabled={minPrice ? parseInt(opt.value) < parseInt(minPrice) : false}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={handleApply}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/30"
        >
          Áp dụng
        </button>
        <button
          onClick={handleClear}
          className="w-full px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all"
        >
          Xóa bộ lọc
        </button>
      </div>

    </div>
  );
}

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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-end md:items-center gap-4">

      {/* Price Range */}
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap min-w-[60px]">Giá từ:</label>
        <select
          value={minPrice}
          onChange={(e) => {
            const val = e.target.value;
            setMinPrice(val);
            if (val && maxPrice && parseInt(val) > parseInt(maxPrice)) {
              setMaxPrice(val);
            }
          }}
          className="w-full sm:w-40 px-3 py-2 border rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <span className="text-slate-400 hidden sm:inline">-</span>
        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap min-w-[60px] sm:hidden">Đến:</label>
        <select
          value={maxPrice}
          onChange={(e) => {
            const val = e.target.value;
            setMaxPrice(val);
            if (val && minPrice && parseInt(val) < parseInt(minPrice)) {
              setMinPrice(val);
            }
          }}
          className="w-full sm:w-40 px-3 py-2 border rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Sorting */}
      <div className="flex-1 flex items-center gap-2 w-full">
        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Sắp xếp:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Mặc định</option>
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={handleApply}
          className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
        >
          Lọc
        </button>
        <button
          onClick={handleClear}
          className="flex-1 md:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
        >
          Xóa lọc
        </button>
      </div>

    </div>
  );
}

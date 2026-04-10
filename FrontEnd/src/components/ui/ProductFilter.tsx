import { useState } from 'react';

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
        <input
          type="number"
          placeholder="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full sm:w-32 px-3 py-2 border rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-slate-400 hidden sm:inline">-</span>
        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap min-w-[60px] sm:hidden">Đến:</label>
        <input
          type="number"
          placeholder="Tối đa"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full sm:w-32 px-3 py-2 border rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

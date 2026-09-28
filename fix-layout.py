import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''    return (
      <div className="space-y-12">
        <ProductFilter onFilterChange={setFilters} initialFilters={filters} />

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">'''

replacement = '''    return (
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: Filters */}
        <div className="w-full lg:w-1/4 flex-shrink-0">
          <ProductFilter onFilterChange={setFilters} initialFilters={filters} />
        </div>

        {/* Right Content: Brands + Product Grid */}
        <div className="w-full lg:w-3/4 space-y-8">
          {/* Brands Filter placeholder */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide items-center border-b border-slate-200">
            <button 
              onClick={() => setFilters(prev => ({...prev, brandId: undefined}))} 
              className={h-14 px-6 min-w-[100px] rounded-xl border font-bold text-sm whitespace-nowrap transition-all flex items-center justify-center flex-shrink-0 }
            >
              Tất cả
            </button>
            {brands.map(brand => (
              <button 
                key={brand.id} 
                onClick={() => setFilters(prev => ({...prev, brandId: brand.id}))} 
                className={h-14 px-6 min-w-[120px] rounded-xl border font-bold text-sm whitespace-nowrap transition-all flex items-center justify-center flex-shrink-0 }
              >
                {brand.logoUrl ? (
                   <img src={getFullImageUrl(brand.logoUrl)} alt={brand.name} className="h-8 object-contain" />
                ) : brand.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">'''

content = content.replace(target, replacement)

# Add closing div for Right Content
target2 = '''        {/* Load More Button */}'''
replacement2 = '''        </div> {/* End of Right Content */}
        {/* Load More Button */}'''
content = content.replace(target2, replacement2)

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          {/* Brands Filter placeholder */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide items-center">'''

if "['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Honor', 'Motorola', 'Nothing'].map" in content:
    # Regex replace the whole block
    content = re.sub(
        r"\{\['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Honor', 'Motorola', 'Nothing'\].map\(brand => \(.*?</button>\s*\)\)\}",
        '''<button 
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
            ))}''',
        content,
        flags=re.DOTALL
    )

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add ShoppingCart to lucide-react import
content = content.replace("import { Loader2, Smartphone } from 'lucide-react';", "import { Loader2, Smartphone, ShoppingCart } from 'lucide-react';")

# Find the Image Section inside the product card
target_image_section = '''                {/* Image Section */}
                <div className="aspect-square bg-gradient-to-b from-slate-50 to-white relative p-8 flex items-center justify-center">
                    {product.thumbnailUrl ? (
                        <img
                            src={getFullImageUrl(product.thumbnailUrl)}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" loading="lazy" decoding="async"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                            <Smartphone className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm">No Image</span>
                        </div>
                    )}
                </div>'''

replacement_image_section = '''                {/* Image Section */}
                <div className="aspect-square bg-gradient-to-b from-slate-50 to-white relative p-8 flex items-center justify-center overflow-hidden">
                    {product.thumbnailUrl ? (
                        <img
                            src={getFullImageUrl(product.thumbnailUrl)}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" loading="lazy" decoding="async"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                            <Smartphone className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm">No Image</span>
                        </div>
                    )}
                    
                    {/* Hover Quick Action Button */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-20 px-6">
                       <div className="w-full py-3 bg-slate-900/95 backdrop-blur-md text-white text-sm font-bold rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-black flex items-center justify-center gap-2 transform active:scale-95 transition-transform">
                         <ShoppingCart className="w-4 h-4" />
                         Xem chi tiết
                       </div>
                    </div>
                </div>'''

content = content.replace(target_image_section, replacement_image_section)

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

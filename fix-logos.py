import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert LOCAL_BRAND_LOGOS mapping at the top
content = content.replace(
    "export const HomePage: React.FC = () => {",
    "const LOCAL_BRAND_LOGOS: Record<string, string> = {\n  'apple': '/brands/apple.png',\n  'samsung': '/brands/samsung.png',\n  'xiaomi': '/brands/xiaomi.png',\n};\n\nexport const HomePage: React.FC = () => {"
)

# Replace the brand logo rendering logic
target = '''                {brand.logoUrl ? (
                   <img src={getFullImageUrl(brand.logoUrl)} alt={brand.name} className="h-8 object-contain" />
                ) : brand.name}'''

replacement = '''                {brand.logoUrl || LOCAL_BRAND_LOGOS[brand.name.toLowerCase()] ? (
                   <img src={brand.logoUrl ? getFullImageUrl(brand.logoUrl) : LOCAL_BRAND_LOGOS[brand.name.toLowerCase()]} alt={brand.name} className="h-8 object-contain" />
                ) : brand.name}'''

content = content.replace(target, replacement)

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

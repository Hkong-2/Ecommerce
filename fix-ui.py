import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Khám phá ngay button
# The exact text might have encoding issues, so we use regex.
button_block_regex = r'<div className="flex flex-wrap items-center justify-center gap-4">\s*<button.*?>\s*Khám phá ngay\s*</button>\s*</div>'
# Try with exact match first, if encoding is weird, just match the div class and button tags
button_block_regex_fallback = r'<div className="flex flex-wrap items-center justify-center gap-4">\s*<button className="px-10 py-4 bg-gradient-to-r.*?>.*?Kh.*?m ph.*? ngay.*?</button>\s*</div>'

content = re.sub(button_block_regex_fallback, '', content, flags=re.DOTALL | re.IGNORECASE)

# 2. Update getAllBrands
target_useeffect = '''  useEffect(() => {
    brandsApi.getAllBrands().then(setBrands).catch(console.error);
  }, []);'''

replacement_useeffect = '''  useEffect(() => {
    brandsApi.getAllBrands().then(apiBrands => {
      const seen = new Set();
      const filtered = [];
      for (const b of apiBrands) {
        const name = b.name.toLowerCase();
        if (name === 'google pixal') continue;
        if (!seen.has(name)) {
          seen.add(name);
          filtered.push(b);
        }
      }
      filtered.sort((a, b) => {
        const aHasLogo = a.logoUrl || LOCAL_BRAND_LOGOS[a.name.toLowerCase()] ? 1 : 0;
        const bHasLogo = b.logoUrl || LOCAL_BRAND_LOGOS[b.name.toLowerCase()] ? 1 : 0;
        return bHasLogo - aHasLogo;
      });
      setBrands(filtered);
    }).catch(console.error);
  }, []);'''

content = content.replace(target_useeffect, replacement_useeffect)

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'<Star key=\{i\} className=\{w-3\.5 h-3\.5 \} />', '''<Star key={i} className={`w-3.5 h-3.5 ${i < (product.id % 2 === 0 ? 5 : 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />''', content)

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

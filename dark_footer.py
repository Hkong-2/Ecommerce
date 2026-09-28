import re

with open('FrontEnd/src/components/layout/Footer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make it dark mode
content = content.replace('bg-white border-t border-slate-200', 'bg-slate-900 text-slate-300 border-t border-slate-800')
content = content.replace('border-slate-100', 'border-slate-800')
content = content.replace('text-slate-800', 'text-white')
content = content.replace('text-slate-500', 'text-slate-400')
content = content.replace('text-slate-600', 'text-slate-400')
content = content.replace('text-slate-700', 'text-slate-300')
content = content.replace('hover:text-blue-600', 'hover:text-blue-400')
content = content.replace('bg-blue-50 text-blue-600', 'bg-slate-800 text-blue-400')
content = content.replace('bg-slate-50 text-slate-700', 'bg-slate-800 text-slate-300')
content = content.replace('bg-pink-50 text-pink-600', 'bg-slate-800 text-pink-400')
content = content.replace('bg-red-50 text-red-600', 'bg-slate-800 text-red-400')
content = content.replace('hover:bg-slate-900', 'hover:bg-slate-700')
content = content.replace('bg-slate-100 rounded border border-slate-200', 'bg-slate-800 rounded border border-slate-700')

with open('FrontEnd/src/components/layout/Footer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

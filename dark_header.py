import re

with open('FrontEnd/src/components/layout/Header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Header wrapper
content = content.replace('bg-white border-b sticky top-0 z-50 shadow-sm', 'bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg')

# Category button
content = content.replace('text-slate-700 hover:bg-slate-100', 'text-slate-200 hover:bg-slate-800 hover:text-white')

# Search bar
content = content.replace('bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm', 'bg-slate-800 border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-900 text-white placeholder-slate-400 text-sm')

# Language toggle
content = content.replace('hover:bg-slate-100 text-slate-700', 'hover:bg-slate-800 text-slate-200')

# Cart icon wrapper
content = content.replace('hover:bg-slate-100 rounded-full', 'hover:bg-slate-800 rounded-full')
content = content.replace('text-slate-600', 'text-slate-200')

with open('FrontEnd/src/components/layout/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

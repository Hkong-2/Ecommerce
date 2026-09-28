import re

with open('FrontEnd/src/components/layout/Header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('hover:text-gray-600', 'hover:text-white')

with open('FrontEnd/src/components/layout/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

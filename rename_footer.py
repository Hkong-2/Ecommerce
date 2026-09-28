import re

with open('FrontEnd/src/components/layout/Footer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("TechStore", "DigiPro")

with open('FrontEnd/src/components/layout/Footer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

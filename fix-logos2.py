import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "'apple': '/brands/apple.png',",
    "'apple': '/brands/apple.png',\n  'iphone': '/brands/apple.png',"
)

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

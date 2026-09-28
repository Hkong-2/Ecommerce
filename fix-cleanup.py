import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove fake badge UI
content = re.sub(
    r'\s*\{\/\* FAKE BADGE UI \*\/\}.*?(?=\{\/\* Hover Quick Action Button)',
    '\n                    ',
    content,
    flags=re.DOTALL
)

# Remove fake rating stars
content = re.sub(
    r'\s*\{\/\* FAKE RATING STARS \*\/\}.*?(?=<div className="mt-4 pt-4 border-t)',
    '\n\n                    ',
    content,
    flags=re.DOTALL
)

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

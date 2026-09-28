import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { Loader2, Smartphone, ShoppingCart, Star } from 'lucide-react';", "import { Loader2, Smartphone, ShoppingCart } from 'lucide-react';")

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

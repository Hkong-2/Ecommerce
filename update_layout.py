import re

with open('FrontEnd/src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'Footer' not in content:
    content = content.replace("import { Header } from '../components/layout/Header';", "import { Header } from '../components/layout/Header';\nimport { Footer } from '../components/layout/Footer';")

# Replace old footer
target = '''      <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} E-commerce Platform. All rights reserved.
      </footer>'''

if target in content:
    content = content.replace(target, '      <Footer />')

with open('FrontEnd/src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

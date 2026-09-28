import re

with open('FrontEnd/src/components/layout/Footer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the import of Facebook, Twitter, etc.
content = content.replace("import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, ShieldCheck, Truck, RefreshCw } from 'lucide-react';", "import { MapPin, Phone, Mail, ShieldCheck, Truck, RefreshCw } from 'lucide-react';")

# Remove the social icons row
target = '''            <div className="flex gap-4 mb-8">
              <a href="#" className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                 <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                 <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all">
                 <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                 <Youtube className="w-5 h-5" />
              </a>
            </div>'''
content = content.replace(target, '')

with open('FrontEnd/src/components/layout/Footer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

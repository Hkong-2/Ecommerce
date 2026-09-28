import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        )}
      </div>
    );
  }'''
replacement = '''        )}
        </div>
      </div>
    );
  }'''
content = content.replace(target, replacement)

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

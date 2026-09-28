import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        </div> {/* End of Right Content */}
        {/* Load More Button */}'''

replacement = '''        {/* Load More Button */}'''
content = content.replace(target, replacement)

target2 = '''          )}
        </div>
      </div>
    );
  }'''

replacement2 = '''          )}
        </div> {/* End of Right Content */}
      </div>
    );
  }'''
content = content.replace(target2, replacement2)

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

import re

with open('FrontEnd/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the JSX backtick issue
content = content.replace("url($heroBg})", "`url()`")

# Remove unused state variables
content = re.sub(r'const \[heroProducts, setHeroProducts\].*?\n', '', content)
content = re.sub(r'const \[activeHeroIndex, setActiveHeroIndex\].*?\n', '', content)
content = re.sub(r'const \[isHeroPaused, setIsHeroPaused\].*?\n', '', content)

# Remove useEffect hooks related to heroProducts
content = re.sub(r'useEffect\(\(\) => \{\s*if \(heroProducts\.length < 2 \|\| isHeroPaused\) return;\s*const intervalId = window\.setInterval\(\(\) => \{\s*setActiveHeroIndex\(\(currentIndex\) => \(currentIndex \+ 1\) % heroProducts\.length\);\s*\}, 4500\);\s*return \(\) => window\.clearInterval\(intervalId\);\s*\}, \[heroProducts\.length, isHeroPaused\]\);\s*', '', content)

content = re.sub(r'useEffect\(\(\) => \{\s*if \(activeHeroIndex >= heroProducts\.length\) \{\s*setActiveHeroIndex\(0\);\s*\}\s*\}, \[activeHeroIndex, heroProducts\.length\]\);\s*', '', content)

# Remove showPrevious/Next
content = re.sub(r'const showPreviousHeroProduct = \(\) => \{\s*setActiveHeroIndex\(\(currentIndex\) =>\s*currentIndex === 0 \? heroProducts\.length - 1 : currentIndex - 1\s*\);\s*};\s*', '', content)
content = re.sub(r'const showNextHeroProduct = \(\) => \{\s*setActiveHeroIndex\(\(currentIndex\) => \(currentIndex \+ 1\) % heroProducts\.length\);\s*};\s*', '', content)
content = re.sub(r'const activeHeroProduct = heroProducts\[activeHeroIndex\];\s*', '', content)

# In fetchProducts, there is setHeroProducts
content = re.sub(r'const hasActiveFilters = Boolean\(filters\.minPrice \|\| filters\.maxPrice \|\| filters\.sortBy\);\s*if \(\!hasActiveFilters\) \{\s*setHeroProducts\(response\.data\.filter\(\(product\) => product\.thumbnailUrl\)\.slice\(0, 6\)\);\s*\}\s*', '', content)

# Unused imports: ChevronLeft, ChevronRight
content = content.replace("ChevronLeft, ChevronRight, ", "")
content = content.replace(", ShieldCheck, Headphones, Zap", "")

with open('FrontEnd/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

import re

with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

# Imports removal
text = re.sub(r'import\s+\{.*?(WeeklyQuestion|Giveaway|Product).*?\}\s+from\s+"../types";', r'import { Game } from "../types";', text)
text = re.sub(r'import\s+\{.*?ProductSlider.*?\}\s+from\s+"../components/ProductSlider";', '', text)

# State removal
text = re.sub(r'const\s+\[activeQuestion,\s*setActiveQuestion\]\s*=\s*useState<WeeklyQuestion\s*\|\s*null>\(null\);', '', text)
text = re.sub(r'const\s+\[activeGiveaway,\s*setActiveGiveaway\]\s*=\s*useState<Giveaway\s*\|\s*null>\(null\);', '', text)
text = re.sub(r'const\s+\[products,\s*setProducts\]\s*=\s*useState<Product\[\]>\(\[\]\);', '', text)

# Remove onSnapshots inside useEffect
questions_snap = re.compile(r'const\s+qQuestions\s*=\s*query\(\s*collection\(db,\s*"weeklyQuestions"\),\s*orderBy\("createdAt",\s*"desc"\),\s*\);\s*const\s+unsubscribeQuestions\s*=\s*onSnapshot\(qQuestions,\s*\(snapshot\)\s*=>\s*\{.*?\},\s*\(error:\s*any\)\s*=>\s*\{\s*if\s*\(error\?.code\s*!==\s*"resource-exhausted"\)\s*\{\s*console\.error\("Questions\s*error",\s*error\);\s*\}\s*\}\s*\);', re.DOTALL)
text = questions_snap.sub('', text)

giveaways_snap = re.compile(r'const\s+qGiveaways\s*=\s*query\(\s*collection\(db,\s*"giveaways"\),\s*orderBy\("createdAt",\s*"desc"\),\s*\);\s*const\s+unsubscribeGiveaways\s*=\s*onSnapshot\(qGiveaways,\s*\(snapshot\)\s*=>\s*\{.*?\},\s*\(error:\s*any\)\s*=>\s*\{\s*if\s*\(error\?.code\s*!==\s*"resource-exhausted"\)\s*\{\s*console\.error\("Giveaways\s*error",\s*error\);\s*\}\s*\}\s*\);', re.DOTALL)
text = giveaways_snap.sub('', text)

products_snap = re.compile(r'const\s+qProducts\s*=\s*query\(\s*collection\(db,\s*"products"\),\s*orderBy\("createdAt",\s*"desc"\),\s*\);\s*const\s+unsubscribeProducts\s*=\s*onSnapshot\(qProducts,\s*\(snapshot\)\s*=>\s*\{.*?\},\s*\(error:\s*any\)\s*=>\s*\{\s*if\s*\(error\?.code\s*!==\s*"resource-exhausted"\)\s*\{\s*console\.error\("Products\s*error",\s*error\);\s*\}\s*\}\s*\);', re.DOTALL)
text = products_snap.sub('', text)

# Also remove from return () => { unsubscribe(); ... }
text = re.sub(r'unsubscribeQuestions\(\);\s*', '', text)
text = re.sub(r'unsubscribeGiveaways\(\);\s*', '', text)
text = re.sub(r'unsubscribeProducts\(\);\s*', '', text)

# UI removal
# Weekly Question
text = re.sub(r'\{activeQuestion\s*&&\s*\(\s*<motion\.div.*?</motion\.div>\s*\)\}', '', text, flags=re.DOTALL)
# Giveaway
text = re.sub(r'\{activeGiveaway\s*&&\s*\(\s*<motion\.div.*?</motion\.div>\s*\)\}', '', text, flags=re.DOTALL)
# Products
text = re.sub(r'\{products\.length\s*>\s*0\s*&&\s*\(\s*<div\s+className="mb-12">.*?</ProductSlider>\s*</div>\s*\)\}', '', text, flags=re.DOTALL)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)

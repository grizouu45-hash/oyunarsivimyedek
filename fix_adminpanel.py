import re

with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Imports
text = re.sub(r'import\s+\{.*?(WeeklyQuestion|Giveaway|Product).*?\}\s+from\s+"../types";', r'import { Game } from "../types";', text)

# State
text = re.sub(r'const\s+\[weeklyQuestions,\s*setWeeklyQuestions\].*?;', '', text)
text = re.sub(r'const\s+\[giveaways,\s*setGiveaways\].*?;', '', text)
text = re.sub(r'const\s+\[products,\s*setProducts\].*?;', '', text)
text = re.sub(r'const\s+\[isQuestionModalOpen,\s*setIsQuestionModalOpen\].*?;', '', text)
text = re.sub(r'const\s+\[editingQuestion,\s*setEditingQuestion\].*?;', '', text)
text = re.sub(r'const\s+\[questionFormData,\s*setQuestionFormData\].*?\);\s*\}\);\s*\}\);', '', text, flags=re.DOTALL) # Need to be careful here
# Instead of regex for complex state, I'll regex the whole declaration lines.
text = re.sub(r'const\s+\[isQuestionModalOpen.*?;\n', '', text)
text = re.sub(r'const\s+\[editingQuestion.*?;\n', '', text)
text = re.sub(r'const\s+\[questionFormData.*?\}\);\n', '', text, flags=re.DOTALL)

text = re.sub(r'const\s+\[isGiveawayModalOpen.*?;\n', '', text)
text = re.sub(r'const\s+\[editingGiveaway.*?;\n', '', text)
text = re.sub(r'const\s+\[giveawayFormData.*?\}\);\n', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+\[viewingGiveaway.*?;\n', '', text)

text = re.sub(r'const\s+\[isProductModalOpen.*?;\n', '', text)
text = re.sub(r'const\s+\[editingProduct.*?;\n', '', text)
text = re.sub(r'const\s+\[productFormData.*?\}\);\n', '', text, flags=re.DOTALL)


# useEffect onSnapshots
questions_snap = re.compile(r'const\s+q2\s*=\s*query\(.*?\}\s*\);\s*', re.DOTALL)
text = questions_snap.sub('', text)

giveaways_snap = re.compile(r'const\s+q3\s*=\s*query\(.*?\}\s*\);\s*', re.DOTALL)
text = giveaways_snap.sub('', text)

products_snap = re.compile(r'const\s+q4\s*=\s*query\(.*?\}\s*\);\s*', re.DOTALL)
text = products_snap.sub('', text)

text = re.sub(r'unsubscribe2\(\);\s*', '', text)
text = re.sub(r'unsubscribe3\(\);\s*', '', text)
text = re.sub(r'unsubscribe4\(\);\s*', '', text)

# Functions
text = re.sub(r'const\s+handleQuestionSubmit.*?setIsQuestionModalOpen\(false\);\n\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+handleQuestionDelete.*?console\.error\(e\);\n\s*\}\n\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+openAddQuestionModal.*?setIsQuestionModalOpen\(true\);\n\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+openEditQuestionModal.*?setIsQuestionModalOpen\(true\);\n\s*\}', '', text, flags=re.DOTALL)

text = re.sub(r'const\s+handleGiveawaySubmit.*?setIsGiveawayModalOpen\(false\);\n\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+handleGiveawayDelete.*?console\.error\(e\);\n\s*\}\n\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+openAddGiveawayModal.*?setIsGiveawayModalOpen\(true\);\n\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+openEditGiveawayModal.*?setIsGiveawayModalOpen\(true\);\n\s*\}', '', text, flags=re.DOTALL)

text = re.sub(r'const\s+handleProductSubmit.*?setIsProductModalOpen\(false\);\n\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+handleProductDelete.*?console\.error\(e\);\n\s*\}\n\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+openAddProductModal.*?setIsProductModalOpen\(true\);\n\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+openEditProductModal.*?setIsProductModalOpen\(true\);\n\s*\}', '', text, flags=re.DOTALL)


# UI blocks
# Haftanın sorusu
text = re.sub(r'<div\s+className="mt-12\s+flex\s+items-center\s+justify-between\s+mb-8">.*?Haftanın\s+Sorusu\s*</div>.*?<div\s+className="mb-12">.*?</div>\s*</div>\s*\)\}', '', text, flags=re.DOTALL)

# Çekilişler
text = re.sub(r'<div\s+className="mt-12\s+flex\s+items-center\s+justify-between\s+mb-8">.*?Çekilişler\s*</div>.*?<div\s+className="mb-12">.*?</div>\s*</div>\s*\)\}', '', text, flags=re.DOTALL)

# Ürünler
text = re.sub(r'<div\s+className="mt-12\s+flex\s+items-center\s+justify-between\s+mb-8">.*?Ürünler\s*\(Hemen\s+Satın\s+Al\)\s*</div>.*?<div\s+className="mb-12">.*?</div>\s*</div>\s*\)\}', '', text, flags=re.DOTALL)

# Modals
text = re.sub(r'\{isQuestionModalOpen\s*&&\s*\(.*?</motion\.div>\s*</div>\s*\)\}', '', text, flags=re.DOTALL)
text = re.sub(r'\{isGiveawayModalOpen\s*&&\s*\(.*?</motion\.div>\s*</div>\s*\)\}', '', text, flags=re.DOTALL)
text = re.sub(r'\{viewingGiveaway\s*&&\s*\(.*?</motion\.div>\s*</div>\s*\)\}', '', text, flags=re.DOTALL)
text = re.sub(r'\{isProductModalOpen\s*&&\s*\(.*?</motion\.div>\s*</div>\s*\)\}', '', text, flags=re.DOTALL)

# Try writing to a temp file and comparing size
with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(text)

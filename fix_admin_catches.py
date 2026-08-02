import re

with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Remove dangling catch blocks
text = re.sub(r'\s*catch\s*\(error:\s*any\)\s*\{\s*console\.error\("Submit (question|giveaway|product) error:".*?\}\s*\};\s*', '', text, flags=re.DOTALL)
text = re.sub(r'\s*const\s+handleQuestionDelete\s*=\s*async\s*\(id:\s*string\)\s*=>\s*\{.*?\}\s*\};\s*', '', text, flags=re.DOTALL)
text = re.sub(r'\s*const\s+handleGiveawayDelete\s*=\s*async\s*\(id:\s*string\)\s*=>\s*\{.*?\}\s*\};\s*', '', text, flags=re.DOTALL)
text = re.sub(r'\s*const\s+handleProductDelete\s*=\s*async\s*\(id:\s*string\)\s*=>\s*\{.*?\}\s*\};\s*', '', text, flags=re.DOTALL)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(text)

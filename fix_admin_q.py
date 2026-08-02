import re

with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

text = re.sub(r'const\s+\[editingQuestion,\s*setEditingQuestion\].*?\s*null,\s*\);', '', text, flags=re.DOTALL)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(text)

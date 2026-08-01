import re
with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()
idx = text.find('isCategoryModalOpen && (')
print("Closing tags before modal:")
print(text[idx-50:idx])

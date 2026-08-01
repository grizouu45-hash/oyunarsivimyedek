with open('src/pages/AdminPanel.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('                    ))}</div>', '                    ))}\n                  </select>\n                </div>')

with open('src/pages/AdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

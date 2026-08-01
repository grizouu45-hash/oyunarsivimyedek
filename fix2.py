import re

with open('src/pages/AdminPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('</option>\n                    ))}</div>', '</option>\n                    ))}\n                  </select>\n                </div>')

with open('src/pages/AdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

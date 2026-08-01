with open('src/pages/AdminPanel.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
text = re.sub(r'\}\)\}\s*\<\/div>', '}))}\n                  </select>\n                </div>', text)

with open('src/pages/AdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

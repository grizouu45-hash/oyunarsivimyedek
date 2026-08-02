with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

text = text.replace('{isAdminUser(user) && (\n          <>\n        </main>', '</main>')

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(text)

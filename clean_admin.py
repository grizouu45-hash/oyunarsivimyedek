import re

with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

# I want to remove everything from `<div className="mt-12 flex items-center justify-between mb-8">` where it says Haftanın Sorusu, down to the end of the products table before `</main>`.

start_idx = text.find('<div className="mt-12 flex items-center justify-between mb-8">')
end_idx = text.find('</main>')

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + text[end_idx:]

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(text)

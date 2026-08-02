with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()
text = text.replace('{/* Kategoriler */}}', '{/* Kategoriler */}')
with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)

with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

idx = text.find('</main>')
if idx != -1:
    print("Found closing main at", idx)
    print(text[idx:idx+150])

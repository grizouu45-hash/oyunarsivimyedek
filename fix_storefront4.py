import re

with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

# Remove Giveaway UI
ui_regex = re.compile(r'\{\s*/\*\s*Çekiliş\s*\*/\s*\}\s*\{activeGiveaway\s*&&\s*\(.*?</form>\s*\)\}\s*</div>\s*</div>\s*\)\}\s*', re.DOTALL)
text = ui_regex.sub('', text)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)

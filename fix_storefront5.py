import re

with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

# Remove totalVotesCount
text = re.sub(r'const\s+totalVotesCount\s*=\s*activeQuestion\?\.[^\n]+:\s*0;\s*', '', text)

# Remove ProductSlider entirely (or just the usage of `...products`)
text = re.sub(r',\s*\.\.\.products', '', text)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)

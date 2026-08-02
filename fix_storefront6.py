import re

with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

# Remove totalVotesCount
text = re.sub(r'const\s+totalVotesCount.*?:\s*0;\s*', '', text, flags=re.DOTALL)

# Remove ProductSlider usage
text = re.sub(r'<ProductSlider\s+products=\{\[.*?\}\]\}\s*/>', '', text, flags=re.DOTALL)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)

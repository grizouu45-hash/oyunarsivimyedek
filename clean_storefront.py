import re

with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

# Remove getVotePercentages and related vars
text = re.sub(r'const\s+getVotePercentages\s*=\s*\(\)\s*=>\s*\{.*?\}\s*;\s*', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+percentages\s*=\s*getVotePercentages\(\);\s*', '', text)
text = re.sub(r'const\s+totalVotesCount\s*=\s*activeQuestion\?\.[^\n]+:\s*0;\s*', '', text)
text = re.sub(r'const\s+userVoteIndex\s*=\s*auth\.currentUser[^;]+;\s*', '', text, flags=re.DOTALL)

# Remove usage of ProductSlider
text = re.sub(r'<div\s+className="mb-12">\s*<ProductSlider\s+products=\{products\}\s*/>\s*</div>', '', text, flags=re.DOTALL)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)

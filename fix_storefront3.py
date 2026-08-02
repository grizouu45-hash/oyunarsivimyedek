import re

with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

# Remove remaining Giveaway code
text = re.sub(r'const\s+userParticipatedGiveaway.*?activeGiveaway\.participants\[auth\.currentUser\.uid\];', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+handleGiveawaySubmit\s*=\s*async\s*\(e:\s*React\.FormEvent\)\s*=>\s*\{.*?catch.*?\}\s*\};', '', text, flags=re.DOTALL)
text = re.sub(r'\{activeGiveaway\s*&&\s*\(\s*<div\s+className="mb-12">.*?</form>\s*</div>\s*\)\s*\}\s*</div>\s*\)\s*\}', '', text, flags=re.DOTALL)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)

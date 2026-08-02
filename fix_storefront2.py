import re

with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

# Remove specific states
text = re.sub(r'const\s+\[activeQuestion.*?null,\s*\);', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+\[giveawayAnswer.*?useState\(""\);', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+\[userVoteIndex.*?useState\(-1\);', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+\[totalVotesCount.*?useState\(0\);', '', text, flags=re.DOTALL)
text = re.sub(r'const\s+\[percentages.*?useState<number\[\]>\(\[\]\);', '', text, flags=re.DOTALL)

# Remove the useEffect for checking votes
vote_effect = re.compile(r'useEffect\(\(\)\s*=>\s*\{.*?if\s*\(!auth\.currentUser.*?checkVote\(\);\s*\}\s*\},.*?\]\);', re.DOTALL)
text = vote_effect.sub('', text)

# Remove handleVote
handle_vote = re.compile(r'const\s+handleVote\s*=\s*async\s*\(optionIndex:\s*number\)\s*=>\s*\{.*?catch.*?\}\s*\};', re.DOTALL)
text = handle_vote.sub('', text)

# Remove calculatePercentages
calc_perc = re.compile(r'const\s+calculatePercentages\s*=\s*\(.*?\}\s*\};', re.DOTALL)
text = calc_perc.sub('', text)

# Remove join giveaway
join_gw = re.compile(r'const\s+handleJoinGiveaway\s*=\s*async\s*\(\)\s*=>\s*\{.*?catch.*?\}\s*\};', re.DOTALL)
text = join_gw.sub('', text)

# Remove {activeQuestion ...} from UI
active_q_ui = re.compile(r'\{\s*\/\*\s*Haftanın Sorusu\s*\*\/\s*\}\s*\{activeQuestion\s*&&\s*\(.*?(?:\{/\*\s*Kategoriler\s*\*/\}|</div>\s*</div>\s*</div>\s*\))', re.DOTALL)
text = active_q_ui.sub('{/* Kategoriler */}', text)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)

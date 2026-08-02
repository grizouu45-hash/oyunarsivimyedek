with open('firestore.rules', 'r') as f:
    text = f.read()
import re
text = re.sub(r'\s*match /weeklyQuestions.*?\}\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'\s*match /giveaways.*?\}\s*\}', '', text, flags=re.DOTALL)
text = re.sub(r'\s*match /products.*?\}\s*\}', '', text, flags=re.DOTALL)
with open('firestore.rules', 'w') as f:
    f.write(text)

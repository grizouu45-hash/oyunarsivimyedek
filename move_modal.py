import re
with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

# I see a double <AnimatePresence> which could be causing the react/motion library to bug out and not render the modal correctly.
text = text.replace('      <AnimatePresence>\n      <AnimatePresence>', '      <AnimatePresence>')

# Remove the one I added and put it properly.
start_idx = text.find('      <AnimatePresence>\n        {isCategoryModalOpen && (')
if start_idx != -1:
    end_idx = text.find('      </AnimatePresence>', start_idx)
    if end_idx != -1:
        modal_code = text[start_idx:end_idx + len('      </AnimatePresence>')]
        text = text[:start_idx] + text[end_idx + len('      </AnimatePresence>'):]
        
        # Now place it inside the main return wrapper
        insert_target = '{/* Modal */}'
        if insert_target in text:
            text = text.replace(insert_target, modal_code + '\n      ' + insert_target)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(text)

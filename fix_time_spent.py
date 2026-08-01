import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# Replace the formatting logic
old_logic = """           const m = Math.floor(secs / 60).toString().padStart(2, '0');
           const s = (secs % 60).toString().padStart(2, '0');
           setAverageTimeSpent(`${m}:${s}`);"""

new_logic = """           const m = Math.floor(secs / 60);
           const s = secs % 60;
           if (m > 0) {
               setAverageTimeSpent(`${m} dk ${s} sn`);
           } else {
               setAverageTimeSpent(`${s} sn`);
           }"""

text = text.replace(old_logic, new_logic)

# Replace initial state
text = text.replace('useState("00:00");', 'useState("0 dk 0 sn");')

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

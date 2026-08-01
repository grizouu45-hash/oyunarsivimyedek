import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# Change initial state
text = text.replace('useState("0 dk 0 sn");', 'useState("0 dk");')

# Change update logic
old_logic = """           const m = Math.floor(secs / 60);
           const s = secs % 60;
           if (m > 0) {
               setAverageTimeSpent(`${m} dk ${s} sn`);
           } else {
               setAverageTimeSpent(`${s} sn`);
           }"""

new_logic = """           const m = Math.floor(secs / 60);
           const s = secs % 60;
           setAverageTimeSpent(m > 0 ? `${m} dk ${s} sn` : `${s} sn`);"""

text = text.replace(old_logic, new_logic)

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

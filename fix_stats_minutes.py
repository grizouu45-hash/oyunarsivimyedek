import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

old_logic = """        if (avgDoc.exists() && typeof avgDoc.data().averageSessionDuration === 'number') {
           const secs = Math.max(0, avgDoc.data().averageSessionDuration);
           const m = Math.floor(secs / 60);
           const s = secs % 60;
           setAverageTimeSpent(m > 0 ? `${m} dk ${s} sn` : `${s} sn`);
        }"""

new_logic = """        if (avgDoc.exists() && typeof avgDoc.data().averageSessionDuration === 'number') {
           const secs = Math.max(0, avgDoc.data().averageSessionDuration);
           let m = Math.ceil(secs / 60);
           if (m === 0) m = 1; // Ensure non-zero
           setAverageTimeSpent(`${m} dakika`);
        }"""

text = text.replace(old_logic, new_logic)

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

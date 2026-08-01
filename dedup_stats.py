import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

pattern = re.compile(r'      // Average Time Spent\n      try {\n        const avgRef = doc\(db, \'site_stats\', \'global_metrics\'\);\n        const avgDoc = await getDoc\(avgRef\);\n        if \(avgDoc\.exists\(\) && avgDoc\.data\(\)\.averageSessionDuration\) \{\n           const secs = avgDoc\.data\(\)\.averageSessionDuration;\n           const m = Math\.floor\(secs / 60\);\n           const s = secs % 60;\n           if \(m > 0\) \{\n               setAverageTimeSpent\(`\$\{m\} dk \$\{s\} sn`\);\n           \} else \{\n               setAverageTimeSpent\(`\$\{s\} sn`\);\n           \}\n        \}\n      \} catch \(e\) \{ console\.error\(\'Avg time error\', e\) \}\n')

matches = pattern.findall(text)
print("Matches found:", len(matches))

text = pattern.sub('', text)

# Now add it back exactly ONCE.
# Find `// Monthly Visits` block to append it after
monthly_pattern = re.compile(r'      // Monthly Visits\n      try {\n        const monthlyRef = doc\(db, \'site_stats\', `monthly_\$\{monthStr\}`\);\n        const monthlyDoc = await getDoc\(monthlyRef\);\n        if \(monthlyDoc\.exists\(\)\) \{\n          setMonthlyVisits\(monthlyDoc\.data\(\)\.visits \|\| 0\);\n        \}\n      \} catch\(e\) \{ console\.error\(\'Monthly error\', e\) \}')

def add_avg(match):
    return match.group(0) + '\n\n' + """      // Average Time Spent
      try {
        const avgRef = doc(db, 'site_stats', 'global_metrics');
        const avgDoc = await getDoc(avgRef);
        if (avgDoc.exists() && avgDoc.data().averageSessionDuration) {
           const secs = avgDoc.data().averageSessionDuration;
           const m = Math.floor(secs / 60);
           const s = secs % 60;
           if (m > 0) {
               setAverageTimeSpent(`${m} dk ${s} sn`);
           } else {
               setAverageTimeSpent(`${s} sn`);
           }
        }
      } catch (e) { console.error('Avg time error', e) }"""

text = monthly_pattern.sub(add_avg, text)

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

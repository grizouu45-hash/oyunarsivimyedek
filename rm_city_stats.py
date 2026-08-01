import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# Remove cityStats state
text = re.sub(r'const \[cityStats, setCityStats\] = useState<\{.*?\}\[\]>\(\[\]\);\n\s*', '', text)

# Remove cityStats fetching logic
# Starts with "        // Fetch City Stats" up to "          console.log("City fetch error or missing index", e);\n        }"
city_fetch_pattern = re.compile(r'        // Fetch City Stats.*?console\.log\("City fetch error or missing index", e\);\n        }', re.DOTALL)
text = city_fetch_pattern.sub('', text)

# Remove cityStats table rendering
# Starts with "            {/* 8th Block: City Stats Table */}"
city_table_pattern = re.compile(r'            \{\/\* 8th Block: City Stats Table \*\/\}.*?</table>\n                </div>\n              </div>', re.DOTALL)
text = city_table_pattern.sub('', text)

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

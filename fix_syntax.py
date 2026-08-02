import os
import re

for file_path in ['src/pages/AdminPanel.tsx', 'src/components/NotificationsCenter.tsx']:
    with open(file_path, 'r') as f:
        text = f.read()

    text = re.sub(
        r'\(error:\s*any\)\s*=>\s*if\s*\(error\?.code\s*!==\s*"resource-exhausted"\)\s*\{\s*console\.error\("([^"]+)",\s*error\)\s*\}',
        r'(error: any) => { if (error?.code !== "resource-exhausted") { console.error("\1", error) } }',
        text
    )

    with open(file_path, 'w') as f:
        f.write(text)

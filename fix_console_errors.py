import os
import re

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            # Simple replace to prevent logging quota errors
            # Because we might have `console.error("something", error)`
            new_content = re.sub(
                r'console\.error\(([^,]+),\s*error\);',
                r'if (error?.code !== "resource-exhausted") { console.error(\1, error); }',
                content
            )
            # Handle error: any
            new_content = re.sub(
                r'console\.error\(([^,]+),\s*e\);',
                r'if (e?.code !== "resource-exhausted") { console.error(\1, e); }',
                new_content
            )
            
            if new_content != content:
                with open(path, 'w') as f:
                    f.write(new_content)

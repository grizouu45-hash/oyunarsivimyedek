with open('src/pages/StoreFront.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if '<ProductSlider' in line:
        skip = True
    if skip and '/>} ' in line or '/>' in line and skip:
        # wait, the closing tag is `]} />`
        if ']} />' in line:
            skip = False
            continue
    if not skip:
        new_lines.append(line)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.writelines(new_lines)

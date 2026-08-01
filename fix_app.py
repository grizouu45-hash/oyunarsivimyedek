import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace("import { HashRouter, Routes, Route } from 'react-router-dom';",
                    "import { BrowserRouter, Routes, Route } from 'react-router-dom';")
text = text.replace("<HashRouter>", "<BrowserRouter>")
text = text.replace("</HashRouter>", "</BrowserRouter>")

with open('src/App.tsx', 'w') as f:
    f.write(text)

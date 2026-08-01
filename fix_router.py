import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace("import { BrowserRouter, Routes, Route } from 'react-router-dom';",
                    "import { HashRouter, Routes, Route } from 'react-router-dom';")
text = text.replace("<BrowserRouter>", "<HashRouter>")
text = text.replace("</BrowserRouter>", "</HashRouter>")

with open('src/App.tsx', 'w') as f:
    f.write(text)

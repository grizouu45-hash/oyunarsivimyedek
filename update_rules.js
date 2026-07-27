const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(/request\.auth\.token\.email == "grizouu45@gmail\.com"/g, 'request.auth.token.email.lower() == "grizouu45@gmail.com"');
rules = rules.replace(/request\.auth\.token\.email == "sigvafevzican@gmail\.com"/g, 'request.auth.token.email.lower() == "sigvafevzican@gmail.com"');
// Let's also restore the admins collection check
rules = rules.replace(/        \)\n      \);\n    }\n\n    match \/admins/g, '        ) || exists(/databases/$(database)/documents/admins/$(request.auth.uid))\n      );\n    }\n\n    match /admins');
fs.writeFileSync('firestore.rules', rules);

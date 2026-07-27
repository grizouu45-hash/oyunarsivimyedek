const https = require('https');

function fetchImg(url) {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const match = data.match(/<meta property="og:image" content="([^"]+)">/);
      console.log(url, match ? match[1] : 'not found');
    });
  });
}

fetchImg('https://www.youtube.com/@21MUHAMMED09');
fetchImg('https://www.youtube.com/@AVENIRAGAMES');

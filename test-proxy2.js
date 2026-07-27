const url = encodeURIComponent("https://21muhammed09.blogspot.com/feeds/posts/default?alt=json&max-results=50");
fetch(`https://api.codetabs.com/v1/proxy/?quest=${url}`).then(r => r.json()).then(d => console.log(d.feed.entry[0].title.$t));

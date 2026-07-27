async function test() {
  const res = await fetch('https://21muhammed09.blogspot.com/feeds/posts/default?alt=json');
  const data = await res.json();
  if (data.feed.entry && data.feed.entry.length > 0) {
    const entry = data.feed.entry[0];
    console.log(JSON.stringify(entry, null, 2));
  } else {
    console.log('No entries');
  }
}
test();

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyB7sENsFn0XiRWnl1ddxwHO09iI1YxDvzM",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "avenira-games.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "avenira-games",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "avenira-games.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "388972625121",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:388972625121:web:8ccb1553df7d75b63d8ba0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    const gamesSnapshot = await getDocs(collection(db, "games"));
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    
    const staticRoutes = [
      { loc: "https://oyunarsivim.com/", priority: "1.0", changefreq: "daily" },
      { loc: "https://oyunarsivim.com/hakkinda", priority: "0.8", changefreq: "monthly" },
      { loc: "https://oyunarsivim.com/iletisim", priority: "0.8", changefreq: "monthly" },
      { loc: "https://oyunarsivim.com/hizmet-sartlari", priority: "0.5", changefreq: "monthly" },
      { loc: "https://oyunarsivim.com/gizlilik-politikasi", priority: "0.5", changefreq: "monthly" }
    ];

    staticRoutes.forEach(route => {
      sitemap += `\n  <url>\n    <loc>${route.loc}</loc>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`;
    });

    gamesSnapshot.forEach((doc) => {
      const id = doc.id;
      sitemap += `\n  <url>\n    <loc>https://oyunarsivim.com/post/${id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`;
    });

    sitemap += `\n</urlset>`;
    
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send('Error generating sitemap');
  }
}

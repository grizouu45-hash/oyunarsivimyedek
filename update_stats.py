import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# Add imports
text = text.replace("import { collection, getDocs, doc, getDoc } from 'firebase/firestore';", "import { collection, getDocs, doc, getDoc, query, orderBy, limit, where } from 'firebase/firestore';")
text = text.replace("import { ShieldAlert, Users, MessageSquare, ArrowLeft } from 'lucide-react';", "import { ShieldAlert, Users, MousePointerClick, MessageSquare, ArrowLeft } from 'lucide-react';")

# Add state
text = text.replace("const [totalComments, setTotalComments] = useState(0);", "const [totalComments, setTotalComments] = useState(0);\n  const [topGames, setTopGames] = useState<any[]>([]);")

# Add fetch logic
fetch_games = """
      try {
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, orderBy('views', 'desc'), limit(10));
        const gamesSnapshot = await getDocs(q);
        
        const gamesData = [];
        for (const gameDoc of gamesSnapshot.docs) {
          const game = gameDoc.data();
          const commentsRef = collection(db, 'comments');
          const commentsQuery = query(commentsRef, where('postId', '==', gameDoc.id));
          const commentsSnapshot = await getDocs(commentsQuery);
          
          gamesData.push({
            id: gameDoc.id,
            title: game.title,
            views: game.views || 0,
            comments: commentsSnapshot.size || 0
          });
        }
        setTopGames(gamesData);
      } catch(e) { console.error('Games error', e) }
"""
text = text.replace("setLoading(false);", fetch_games + "\n      setLoading(false);", 1) # Only replace the first one inside the try block

# Add UI
ui_to_add = """
            </div>
            
            <div className="bg-[#1A0B2E] backdrop-blur border border-white/10 rounded-2xl shadow-sm overflow-hidden mt-8">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">En Çok Okunan Haberler (Top 10)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="bg-white/10 text-xs uppercase text-white/60 font-semibold border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Haber Başlığı</th>
                      <th className="px-6 py-4 text-center">Görüntülenme</th>
                      <th className="px-6 py-4 text-center">Yorumlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {topGames.map((game) => (
                      <tr key={game.id} className="hover:bg-[#1A0B2E] transition-colors">
                        <td className="px-6 py-4 font-medium text-white max-w-md truncate">
                          {game.title}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-indigo-300 font-medium border border-indigo-500/20">
                            <MousePointerClick className="w-3.5 h-3.5" />
                            {game.views}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-green-400 font-medium border border-green-500/20">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {game.comments}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {topGames.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-white/60">
                          Henüz veri bulunmuyor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>"""

text = text.replace("</div>\n          </div>\n        )}", ui_to_add + "\n          </div>\n        )}")

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

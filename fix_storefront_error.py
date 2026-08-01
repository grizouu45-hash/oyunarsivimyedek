import re

with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

text = text.replace("const [loading, setLoading] = useState(true);",
                    "const [loading, setLoading] = useState(true);\n  const [quotaError, setQuotaError] = useState(false);")

old_snap = """        const publishedGames = gamesData.filter(g => !g.status || g.status === 'published');
        setGames(publishedGames);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching games", error);
        setLoading(false);
      }
    );"""
new_snap = """        const publishedGames = gamesData.filter(g => !g.status || g.status === 'published');
        setGames(publishedGames);
        setLoading(false);
      },
      (error: any) => {
        console.error("Error fetching games", error);
        if (error.code === 'resource-exhausted') {
          setQuotaError(true);
        }
        setLoading(false);
      }
    );"""
text = text.replace(old_snap, new_snap)

old_ret = """  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F051D] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }"""
new_ret = """  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F051D] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (quotaError) {
    return (
      <div className="min-h-screen bg-[#0F051D] text-white flex flex-col items-center justify-center text-center px-4">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold mb-4">Sistem Şu An Yoğun</h2>
          <p className="text-white/60 max-w-md">Veritabanı günlük kotası dolduğu için oyunlar listelenemiyor. Lütfen daha sonra tekrar ziyaret edin.</p>
        </div>
      </div>
    );
  }"""
text = text.replace(old_ret, new_ret)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)

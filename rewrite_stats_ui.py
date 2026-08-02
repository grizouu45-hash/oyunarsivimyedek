import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# I also need to remove weeklyVisits, dailyVisits, monthlyVisits, topGames states.
text = re.sub(r'const\s+\[weeklyVisits,\s*setWeeklyVisits\].*?;', '', text)
text = re.sub(r'const\s+\[dailyVisits,\s*setDailyVisits\].*?;', '', text)
text = re.sub(r'const\s+\[monthlyVisits,\s*setMonthlyVisits\].*?;', '', text)
text = re.sub(r'const\s+\[topGames,\s*setTopGames\].*?;', '', text)

ui_start = text.find('return (')
if ui_start != -1:
    new_ui = """return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white flex flex-col">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full mt-16 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-white/80" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">İstatistik Paneli</h1>
              <p className="text-sm text-white/60">Sınıflandırılmış site verileri</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-orange-500/10 text-orange-400 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Siteye Üye Olan Kullanıcılar</p>
                  <p className="text-3xl font-bold text-white">{totalUsers}</p>
                </div>
              </div>
              
              <div 
                onClick={() => setShowCommentsModal(true)}
                className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4 cursor-pointer hover:border-white/20 transition-colors"
              >
                <div className="p-4 bg-green-500/10 text-green-400 rounded-xl">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Toplam Yorum (Popüler)</p>
                  <p className="text-3xl font-bold text-white">{totalComments}</p>
                </div>
              </div>
              
              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-xl">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/60">Özel Tarih Ziyaretçi</p>
                    <p className="text-3xl font-bold text-white">
                      {loadingCustom ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      ) : (customRangeVisits !== null ? customRangeVisits : '-')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0F051D] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 color-scheme-dark"
                  />
                  <span className="text-white/60">-</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#0F051D] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 color-scheme-dark"
                  />
                </div>
              </div>
              
            </div>
          </div>
        )}
      </main>
      <AdminCommentsModal 
        isOpen={showCommentsModal} 
        onClose={() => setShowCommentsModal(false)} 
      />
    </div>
  );
}"""
    text = text[:ui_start] + new_ui

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

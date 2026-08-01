import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# 1. Add averageTimeSpent block
avg_time_block = """
              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Ortalama Kalma Süresi</p>
                  <p className="text-3xl font-bold text-white">{averageTimeSpent}</p>
                </div>
              </div>
"""

# Insert it right before the 7th block
text = text.replace('{/* 7th Block', avg_time_block + '              {/* 7th Block')

# 2. Render cityStats
city_stats_block = """            </div>
            {/* 8th Block: City Stats Table */}
            {cityStats.length > 0 && (
              <div className="bg-[#1A0B2E] backdrop-blur border border-white/10 rounded-2xl shadow-sm overflow-hidden mt-6">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Özel Tarihli Şehir İstatistikleri</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-white/80">
                    <thead className="bg-white/10 text-xs uppercase text-white/60 font-semibold border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4">Şehir</th>
                        <th className="px-6 py-4 text-center">Ziyaret Sayısı</th>
                        <th className="px-6 py-4">Kullanıcılar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {cityStats.map((stat, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">{stat.city || 'Bilinmiyor'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-md bg-white/10 text-pink-300 font-medium border border-pink-500/20">
                              {stat.count}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {stat.users.length > 0 ? stat.users.join(', ') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}"""

# We can replace the closing div of the topGames table with the city_stats_block
top_games_end = """                </table>
              </div>
            </div>"""

text = text.replace(top_games_end, top_games_end + '\n' + city_stats_block)

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

import re

with open('src/pages/StatisticsPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add cityStats and averageTimeSpent fetches
fetch_stats_add = """        setCustomRangeVisits(total);

        // Fetch City Stats (assumes a user_sessions collection with city, date, and userName fields)
        try {
          const citiesQuery = query(collection(db, 'user_sessions'), where('date', '>=', start), where('date', '<=', end));
          const citiesSnapshot = await getDocs(citiesQuery);
          
          const cityMap: Record<string, { count: number, users: Set<string> }> = {};
          citiesSnapshot.docs.forEach(doc => {
             const data = doc.data();
             if (data.city) {
                if (!cityMap[data.city]) cityMap[data.city] = { count: 0, users: new Set() };
                cityMap[data.city].count += 1;
                if (data.userName) cityMap[data.city].users.add(data.userName);
             }
          });
          
          const cStats = Object.entries(cityMap).map(([city, data]) => ({
             city,
             count: data.count,
             users: Array.from(data.users)
          })).sort((a,b) => b.count - a.count);
          
          setCityStats(cStats);
        } catch (e) {
          console.log("City fetch error or missing index", e);
        }

      } catch (error) {"""
content = content.replace('        setCustomRangeVisits(total);\n      } catch (error) {', fetch_stats_add)

# Add avg time spent fetch
avg_time_fetch = """      // Average Time Spent
      try {
        const avgRef = doc(db, 'site_stats', 'global_metrics');
        const avgDoc = await getDoc(avgRef);
        if (avgDoc.exists() && avgDoc.data().averageSessionDuration) {
           const secs = avgDoc.data().averageSessionDuration;
           const m = Math.floor(secs / 60).toString().padStart(2, '0');
           const s = (secs % 60).toString().padStart(2, '0');
           setAverageTimeSpent(`${m}:${s}`);
        }
      } catch (e) { console.error('Avg time error', e) }

      // Total Users"""
content = content.replace('      // Total Users', avg_time_fetch)

# Add UI components
ui_replacement = """              <div 
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

              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-teal-500/10 text-teal-400 rounded-xl">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Ortalama Kalma Süresi</p>
                  <p className="text-3xl font-bold text-white">{averageTimeSpent}</p>
                </div>
              </div>

              {/* 7th Block: Custom Date Range */}
              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-4 lg:col-span-3">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-xl">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/60">Özel Tarih Ziyaretçi & Şehir İstatistikleri</p>
                    <p className="text-3xl font-bold text-white">
                      {loadingCustom ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      ) : (customRangeVisits !== null ? customRangeVisits : '-')} <span className="text-lg font-normal text-white/50">Toplam Ziyaret</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full sm:w-auto bg-[#0F051D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 color-scheme-dark"
                    />
                    <span className="text-white/60">-</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full sm:w-auto bg-[#0F051D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 color-scheme-dark"
                    />
                  </div>
                </div>

                {!loadingCustom && cityStats.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" /> Şehirlere Göre Ziyaretçiler
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cityStats.map((stat, idx) => (
                        <div key={idx} className="bg-[#0F051D] border border-white/5 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-white">{stat.city}</span>
                            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-md">{stat.count} Ziyaret</span>
                          </div>
                          {stat.users.length > 0 ? (
                            <div className="text-xs text-white/60 space-y-1">
                              {stat.users.slice(0, 5).map((u, i) => <div key={i} className="truncate">• {u}</div>)}
                              {stat.users.length > 5 && <div>+ {stat.users.length - 5} daha</div>}
                            </div>
                          ) : (
                            <div className="text-xs text-white/40">Anonim ziyaretçiler</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>"""

search_ui = """              <div 
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

              {/* 7th Block: Custom Date Range */}
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
                
                <div className="flex items-center gap-2">
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
            </div>"""

content = content.replace(search_ui, ui_replacement)

with open('src/pages/StatisticsPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

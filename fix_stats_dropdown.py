import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# Add new states
text = text.replace('const [averageTimeSpent, setAverageTimeSpent] = useState("1 dakika");',
                    'const [avgTimeFilter, setAvgTimeFilter] = useState("today");\n  const [dailyAvgTime, setDailyAvgTime] = useState("0 dakika");\n  const [weeklyAvgTime, setWeeklyAvgTime] = useState("0 dakika");\n  const [monthlyAvgTime, setMonthlyAvgTime] = useState("0 dakika");')

# Change data fetching
old_fetch = """      // Average Time Spent
      try {
        const avgRef = doc(db, 'site_stats', 'global_metrics');
        const avgDoc = await getDoc(avgRef);
        if (avgDoc.exists() && typeof avgDoc.data().averageSessionDuration === 'number') {
           const secs = Math.max(0, avgDoc.data().averageSessionDuration);
           let m = Math.ceil(secs / 60);
           if (m === 0) m = 1; // Ensure non-zero
           setAverageTimeSpent(`${m} dakika`);
        }
      } catch (e) { console.error('Avg time error', e) }"""

new_fetch = """      // Average Time Spent (Daily, Weekly, Monthly)
      try {
        const dRef = doc(db, 'site_stats', `daily_${dayStr}`);
        const dDoc = await getDoc(dRef);
        if (dDoc.exists() && typeof dDoc.data().averageSessionDuration === 'number') {
           const secs = Math.max(0, dDoc.data().averageSessionDuration);
           let m = Math.ceil(secs / 60);
           if (m === 0) m = 1;
           setDailyAvgTime(`${m} dakika`);
        }
        
        const wRef = doc(db, 'site_stats', weekStr);
        const wDoc = await getDoc(wRef);
        if (wDoc.exists() && typeof wDoc.data().averageSessionDuration === 'number') {
           const secs = Math.max(0, wDoc.data().averageSessionDuration);
           let m = Math.ceil(secs / 60);
           if (m === 0) m = 1;
           setWeeklyAvgTime(`${m} dakika`);
        }
        
        const mRef = doc(db, 'site_stats', `monthly_${monthStr}`);
        const mDoc = await getDoc(mRef);
        if (mDoc.exists() && typeof mDoc.data().averageSessionDuration === 'number') {
           const secs = Math.max(0, mDoc.data().averageSessionDuration);
           let m = Math.ceil(secs / 60);
           if (m === 0) m = 1;
           setMonthlyAvgTime(`${m} dakika`);
        }
      } catch (e) { console.error('Avg time error', e) }"""

text = text.replace(old_fetch, new_fetch)

# Update the rendering block
old_render = """              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Ortalama Kalma Süresi</p>
                  <p className="text-3xl font-bold text-white">{averageTimeSpent}</p>
                </div>
              </div>"""

new_render = """              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60">Ortalama Kalma Süresi</p>
                      <p className="text-3xl font-bold text-white">
                        {avgTimeFilter === 'today' ? dailyAvgTime : avgTimeFilter === 'week' ? weeklyAvgTime : monthlyAvgTime}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <select 
                    value={avgTimeFilter} 
                    onChange={(e) => setAvgTimeFilter(e.target.value)}
                    className="w-full bg-[#0F051D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="today">Bugün</option>
                    <option value="week">Bu Hafta</option>
                    <option value="month">Bu Ay</option>
                  </select>
                </div>
              </div>"""

text = text.replace(old_render, new_render)

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

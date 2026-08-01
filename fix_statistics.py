import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# 1. Remove state variables
text = re.sub(r'const \[dailyAvgTime, setDailyAvgTime\] = useState\([^)]+\);', '', text)
text = re.sub(r'const \[weeklyAvgTime, setWeeklyAvgTime\] = useState\([^)]+\);', '', text)
text = re.sub(r'const \[monthlyAvgTime, setMonthlyAvgTime\] = useState\([^)]+\);', '', text)
text = re.sub(r'const \[avgTimeFilter, setAvgTimeFilter\] = useState\([^)]+\);', '', text)

# 2. Remove the average time UI block
# I will use a regex to match the block starting with `<div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-4">` and ending before the 7th Block comment.
ui_block_regex = r'<div className="bg-\[#1A0B2E\] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-4">.*?Ortalama Kalma Süresi.*?</div>\s*</div>\s*(?=<!--|{/\* 7th Block)'
text = re.sub(ui_block_regex, '', text, flags=re.DOTALL)

# Let me use a more robust search/replace for the UI block
old_ui_block = """              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-4">
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
text = text.replace(old_ui_block, "")


# 3. Remove the fetch logic for average times
old_fetch = """      // Average Time Spent (Daily, Weekly, Monthly)
      try {
        const getAvgMins = (data: any) => {
          let secs = 0;
          if (typeof data.averageSessionDuration === 'number') {
            secs = Math.max(0, data.averageSessionDuration);
          } else if (typeof data.totalDuration === 'number' && typeof data.totalSessions === 'number') {
            secs = Math.floor(Math.max(0, data.totalDuration) / Math.max(1, data.totalSessions));
          }
          let m = Math.ceil(secs / 60);
          if (m === 0 && secs > 0) m = 1; // if less than 60s but > 0
          return `${m} dakika`;
        };
      
        const dRef = doc(db, 'site_stats', `daily_${dayStr}`);
        const dDoc = await getDoc(dRef);
        if (dDoc.exists()) setDailyAvgTime(getAvgMins(dDoc.data()));
        
        const wRef = doc(db, 'site_stats', weekStr);
        const wDoc = await getDoc(wRef);
        if (wDoc.exists()) setWeeklyAvgTime(getAvgMins(wDoc.data()));
        
        const mRef = doc(db, 'site_stats', `monthly_${monthStr}`);
        const mDoc = await getDoc(mRef);
        if (mDoc.exists()) setMonthlyAvgTime(getAvgMins(mDoc.data()));
      } catch (e) { console.error('Avg time error', e) }"""

text = text.replace(old_fetch, "")

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

old_fetch = """      // Average Time Spent (Daily, Weekly, Monthly)
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

new_fetch = """      // Average Time Spent (Daily, Weekly, Monthly)
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

text = text.replace(old_fetch, new_fetch)

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)

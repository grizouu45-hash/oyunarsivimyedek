import re

new_code = """import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function PageTracker() {
  const location = useLocation();
  const sessionInitialized = useRef(false);
  const lastVisitPath = useRef('');

  useEffect(() => {
    // Basic debounce for visit recording to avoid duplicate initial triggers
    if (lastVisitPath.current === location.pathname) return;
    lastVisitPath.current = location.pathname;

    const recordVisit = async () => {
      const today = new Date();
      const dayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      const monthStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      const weekStr = `${d.getUTCFullYear()}-W${weekNo}`;

      try {
        const weeklyRef = doc(db, 'site_stats', weekStr);
        await setDoc(weeklyRef, { visits: increment(1) }, { merge: true });

        const dailyRef = doc(db, 'site_stats', `daily_${dayStr}`);
        await setDoc(dailyRef, { visits: increment(1) }, { merge: true });

        const monthlyRef = doc(db, 'site_stats', `monthly_${monthStr}`);
        await setDoc(monthlyRef, { visits: increment(1) }, { merge: true });
      } catch (e) {
        console.error("Visit record error", e);
      }
    };

    recordVisit();
  }, [location.pathname]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const startSessionTracking = () => {
      let isFirstReport = true;
      // Change interval to 60s to prevent quota exhaustion
      intervalId = setInterval(async () => {
        try {
          const today = new Date();
          const dayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
          const monthStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
          
          const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
          const weekStr = `${d.getUTCFullYear()}-W${weekNo}`;

          const refs = [
            doc(db, 'site_stats', 'global_metrics'),
            doc(db, 'site_stats', `daily_${dayStr}`),
            doc(db, 'site_stats', weekStr),
            doc(db, 'site_stats', `monthly_${monthStr}`)
          ];

          for (const ref of refs) {
             if (isFirstReport) {
                await setDoc(ref, { totalDuration: increment(60), totalSessions: increment(1) }, { merge: true });
             } else {
                await setDoc(ref, { totalDuration: increment(60) }, { merge: true });
             }
          }
          if (isFirstReport) isFirstReport = false;
        } catch (e) {
           // ignore quota errors
        }
      }, 60000);
    };
    
    if (!sessionInitialized.current) {
       sessionInitialized.current = true;
       startSessionTracking();
    }

    return () => {
       if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return null;
}
"""

with open('src/components/PageTracker.tsx', 'w') as f:
    f.write(new_code)

import re

new_code = """import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function PageTracker() {
  const location = useLocation();
  const sessionInitialized = useRef(false);

  useEffect(() => {
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
    const initSession = async () => {
      try {
        const avgRef = doc(db, 'site_stats', 'global_metrics');
        await setDoc(avgRef, { totalSessions: increment(1) }, { merge: true });
      } catch (e) {
        console.error("Session init error", e);
      }
    };

    if (!sessionInitialized.current) {
       sessionInitialized.current = true;
       initSession();
    }

    // Report duration every 15 seconds
    const intervalId = setInterval(async () => {
      try {
        const avgRef = doc(db, 'site_stats', 'global_metrics');
        await setDoc(avgRef, { totalDuration: increment(15) }, { merge: true });
        
        const docSnap = await getDoc(avgRef);
        if (docSnap.exists()) {
           const d = docSnap.data();
           const avg = Math.floor((d.totalDuration || 0) / (d.totalSessions || 1));
           await setDoc(avgRef, { averageSessionDuration: avg }, { merge: true });
        }
      } catch (e) {
         // ignore
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
"""

with open('src/components/PageTracker.tsx', 'w') as f:
    f.write(new_code)

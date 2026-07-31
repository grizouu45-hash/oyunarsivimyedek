import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function PageTracker() {
  const location = useLocation();

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
        // Update weekly stats
        const weeklyRef = doc(db, 'site_stats', weekStr);
        await setDoc(weeklyRef, { visits: increment(1) }, { merge: true });

        // Update daily stats
        const dailyRef = doc(db, 'site_stats', `daily_${dayStr}`);
        await setDoc(dailyRef, { visits: increment(1) }, { merge: true });

        // Update monthly stats
        const monthlyRef = doc(db, 'site_stats', `monthly_${monthStr}`);
        await setDoc(monthlyRef, { visits: increment(1) }, { merge: true });
      } catch (e) {
        console.error("Visit record error", e);
      }
    };

    recordVisit();
  }, [location.pathname]);

  return null;
}


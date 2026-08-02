import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Sadece her session için 1 kez benzersiz ziyaret say
    const today = new Date();
    const dayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const visitKey = `visit_${dayStr}`;
    
    if (!sessionStorage.getItem(visitKey)) {
      sessionStorage.setItem(visitKey, 'true');
      
      const recordVisit = async () => {
        const monthStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
        
        const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        const weekStr = `${d.getUTCFullYear()}-W${weekNo}`;

        try {
          await setDoc(doc(db, 'site_stats', weekStr), { visits: increment(1) }, { merge: true });
          await setDoc(doc(db, 'site_stats', `daily_${dayStr}`), { visits: increment(1) }, { merge: true });
          await setDoc(doc(db, 'site_stats', `monthly_${monthStr}`), { visits: increment(1) }, { merge: true });
        } catch (e: any) {
          if (e?.code !== "resource-exhausted") { console.error("Visit record error", e); }
        }
      };

      recordVisit();
    }
  }, [location.pathname]);

  return null;
}

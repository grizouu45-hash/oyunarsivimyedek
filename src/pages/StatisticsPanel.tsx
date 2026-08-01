import { ADMIN_EMAILS, hasAdminOrEditorAccess } from '../lib/utils';
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Header } from '../components/Header';
import { ShieldAlert, Users, MousePointerClick, MessageSquare, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { AdminCommentsModal } from '../components/AdminCommentsModal';
import { AdminUsersModal } from '../components/AdminUsersModal';

export function StatisticsPanel() {
  const [weeklyVisits, setWeeklyVisits] = useState(0);
  const [dailyVisits, setDailyVisits] = useState(0);
  const [monthlyVisits, setMonthlyVisits] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [topGames, setTopGames] = useState<any[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customRangeVisits, setCustomRangeVisits] = useState<number | null>(null);
  const [avgTimeFilter, setAvgTimeFilter] = useState("today");
  const [dailyAvgTime, setDailyAvgTime] = useState("0 dakika");
  const [weeklyAvgTime, setWeeklyAvgTime] = useState("0 dakika");
  const [monthlyAvgTime, setMonthlyAvgTime] = useState("0 dakika");
  const [loadingCustom, setLoadingCustom] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const calculateCustomRange = async () => {
      if (!startDate || !endDate) return;
      setLoadingCustom(true);
      try {
        let total = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
          const dailyRef = doc(db, 'site_stats', `daily_${dayStr}`);
          const dailyDoc = await getDoc(dailyRef);
          if (dailyDoc.exists()) {
            total += (dailyDoc.data().visits || 0);
          }
        }
        setCustomRangeVisits(total);



      } catch (error) {
        console.error("Custom range error", error);
      } finally {
        setLoadingCustom(false);
      }
    };
    calculateCustomRange();
  }, [startDate, endDate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!hasAdminOrEditorAccess(user)) {
        navigate('/');
      } else {
        fetchStats();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  async function fetchStats() {
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

      // Weekly Visits
      try {
        const statsRef = doc(db, 'site_stats', weekStr);
        const statsDoc = await getDoc(statsRef);
        if (statsDoc.exists()) {
          setWeeklyVisits(statsDoc.data().visits || 0);
        }
      } catch(e) { console.error('Weekly error', e) }

      // Daily Visits
      try {
        const dailyRef = doc(db, 'site_stats', `daily_${dayStr}`);
        const dailyDoc = await getDoc(dailyRef);
        if (dailyDoc.exists()) {
          setDailyVisits(dailyDoc.data().visits || 0);
        }
      } catch(e) { console.error('Daily error', e) }

      // Monthly Visits
      try {
        const monthlyRef = doc(db, 'site_stats', `monthly_${monthStr}`);
        const monthlyDoc = await getDoc(monthlyRef);
        if (monthlyDoc.exists()) {
          setMonthlyVisits(monthlyDoc.data().visits || 0);
        }
      } catch(e) { console.error('Monthly error', e) }

      // Average Time Spent (Daily, Weekly, Monthly)
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
      } catch (e) { console.error('Avg time error', e) }




      // Total Users
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        setTotalUsers(usersSnapshot.size || 0);
        
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsersList(usersData);
      } catch(e) { console.error('Users error', e) }

      try {
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, orderBy('views', 'desc'), limit(10));
        const gamesSnapshot = await getDocs(q);
        
        const gamesData = [];
        let allCommentsCount = 0;

        for (const gameDoc of gamesSnapshot.docs) {
          const game = gameDoc.data();
          const commentsRef = collection(db, 'comments');
          const commentsQuery = query(commentsRef, where('postId', '==', gameDoc.id));
          const commentsSnapshot = await getDocs(commentsQuery);
          
          gamesData.push({
            id: gameDoc.id,
            title: game.title,
            views: game.views || 0,
            comments: commentsSnapshot.size || 0
          });

          allCommentsCount += commentsSnapshot.size;
        }

        setTopGames(gamesData);
        setTotalComments(allCommentsCount);
      } catch(e) { console.error('Games error', e) }
      setLoading(false);

    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white flex flex-col">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 hover:bg-[#2D164B] rounded-xl transition-colors text-indigo-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">İstatistik Paneli</h1>
              <p className="text-sm text-white/60">Site trafiği ve etkileşim raporları</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Günlük Ziyaretçi</p>
                  <p className="text-3xl font-bold text-white">{dailyVisits}</p>
                </div>
              </div>

              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Haftalık Ziyaretçi</p>
                  <p className="text-3xl font-bold text-white">{weeklyVisits}</p>
                </div>
              </div>

              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Aylık Ziyaretçi</p>
                  <p className="text-3xl font-bold text-white">{monthlyVisits}</p>
                </div>
              </div>

              <div 
                onClick={() => setShowUsersModal(true)}
                className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4 cursor-pointer hover:border-white/20 transition-colors"
              >
                <div className="p-4 bg-orange-500/10 text-orange-400 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Siteye Üye Olan Kullanıcılar</p>
                  <p className="text-3xl font-bold text-white">{totalUsers}</p>
                </div>
              </div>
              
              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-purple-500/10 text-purple-400 rounded-xl">
                  <MousePointerClick className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">En Çok Okunan Haber Tıklanması</p>
                  <p className="text-3xl font-bold text-white">
                    {topGames.length > 0 ? topGames[0].views : 0}
                  </p>
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
              
            </div>

            <div className="bg-[#1A0B2E] backdrop-blur border border-white/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">En Çok Okunan Haberler (Top 10)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="bg-white/10 text-xs uppercase text-white/60 font-semibold border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Haber Başlığı</th>
                      <th className="px-6 py-4 text-center">Görüntülenme</th>
                      <th className="px-6 py-4 text-center">Yorumlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {topGames.map((game) => (
                      <tr key={game.id} className="hover:bg-[#1A0B2E] transition-colors">
                        <td className="px-6 py-4 font-medium text-white max-w-md truncate">
                          {game.title}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-indigo-300 font-medium border border-indigo-500/20">
                            <MousePointerClick className="w-3.5 h-3.5" />
                            {game.views}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-green-400 font-medium border border-green-500/20">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {game.comments}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {topGames.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-white/60">
                          Henüz veri bulunmuyor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>

      <AdminCommentsModal 
        isOpen={showCommentsModal} 
        onClose={() => setShowCommentsModal(false)} 
      />
      <AdminUsersModal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        users={usersList}
      />
    </div>
  );
}

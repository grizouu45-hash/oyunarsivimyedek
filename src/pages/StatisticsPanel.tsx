import { ADMIN_EMAILS, hasAdminOrEditorAccess } from '../lib/utils';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Header } from '../components/Header';
import { ShieldAlert, Users, MousePointerClick, MessageSquare, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { AdminCommentsModal } from '../components/AdminCommentsModal';

export function StatisticsPanel() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [topGames, setTopGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customRangeVisits, setCustomRangeVisits] = useState<number | null>(null);
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
      } catch (error: any) {
        if (error?.code !== "resource-exhausted") { console.error("Custom range error", error); }
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
      // Total Users
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        setTotalUsers(usersSnapshot.size || 0);
      } catch(e) { console.error('Users error', e) }

      // Total Comments
      try {
        const commentsRef = collection(db, 'comments');
        const commentsSnapshot = await getDocs(commentsRef);
        setTotalComments(commentsSnapshot.size || 0);
      } catch(e) { console.error('Comments error', e) }

      
      try {
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, orderBy('views', 'desc'), limit(10));
        const gamesSnapshot = await getDocs(q);
        
        const gamesData = [];
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
        }
        setTopGames(gamesData);
      } catch(e) { console.error('Games error', e) }

      setLoading(false);
    } catch (error: any) {
      if (error?.code !== "resource-exhausted") { console.error("Error fetching stats:", error); }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white flex flex-col">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full mt-16 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-white/80" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">İstatistik Paneli</h1>
              <p className="text-sm text-white/60">Sınıflandırılmış site verileri</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-orange-500/10 text-orange-400 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Siteye Üye Olan Kullanıcılar</p>
                  <p className="text-3xl font-bold text-white">{totalUsers}</p>
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
                <div className="flex items-center gap-2 mt-auto">
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
            
            <div className="bg-[#1A0B2E] backdrop-blur border border-white/10 rounded-2xl shadow-sm overflow-hidden mt-8">
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
    </div>
  );
}

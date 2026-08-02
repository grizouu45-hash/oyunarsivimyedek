import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Header } from '../components/Header';
import { Camera, Save, User, FileText, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'motion/react';
import { hasAdminOrEditorAccess } from '../lib/utils';

export function Profile() {
  const [user, setUser] = useState(auth.currentUser);
  const [displayName, setDisplayName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [fetchingComments, setFetchingComments] = useState(true);
  const navigate = useNavigate();

  const isAdmin = user?.email ? hasAdminOrEditorAccess(user) : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(hasAdminOrEditorAccess(currentUser) ? 'Admin' : (currentUser.displayName || ''));
        setSelectedPhoto(currentUser.photoURL || '');
        fetchUserComments(currentUser.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserComments = async (uid: string) => {
    try {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      comments.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });

      setUserComments(comments);
    } catch (error) {
      if (error?.code !== "resource-exhausted") { console.error("Error fetching user comments:", error); }
    } finally {
      setFetchingComments(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isAdmin) return;
    
    setLoading(true);
    try {
      await updateProfile(user, {
        displayName,
        photoURL: selectedPhoto
      });
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL: selectedPhoto
      });
      
      alert('Profiliniz başarıyla güncellendi!');
      window.location.reload();
      
    } catch (error: any) {
      if (error?.code !== "resource-exhausted") { console.error("Error updating profile:", error); }
      alert('Profil güncellenirken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const adminPhoto = 'https://img.magnific.com/premium-vector/technology-concept-vector-illustration-featuring-consulting-design-flat-style-elements_1226483-4088.jpg?semt=ais_hybrid&w=740&q=80';
  const displayPhoto = isAdmin ? adminPhoto : (selectedPhoto || user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`);

  return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white flex flex-col">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-10 w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Profilim</h1>
            <p className="text-sm text-white/60">Hesap bilgilerinizi güncelleyin ve yorumlarınızı görün</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-white/10 shadow-sm sticky top-24"
            >
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <img 
                      src={displayPhoto} 
                      alt="Profil" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Görünen Ad</label>
                  <input
                    type="text"
                    value={isAdmin ? 'Admin' : displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isAdmin}
                    className="w-full bg-[#0F051D] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Adınız"
                  />
                </div>

                {!isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-3">Profil Fotoğrafı Seç</label>
                    <div className="flex justify-center gap-4">
                      {[
                        { url: '/gsusers.jpeg', alt: 'Galatasaray' },
                        { url: '/fbusers.jpeg', alt: 'Fenerbahçe' },
                        { url: '/bjkusers.jpeg', alt: 'Beşiktaş' },
                        { url: '/tsusers.jpeg', alt: 'Trabzonspor' }
                      ].map(avatar => (
                        <button
                          key={avatar.url}
                          type="button"
                          onClick={() => setSelectedPhoto(avatar.url)}
                          className={`relative rounded-full transition-all duration-200 border-2 ${selectedPhoto === avatar.url ? 'border-purple-500 scale-110 shadow-lg shadow-purple-500/30' : 'border-transparent hover:scale-105 hover:border-white/30'}`}
                        >
                          <img 
                            src={avatar.url} 
                            alt={avatar.alt} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">E-posta</label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full bg-[#0F051D] border border-white/10 rounded-xl px-4 py-2.5 text-white/50 cursor-not-allowed"
                  />
                </div>

                {!isAdmin && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Değişiklikleri Kaydet
                      </>
                    )}
                  </button>
                )}
              </form>
            </motion.div>
          </div>

          <div className="md:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1A0B2E] backdrop-blur rounded-2xl border border-white/10 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-white">Yorumlarım ({userComments.length})</h2>
              </div>
              
              <div className="p-6">
                {fetchingComments ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : userComments.length === 0 ? (
                  <div className="text-center py-10 text-white/50">
                    Henüz hiç yorum yapmamışsınız.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userComments.map(comment => (
                      <div key={comment.id} className="p-4 bg-[#0F051D] border border-white/10 rounded-xl relative group">
                        <div className="flex justify-between items-start mb-2">
                          <Link 
                            to={`/post/${comment.postId}`} 
                            className="text-sm font-semibold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
                          >
                            Haber: {comment.postTitle || 'Görüntüle'}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          <span className="text-xs text-white/40">
                            {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}


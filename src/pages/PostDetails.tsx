import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Game } from '../types';
import { Header } from '../components/Header';
import { ArrowLeft, Calendar, ExternalLink, Share2, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Comments } from '../components/Comments';
import { LockedLink } from '../components/LockedLink';
import { AdSense } from '../components/AdSense';

export function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleRate = async (rating: number) => {
    if (!auth.currentUser) {
      alert("Lütfen puan vermek için giriş yapın.");
      return;
    }
    setUserRating(rating);
    try {
      await updateDoc(doc(db, "games", id!), {
        [`ratings.${auth.currentUser.uid}`]: rating
      });
      setPost(prev => prev ? { ...prev, ratings: { ...prev.ratings, [auth.currentUser!.uid]: rating } } : null);
    } catch (e) {
      console.error("Error updating rating:", e);
    }
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Bağlantı kopyalandı!');
    }
  };

  useEffect(() => {
    if (post?.ratings && auth.currentUser) {
      setUserRating(post.ratings[auth.currentUser.uid] || 0);
    }
  }, [post]);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      try {
        const docRef = doc(db, 'games', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Game);
          
          // Only increment if we haven't in this session
          const sessionKey = `viewed_${id}`;
          if (!sessionStorage.getItem(sessionKey)) {
            try {
              await updateDoc(docRef, { views: increment(1) });
              sessionStorage.setItem(sessionKey, 'true');
            } catch (e) {
              console.error("Error incrementing views:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!post || post.status === 'trash') {
    return (
      <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-4">Haber Bulunamadı</h2>
          <Link to="/" className="text-indigo-400 hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Link>
          <button 
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Paylaş
          </button>
        </div>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A0B2E] backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm border border-white/10 mb-12"
        >
          {post.imageUrl && (
            <div className="aspect-[21/9] relative bg-[#1a1a2e]">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F051D]/80 to-transparent flex items-end p-6 md:p-10">
                <span className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
            </div>
          )}

          <div className="p-6 md:p-10">
            {!post.imageUrl && (
              <span className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6 inline-block">
                {post.category}
              </span>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-8 mb-8 text-sm text-white/60 border-b border-white/10 pb-8">
              {(post.eventDate || post.eventTime) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>
                    {post.eventDate && new Date(post.eventDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {post.eventDate && post.eventTime && ' - '}
                    {post.eventTime}
                  </span>
                </div>
              )}
              {post.link && (!post.links || post.links.length === 0) && (
                <div className="pt-8 border-t border-white/10 flex flex-wrap gap-4">
                  <LockedLink 
                    url={post.link} 
                    title="Bağlantıya Git" 
                  />
                </div>
              )}
            </div>

            {post.youtubeLink && (
              <div className="mb-8 aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-md">
                <iframe
                  src={post.youtubeLink.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title="YouTube video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="prose prose-invert max-w-none mb-10">
              <p className="text-lg font-medium text-white/90 mb-6 leading-relaxed">
                {post.description}
              </p>
              
              <div 
                className="text-white/70 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            </div>

            <AdSense />

            {post.links && post.links.length > 0 && (
              <div className="pt-8 border-t border-white/10 flex flex-wrap gap-4">
                {post.links.map((link, index) => (
                  <LockedLink 
                    key={index} 
                    url={link.url} 
                    title={link.title || `Bağlantı ${index + 1}`} 
                  />
                ))}
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
                {(Array.isArray(post.tags) ? post.tags : [post.tags]).map((tag, idx) => (
                  <span key={idx} className="bg-white/10 text-white/80 border border-white/20 text-xs font-semibold px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Rating Section */}
            <div className="mb-10 p-6 bg-[#1A0B2E] rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Bu haberi değerlendir</h3>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        (hoverRating || userRating) >= star 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-white/20'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-white/60">
                {userRating > 0 ? `Puanınız: ${userRating} yıldız` : 'Puan vermek için yıldızlara tıklayın'}
                {post?.ratings && Object.keys(post.ratings).length > 0 && (
                  <span className="ml-2 pl-2 border-l border-white/20">
                    Ortalama: {((Object.values(post.ratings) as number[]).reduce((a, b) => Number(a) + Number(b), 0) / Object.values(post.ratings).length).toFixed(1)} 
                    ({Object.values(post.ratings).length} oy)
                  </span>
                )}
              </p>
            </div>

            {/* Comments Section */}
            <Comments postId={id!} />
            
          </div>
        </motion.article>
      </main>
    </div>
  );
}

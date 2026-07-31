import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Save user to 'users' collection
      if (result.user) {
        try {
          const userRef = doc(db, 'users', result.user.uid);
          
          const userData: any = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            lastLoginAt: serverTimestamp()
          };

          if (result.user.metadata.creationTime) {
             userData.createdAt = new Date(result.user.metadata.creationTime);
          }

          await setDoc(userRef, userData, { merge: true });
        } catch (e) {
          console.error('Error saving user to firestore:', e);
        }
      }

      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/network-request-failed' || err.code === 'auth/internal-error') {
        setError('Bağlantı hatası veya tarayıcı engeli. Lütfen uygulamayı yeni sekmede açmayı deneyin (tarayıcınızın çerezleri engellemediğinden emin olun).');
      } else {
        setError(err.message || 'Giriş yapılamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white flex items-center justify-center p-4">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1A0B2E] backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-600 text-white p-3 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">OYUNARŞİVİM.com</h1>
          <p className="text-white/60">Yorum yapmak ve topluluğa katılmak için giriş yapın</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-[#1A0B2E] backdrop-blur border border-white/20 hover:bg-[#2D164B] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {loading ? 'Giriş yapılıyor...' : 'Google ile Giriş Yap'}
        </button>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-sm text-white/60 hover:text-white hover:underline transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </motion.div>
    </div>
  );
}

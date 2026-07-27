import { ADMIN_EMAILS, hasAdminOrEditorAccess } from '../lib/utils';
import { Search, Instagram, Youtube, Video, Menu, X as CloseIcon, LogOut, ShieldAlert, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { NotificationsCenter } from './NotificationsCenter';

// Simple TikTok SVG Icon Component
const TiktokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export function Header({ onSearch, rightContent }: { onSearch?: (query: string) => void, rightContent?: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setShowProfileMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1A0B2E] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            className="xl:hidden p-2 shrink-0 text-purple-900 dark:text-purple-100 hover:bg-purple-200/50 dark:hover:bg-purple-500/10 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link to="/" className="flex items-center gap-2 min-w-0 shrink-0">
            <img 
              src="/Oyunarşivim.com.png?v=1785150042147" 
              alt="OOYUNARŞİVİM.com Logo" 
              className="h-8 sm:h-12 w-auto max-w-[160px] sm:max-w-[250px] object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-white/80">
          <Link to="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
          <div className="relative group">
            <button className="hover:text-white transition-colors py-2">Kategoriler</button>
            <div className="absolute top-full left-0 w-48 bg-[#1A0B2E] border border-white/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              <Link to="/?category=DLS+FORMALARI" className="block px-4 py-2 hover:bg-[#2D164B]">DLS FORMALARI</Link>
              <Link to="/?category=DLS+19+MODLARI" className="block px-4 py-2 hover:bg-[#2D164B]">DLS 19 MODLARI</Link>
              <Link to="/?category=PSP+PES+SERİSİ" className="block px-4 py-2 hover:bg-[#2D164B]">PSP PES SERİSİ</Link>
              <Link to="/?category=FTS+MODLARI" className="block px-4 py-2 hover:bg-[#2D164B]">FTS MODLARI</Link>
              <Link to="/?category=DİĞER+OYUNLAR" className="block px-4 py-2 hover:bg-[#2D164B]">DİĞER OYUNLAR</Link>
              <Link to="/?category=BİLGİLENDİRMELER" className="block px-4 py-2 hover:bg-[#2D164B]">BİLGİLENDİRMELER</Link>
            </div>
          </div>
          <Link to="/hakkinda" className="hover:text-white transition-colors">Hakkında</Link>
          <Link to="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
        </nav>

        {onSearch && (
          <div className="flex-1 max-w-md hidden xl:block mx-4">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-[#9333ea] transition-colors" />
              <input
                type="text"
                placeholder="Haberlerde, oyunlarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A0B2E] border-2 border-[#9333ea] rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] backdrop-blur-md placeholder:text-white/40 text-white transition-all"
              />
            </form>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {onSearch && (
            <button 
              className="xl:hidden p-2 text-purple-900 dark:text-purple-100 hover:bg-purple-200/50 dark:hover:bg-purple-500/10 rounded-full transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          
          <div className="hidden sm:flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2">
            <a href="https://instagram.com/aveniragames" target="_blank" rel="noopener noreferrer" className="p-2 text-white/60 hover:bg-[#2D164B] hover:text-white rounded-full transition-colors">
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a href="https://www.youtube.com/@AVENIRAGAMES" target="_blank" rel="noopener noreferrer" className="p-2 text-white/60 hover:bg-[#2D164B] hover:text-white rounded-full transition-colors">
              <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a href="https://www.tiktok.com/@avenira.games" target="_blank" rel="noopener noreferrer" className="p-2 text-white/60 hover:bg-[#2D164B] hover:text-white rounded-full transition-colors">
              <TiktokIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>

          {user && <NotificationsCenter user={user} />}
          <div className="hidden sm:block h-6 w-[1px] bg-white/20"></div>
          
          {rightContent ? (
            rightContent
          ) : user ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Profile" className="w-8 h-8 rounded-full border border-purple-200 dark:border-purple-500/30" />
              </button>
              
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-[#1A0B2E] border border-white/10 rounded-xl shadow-lg z-50 py-2 overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/10 mb-2 truncate">
                      <p className="text-xs text-white/50">Giriş yapıldı</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>
                    
                    {(hasAdminOrEditorAccess(user)) && (
                      <>
                        <Link 
                          to="/admin" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-[#2D164B]"
                        >
                          <ShieldAlert className="w-4 h-4" /> Yönetim Paneli
                        </Link>
                        <Link 
                          to="/admin/statistics" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-[#2D164B]"
                        >
                          <BarChart2 className="w-4 h-4" /> İstatistikler
                        </Link>
                      </>
                    )}
                    
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#2D164B] text-left"
                    >
                      <LogOut className="w-4 h-4" /> Çıkış Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#9333ea] text-white hover:bg-[#7e22ce] text-xs sm:text-sm font-bold rounded-xl hover:scale-105 transition-transform whitespace-nowrap">
              <span className="hidden sm:inline">Giriş Yap / Kaydol</span>
              <span className="sm:hidden">Giriş</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile Search */}
      {onSearch && isSearchOpen && (
        <div className="xl:hidden px-4 pb-4 animate-in slide-in-from-top-2 bg-[#1A0B2E]">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-[#9333ea] transition-colors" />
            <input
              type="text"
              placeholder="Haberlerde, oyunlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-[#1A0B2E] border-2 border-[#9333ea] rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] backdrop-blur-md placeholder:text-white/40 text-white transition-all"
            />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden border-t border-white/10 bg-[#1A0B2E]">
          <nav className="flex flex-col py-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-white/80 hover:bg-[#2D164B]">Ana Sayfa</Link>
            <div className="px-4 py-2">
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Kategoriler</p>
              <div className="flex flex-col gap-1 pl-2 border-l-2 border-white/10">
                <Link to="/?category=DLS+FORMALARI" onClick={() => setIsMenuOpen(false)} className="py-2 px-2 text-sm text-white/70 hover:text-white">DLS FORMALARI</Link>
                <Link to="/?category=DLS+19+MODLARI" onClick={() => setIsMenuOpen(false)} className="py-2 px-2 text-sm text-white/70 hover:text-white">DLS 19 MODLARI</Link>
                <Link to="/?category=PSP+PES+SERİSİ" onClick={() => setIsMenuOpen(false)} className="py-2 px-2 text-sm text-white/70 hover:text-white">PSP PES SERİSİ</Link>
                <Link to="/?category=FTS+MODLARI" onClick={() => setIsMenuOpen(false)} className="py-2 px-2 text-sm text-white/70 hover:text-white">FTS MODLARI</Link>
                <Link to="/?category=DİĞER+OYUNLAR" onClick={() => setIsMenuOpen(false)} className="py-2 px-2 text-sm text-white/70 hover:text-white">DİĞER OYUNLAR</Link>
                <Link to="/?category=BİLGİLENDİRMELER" onClick={() => setIsMenuOpen(false)} className="py-2 px-2 text-sm text-white/70 hover:text-white">BİLGİLENDİRMELER</Link>
              </div>
            </div>
            <Link to="/hakkinda" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-white/80 hover:bg-[#2D164B]">Hakkında</Link>
            <Link to="/iletisim" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-white/80 hover:bg-[#2D164B]">İletişim</Link>
            
            <div className="px-4 py-3 mt-2 border-t border-white/10 flex items-center justify-center gap-4">
              <a href="https://instagram.com/aveniragames" target="_blank" rel="noopener noreferrer" className="p-2 text-white/70 hover:bg-[#2D164B] hover:text-white rounded-full transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@AVENIRAGAMES" target="_blank" rel="noopener noreferrer" className="p-2 text-white/70 hover:bg-[#2D164B] hover:text-white rounded-full transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@avenira.games" target="_blank" rel="noopener noreferrer" className="p-2 text-white/70 hover:bg-[#2D164B] hover:text-white rounded-full transition-colors">
                <TiktokIcon className="w-5 h-5" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

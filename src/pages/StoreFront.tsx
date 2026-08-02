import React, { useEffect, useState, useRef } from "react";
import { Heart, DollarSign } from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
  increment
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Game } from "../types";
import { Header } from "../components/Header";
import { GameSlider } from "../components/GameSlider";

import { GameCard } from "../components/GameCard";
import { NotificationPrompt } from "../components/NotificationPrompt";
import { AdSense } from "../components/AdSense";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { motion } from "motion/react";

export function StoreFront() {
  const [games, setGames] = useState<Game[]>([]);
  
  

  useEffect(() => {
    document.title = 'OYUNARŞİVİM.com | Mobil Futbol Arşivim';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Mobil futbol oyunları ile ilgili güncel mod ve yamaları ücretsiz olarak sitemizden indirebilirsiniz!');
    }
  }, []);
  
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [quotaError, setQuotaError] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const initialLoad = useRef(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    // Kategori veya arama değiştiğinde 1. sayfaya dön
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);
  const handleCategorySelect = (category: string | null) => {

    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    const q = query(collection(db, "games"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const gamesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Game[];
        const publishedGames = gamesData.filter(g => !g.status || g.status === 'published');
        setGames(publishedGames);
        setLoading(false);

        if (initialLoad.current) {
          initialLoad.current = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const game = change.doc.data() as Game;
            if (
              game.category === "Bilgilendirmeler" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("AVENIRAGAMES - Yeni Bilgilendirme", {
                body: game.title,
                icon: game.imageUrl || "/Oyunarşivim.com.png?v=1785150053944",
              });
            }
          }
        });
      },
      (error: any) => {
        if (error?.code !== "resource-exhausted") { console.error("Error fetching games:", error); }
        if (error.code === 'resource-exhausted') {
          setQuotaError(true);
        }
        setLoading(false);
      },
    );

    

    

    

    return () => {
      unsubscribe();
      };
  }, []);

  const categories = [
    "DLS FORMALARI",
    "DLS 19 MODLARI",
    "PSP PES SERİSİ",
    "FTS MODLARI",
    "DİĞER OYUNLAR",
    "BİLGİLENDİRMELER",
  ];

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? game.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const featuredGames = games.slice(0, 3);

  

  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#0F051D] text-white font-sans transition-colors duration-300 relative">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#9333ea]/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <Header onSearch={setSearchQuery} />

      <main className="flex-1 flex flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full relative z-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 text-white/60">
            <h2 className="text-2xl font-bold mb-2">
              AVENIRAGAMES'e Hoş Geldiniz
            </h2>
            <p>
              Şu an içerik bulunmuyor. Yeni haberler için daha sonra tekrar
              kontrol edin!
            </p>
          </div>
        ) : (
          <>
            {!searchQuery && !selectedCategory && featuredGames.length > 0 && (
              <section className="mb-4">
                <div className="flex flex-col xl:flex-row gap-6 mb-4">
                  <div className="flex-1 min-w-0">
                    <GameSlider games={featuredGames} />
                  </div>
                  <div className="w-full xl:w-[320px] 2xl:w-[350px] flex-shrink-0 flex flex-col gap-4">
                    
                    <a
                      href="https://donate.bynogame.com/yarimvolee"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 bg-[#00c853] hover:bg-[#00e676] text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-[#00c853]/20 flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-5 h-5" />
                      BAĞIŞ YAP
                    </a>
                  </div>
                </div>
                <AdSense />
              </section>
            )}

            <section className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {searchQuery
                    ? "Arama Sonuçları"
                    : selectedCategory
                      ? `${selectedCategory} Haberleri`
                      : "Öne Çıkan Haberler"}
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className="text-sm font-medium text-indigo-400 hover:underline"
                  >
                    Tüm Haberleri Göster
                  </button>
                )}
              </div>

              {filteredGames.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {paginatedGames.map((game) => (
                      <div key={game.id}>
                        <GameCard game={game} />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 sm:gap-4 mb-12">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 sm:px-4 py-2 rounded-xl border border-white/10 bg-[#1A0B2E] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D164B] transition-colors font-medium text-xs sm:text-sm backdrop-blur-sm"
                      >
                        Önceki
                      </button>

                      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide py-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold transition-colors ${
                              currentPage === page
                                ? "bg-[#9333ea] text-white shadow-md border-indigo-500"
                                : "bg-[#1A0B2E] text-white border border-white/10 hover:bg-[#2D164B] backdrop-blur-sm"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 sm:px-4 py-2 rounded-xl border border-white/10 bg-[#1A0B2E] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D164B] transition-colors font-medium text-xs sm:text-sm backdrop-blur-sm"
                      >
                        Sonraki
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-white/60 bg-[#1A0B2E] backdrop-blur-lg rounded-2xl border border-white/10 mb-12">
                  <p>
                    {searchQuery
                      ? `"${searchQuery}" ile eşleşen haber bulunamadı`
                      : "Bu kategoride haber bulunamadı"}
                  </p>
                </div>
              )}

              {!searchQuery && !selectedCategory && (
                <>
                  {/* Kanallar */}
                  <div className="mb-12">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-6">
                      Kanallar
                    </h3>
                    <div className="flex flex-wrap gap-6">
                      {/* Kanal 1 */}
                      <div className="bg-[#1A0B2E] backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center w-full sm:w-48 text-center transition-transform hover:-translate-y-1 shadow-sm">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 bg-gray-800">
                          <img
                            src="https://yt3.googleusercontent.com/m5NxS2973U4GHvfMST-KPiPRLobMFwQECMKw6cEjRQNGqCRpxSsz9dJbVQ0Hu62pJoAIRsnAmw=s900-c-k-c0x00ffffff-no-rj"
                            alt="21MUHAMMED09"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-white mb-4 line-clamp-1">
                          21MUHAMMED09
                        </h4>
                        <a
                          href="https://www.youtube.com/@21MUHAMMED09"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-xl w-full transition-colors text-sm hover:scale-105 shadow-lg shadow-red-600/20"
                        >
                          Abone Ol
                        </a>
                      </div>

                      {/* Kanal 2 */}
                      <div className="bg-[#1A0B2E] backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center w-full sm:w-48 text-center transition-transform hover:-translate-y-1 shadow-sm">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 bg-gray-800">
                          <img
                            src="https://yt3.googleusercontent.com/i6NrcDK4dVfpiBSwUQU8xlx13z0XBGwHNikctVZOLEyyUi4qmqpP7MIrhST-FIPFZP4V_nBCig=s900-c-k-c0x00ffffff-no-rj"
                            alt="AVENIRAGAMES"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-white mb-4 line-clamp-1">
                          AVENIRAGAMES
                        </h4>
                        <a
                          href="https://www.youtube.com/@AVENIRAGAMES"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-xl w-full transition-colors text-sm hover:scale-105 shadow-lg shadow-red-600/20"
                        >
                          Abone Ol
                        </a>
                      </div>
                    </div>
                  </div>

                </>
              )}

              {/* Kategoriler */}

              {/* Kategoriler */}
              <div className="mt-auto pt-8 border-t border-white/10">
                <h3 className="text-lg font-bold text-white tracking-tight mb-4">
                  Kategoriler
                </h3>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() =>
                        handleCategorySelect(
                          category === selectedCategory ? null : category,
                        )
                      }
                      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm
                        ${
                          selectedCategory === category
                            ? "bg-white text-black shadow-lg"
                            : "bg-[#1A0B2E] text-white/80 hover:bg-[#2D164B] hover:text-white border border-white/10 backdrop-blur-sm"
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="px-4 md:px-8 py-6 bg-transparent text-[10px] md:text-xs text-white/50 flex flex-col md:flex-row justify-between items-center gap-4 uppercase tracking-widest border-t border-white/10 mt-12 z-10 relative">
        <span>© 2026 OYUNARŞİVİM.com</span>
        <div className="flex space-x-4 md:space-x-6">
          <Link
            to="/hizmet-sartlari"
            className="hover:text-white transition-colors"
          >
            Hizmet Şartları
          </Link>
          <Link
            to="/gizlilik-politikasi"
            className="hover:text-white transition-colors"
          >
            Gizlilik Politikası
          </Link>
        </div>
      </footer>

      <NotificationPrompt />
    </div>
  );
}

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
import { Game, WeeklyQuestion, Giveaway, Product } from "../types";
import { Header } from "../components/Header";
import { GameSlider } from "../components/GameSlider";
import { ProductSlider } from "../components/ProductSlider";
import { GameCard } from "../components/GameCard";
import { NotificationPrompt } from "../components/NotificationPrompt";
import { AdSense } from "../components/AdSense";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { motion } from "motion/react";

export function StoreFront() {
  const [games, setGames] = useState<Game[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<WeeklyQuestion | null>(
    null,
  );

  useEffect(() => {
    document.title = 'OYUNARŞİVİM.com | Mobil Futbol Arşivim';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Mobil futbol oyunları ile ilgili güncel mod ve yamaları ücretsiz olarak sitemizden indirebilirsiniz!');
    }
  }, []);
  const [activeGiveaway, setActiveGiveaway] = useState<Giveaway | null>(null);
  const [giveawayAnswer, setGiveawayAnswer] = useState("");
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
      (error) => {
        console.error("Error fetching games:", error);
        setLoading(false);
      },
    );

    const qQuestions = query(
      collection(db, "weeklyQuestions"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribeQuestions = onSnapshot(qQuestions, (snapshot) => {
      const qsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WeeklyQuestion[];
      const activeQ = qsData.find((q) => q.active);
      setActiveQuestion(activeQ || null);
    }, (error: any) => {
      console.error("Questions error", error);
    });

    const qGiveaways = query(
      collection(db, "giveaways"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribeGiveaways = onSnapshot(qGiveaways, (snapshot) => {
      const gData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Giveaway[];
      const activeG = gData.find((g) => g.active);
      setActiveGiveaway(activeG || null);
    }, (error: any) => {
      console.error("Giveaways error", error);
    });

    const qProducts = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const pData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      const activeProducts = pData.filter(p => p.active);
      setProducts(activeProducts);
    }, (error: any) => {
      console.error("Products error", error);
    });

    return () => {
      unsubscribe();
      unsubscribeQuestions();
      unsubscribeGiveaways();
      unsubscribeProducts();
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

  const handleVote = async (optionIndex: number) => {
    if (!auth.currentUser) {
      return;
    }
    if (!activeQuestion || !activeQuestion.id) return;

    try {
      const questionRef = doc(db, "weeklyQuestions", activeQuestion.id);
      await updateDoc(questionRef, {
        [`votes.${auth.currentUser.uid}`]: optionIndex,
      });
    } catch (error: any) {
      console.error("Error voting:", error.message);
    }
  };

  const getVotePercentages = () => {
    if (!activeQuestion || !activeQuestion.votes) return [0, 0, 0, 0];
    const totalVotes = Object.keys(activeQuestion.votes).length;
    if (totalVotes === 0) return [0, 0, 0, 0];

    const counts = [0, 0, 0, 0];
    Object.values(activeQuestion.votes).forEach((voteIndex: unknown) => {
      const idx =
        typeof voteIndex === "number"
          ? voteIndex
          : parseInt(String(voteIndex), 10);
      if (counts[idx] !== undefined) {
        counts[idx]++;
      }
    });

    return counts.map((count) => Math.round((count / totalVotes) * 100));
  };

  const percentages = getVotePercentages();
  const totalVotesCount = activeQuestion?.votes
    ? Object.keys(activeQuestion.votes).length
    : 0;
  const userVoteIndex =
    auth.currentUser &&
    activeQuestion?.votes &&
    activeQuestion.votes[auth.currentUser.uid] !== undefined
      ? activeQuestion.votes[auth.currentUser.uid]
      : -1;

  const userParticipatedGiveaway =
    auth.currentUser &&
    activeGiveaway?.participants &&
    activeGiveaway.participants[auth.currentUser.uid];

  const handleGiveawaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      return;
    }
    if (!activeGiveaway || !activeGiveaway.id || !giveawayAnswer.trim()) return;

    try {
      const giveawayRef = doc(db, "giveaways", activeGiveaway.id);
      await updateDoc(giveawayRef, {
        [`participants.${auth.currentUser.uid}`]: {
          userId: auth.currentUser.uid,
          userName: auth.currentUser.displayName || "İsimsiz",
          answer: giveawayAnswer.trim(),
          createdAt: serverTimestamp(),
        },
      });
      setGiveawayAnswer("");
    } catch (error: any) {
      console.error("Error joining giveaway:", error.message);
    }
  };

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
                    <ProductSlider products={[
                      {
                        id: "static-1",
                        title: "DLS Oyun Rehberi",
                        description: "Dream League Soccer'da Bilinmeyen Püf Noktalar & Taktikler",
                        price: "10 TL",
                        badge: "Dijital Ürün",
                        imageUrl: "https://i.ibb.co/QvWjtX4g/YARIMVOLE-375e0bbcfceaf9ebffb1e493b728eb7e.png",
                        link: "https://www.shopier.com/YARIMVOLE/48501113",
                        active: true,
                        createdAt: new Date()
                      },
                      ...products
                    ]} />
                    
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

                  {/* Çekiliş */}
                  {activeGiveaway && (
                    <div className="mb-12">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
                        <Gift className="w-6 h-6 text-indigo-400" />
                        Çekiliş: {activeGiveaway.title}
                      </h3>
                      <div className="bg-[#1A0B2E] backdrop-blur-xl rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>

                        <div className="relative z-10">
                          <div className="flex flex-wrap gap-4 mb-6">
                            <div className="bg-[#1A0B2E] rounded-xl px-4 py-3 border border-white/10 flex-1 min-w-[140px]">
                              <span className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-wider block mb-1">Katılımcı Sayısı</span>
                              <span className="font-bold text-xl sm:text-2xl text-white">
                                {activeGiveaway.participants ? Object.keys(activeGiveaway.participants).length : 0} Kişi
                              </span>
                            </div>
                            {activeGiveaway.endDate && (
                              <div className="bg-[#1A0B2E] rounded-xl px-4 py-3 border border-white/10 flex-1 min-w-[140px]">
                                <span className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-wider block mb-1">Bitiş Tarihi</span>
                                <span className="font-bold text-xl sm:text-2xl text-white">
                                  {new Date(activeGiveaway.endDate).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                            )}
                          </div>

                          <h4 className="text-lg font-semibold mb-4 text-indigo-200">
                            Katılım Şartları / Açıklama
                          </h4>
                          <p className="text-white/80 whitespace-pre-wrap mb-8 text-sm sm:text-base">
                            {activeGiveaway.conditions}
                          </p>

                          {userParticipatedGiveaway ? (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                              <p className="text-green-300 font-medium">
                                Bu çekilişe katıldınız. Bol şans!
                              </p>
                            </div>
                          ) : (
                            <form
                              onSubmit={handleGiveawaySubmit}
                              className="space-y-4 max-w-xl"
                            >
                              <textarea
                                value={giveawayAnswer}
                                onChange={(e) => setGiveawayAnswer(e.target.value)}
                                placeholder="Cevabınızı buraya yazın..."
                                className="w-full bg-[#1A0B2E] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px] resize-y"
                                required
                              />
                              <button
                                type="submit"
                            disabled={!giveawayAnswer.trim()}
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90"
                          >
                            Çekilişe Katıl
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}
                </>
              )}

              {/* Haftanın Sorusu */}
              {activeQuestion && (
                <div className="mb-12">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-6">
                    {activeQuestion.type === "quiz"
                      ? "Günün Sorusu"
                      : "Haftanın Anketi"}
                  </h3>
                  <div className="bg-[#1A0B2E] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 opacity-10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10 flex flex-col items-center text-center w-full">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-sm">
                        Sizce?
                      </span>
                      <p className="text-xl sm:text-2xl font-medium leading-relaxed max-w-3xl mb-8">
                        "{activeQuestion.question}"
                      </p>

                      {activeQuestion.options &&
                        activeQuestion.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                            {activeQuestion.options.map((option, idx) => {
                              if (!option.trim()) return null;
                              const isVoted = userVoteIndex === idx;
                              const hasUserVoted = userVoteIndex !== -1;
                              const percentage = hasUserVoted
                                ? percentages[idx]
                                : 0;

                              let buttonStyle = `bg-white/10 hover:bg-white/20 border-white/20`;

                              if (hasUserVoted) {
                                if (activeQuestion.type === "quiz") {
                                  if (
                                    idx === activeQuestion.correctOptionIndex
                                  ) {
                                    buttonStyle = `bg-green-500/40 border-green-400 ring-2 ring-green-400/50`;
                                  } else if (isVoted) {
                                    buttonStyle = `bg-red-500/40 border-red-400 ring-2 ring-red-400/50`;
                                  }
                                } else {
                                  if (isVoted) {
                                    buttonStyle = `bg-white/30 border-white/50 ring-2 ring-white/50`;
                                  }
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleVote(idx)}
                                  disabled={!auth.currentUser || hasUserVoted}
                                  className={`relative overflow-hidden border transition-all duration-300 py-4 px-6 rounded-xl font-medium text-white shadow-sm text-left flex justify-between items-center group
                                  ${buttonStyle}
                                  ${!auth.currentUser || hasUserVoted ? "opacity-90 cursor-default hover:-translate-y-0" : "hover:-translate-y-0.5"}
                                `}
                                >
                                  {hasUserVoted && (
                                    <div
                                      className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-1000 ease-out"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  )}
                                  <span className="relative z-10 flex-1">
                                    {option}
                                  </span>
                                  {hasUserVoted && (
                                    <span className="relative z-10 font-bold ml-4">
                                      {percentage}%
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      {totalVotesCount > 0 && userVoteIndex !== -1 && (
                        <div className="mt-6 flex flex-col items-center gap-2">
                          <p className="text-sm text-white/80 font-medium bg-black/20 px-4 py-1.5 rounded-full">
                            Toplam {totalVotesCount} oy kullanıldı.
                          </p>
                          {activeQuestion.type === "quiz" && (
                            <p
                              className={`text-sm font-bold px-4 py-1.5 rounded-full mt-2
                              ${
                                userVoteIndex ===
                                activeQuestion.correctOptionIndex
                                  ? "bg-green-500/20 text-green-100 border border-green-500/30"
                                  : "bg-red-500/20 text-red-100 border border-red-500/30"
                              }`}
                            >
                              {userVoteIndex ===
                              activeQuestion.correctOptionIndex
                                ? "🎉 Tebrikler, doğru bildiniz!"
                                : "❌ Yanlış cevap."}
                            </p>
                          )}
                        </div>
                      )}
                      {!auth.currentUser && (
                        <p className="mt-6 text-sm text-white/70">
                          Oy kullanmak için giriş yapmalısınız.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

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

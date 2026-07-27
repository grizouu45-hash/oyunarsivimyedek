import { Header } from '../components/Header';
import { motion } from 'motion/react';

export function About() {
  return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A0B2E] backdrop-blur-2xl rounded-3xl overflow-hidden shadow-sm border border-white/10 p-8 md:p-12 text-center md:text-left"
        >
          <div className="flex flex-col items-center justify-center mb-10 text-center">
            <img src="/Oyunarşivim.com.png" alt="Oyunarşivim.com" className="w-auto h-40 md:h-56 object-contain mb-8 drop-shadow-2xl" />
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">HAKKINDA</h1>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-white/90 leading-relaxed text-[15px] sm:text-base mb-8">
              Mobil futbol oyunları dünyasında arayabileceğiniz her şeyi bulabildiğiniz sitemizde, çeşitli mobil futbol oyunları için; modlar, yamalar ve dosyalar paylaşıyoruz. İçeriğinde; Türkçe spiker, güncel Süper Lig kulüpleri, kariyer modları ve çok daha fazlasını barındıran harika oyunlar için sitemiz siz değerli kullanıcıların hizmetinde.
            </p>

            <h3 className="text-xl font-bold text-white mb-4">VİZYONUMUZ</h3>
            <p className="text-white/80 leading-relaxed text-[15px] sm:text-base mb-8">
              Sizlerin ihtiyaç duyduğu futbol oyunlarının mobil platformdaki eksiklerini kapatmayı hedefliyoruz. Özellikle kariyer modlu oyunlar, Türkçe dil ve spiker desteği, güncel Süper Lig kulüpleri ve çok daha fazlası ile sizlerin oyun deneyiminizi artırmayı hedefliyoruz.
            </p>

            <h3 className="text-xl font-bold text-white mb-4">TOPLULUĞUMUZ</h3>
            <p className="text-white/80 leading-relaxed text-[15px] sm:text-base">
              YouTube, İnstagram ve TikTok gibi platformlarda aktif içerik üreterek sitemizi ve içeriklerimizi daha geniş kitlelere duyuruyor ve bu harika oyunların paylaşıldığı topluluğumuza sizi de davet ediyoruz.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

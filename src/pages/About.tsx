import { Header } from '../components/Header';
import { motion } from 'motion/react';
import { Info } from 'lucide-react';

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
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shrink-0">
              <span className="text-4xl font-bold text-white">A</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">OYUNARŞİVİM.com Hakkında</h1>
              <p className="text-lg text-white/80 leading-relaxed">
                Oyun dünyasındaki en güncel gelişmeleri, son dakika haberlerini ve e-spor arenalarındaki heyecanı tek bir platformda topluyoruz. Özellikle mobil futbol oyunları (DLS) ve diğer popüler oyunlardaki güncellemeler, taktikler ve turnuvalarla ilgili en doğru bilgiyi sunmayı hedefliyoruz.
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-bold text-white mb-4">Vizyonumuz</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Oyuncuların ihtiyaç duyduğu haberlere hızlı ve güvenilir bir şekilde ulaşmasını sağlayarak, Türkiye'nin en sevilen mobil oyun ve genel oyun haber platformu olmak.
            </p>

            <h3 className="text-xl font-bold text-white mb-4">Topluluğumuz</h3>
            <p className="text-white/70 leading-relaxed">
              Biz sadece haber sunmuyoruz, aynı zamanda kocaman bir topluluğuz. YouTube, Instagram ve TikTok platformlarındaki yüz binlerce takipçimizle oyun kültürünü büyütüyor, turnuvalar ve etkinliklerle bir araya geliyoruz.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

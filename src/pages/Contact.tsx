import { Header } from '../components/Header';
import { motion } from 'motion/react';
import { Mail, MapPin, Send, DollarSign } from 'lucide-react';

export function Contact() {
  return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#9333ea]/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A0B2E] backdrop-blur-2xl rounded-3xl overflow-hidden shadow-sm border border-[#7e22ce]/20 p-8 md:p-12 text-center"
        >
          <div className="inline-flex bg-[#2D164B] text-[#a855f7] p-4 rounded-2xl mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">İletişime Geçin</h1>
          <p className="text-white/60 max-w-2xl mx-auto mb-12">
            Sorularınız, önerileriniz veya iş birlikleri için bize ulaşın. Size en kısa sürede geri dönüş yapacağız.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-[#7e22ce]/20">
              <div className="text-[#a855f7] mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-white mb-2">E-posta</h3>
              <a href="mailto:2109muhammed@gmail.com" className="text-[#a855f7] hover:underline break-all">
                2109muhammed@gmail.com
              </a>
            </div>
            
            <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-[#7e22ce]/20">
              <div className="text-[#a855f7] mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-white mb-2">Konum</h3>
              <p className="text-white/60">
                Türkiye
              </p>
            </div>

            <div className="bg-[#1A0B2E] backdrop-blur p-6 rounded-2xl border border-[#7e22ce]/20">
              <div className="text-[#a855f7] mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-white mb-2">INSTAGRAM DM</h3>
              <div className="flex flex-col gap-1">
                <a href="https://www.instagram.com/21muhammed09?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-[#a855f7] hover:underline">@21muhammed09</a>
              </div>
            </div>
          </div>

          <div className="mt-12 p-8 bg-green-500/10 rounded-3xl border border-green-500/20">
            <p className="text-white/80 mb-6 font-medium text-lg">
              Destekleriniz İçin Çok Teşekkürler
            </p>
            <a
              href="https://donate.bynogame.com/yarimvolee"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-lg font-bold rounded-2xl transition-all shadow-lg shadow-green-500/20"
            >
              <DollarSign className="w-6 h-6" />
              BAĞIŞ YAP
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

import { Header } from '../components/Header';
import { motion } from 'motion/react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white font-sans">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-24 md:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Gizlilik Politikası</h1>
          
          <div className="prose prose-invert max-w-none text-white/70">
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Toplanan Bilgiler</h2>
            <p className="mb-4">
              OYUNARŞİVİM.com olarak gizliliğinize önem veriyoruz. Sitemizi ziyaret ettiğinizde, 
              tarayıcı türünüz, IP adresiniz, ziyaret saatleriniz ve sitemizde geçirdiğiniz 
              süre gibi bazı istatistiksel ve anonim veriler otomatik olarak toplanabilir.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Çerezler (Cookies)</h2>
            <p className="mb-4">
              Kullanıcı deneyimini geliştirmek, içerik ve reklamları kişiselleştirmek ve trafik 
              analizi yapmak için sitemizde çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan 
              çerezleri dilediğiniz zaman devre dışı bırakabilirsiniz.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Üçüncü Taraf Bağlantıları ve Reklamlar</h2>
            <p className="mb-4">
              Sitemiz, farklı web sitelerine bağlantılar verebilir veya üçüncü taraf reklam 
              sağlayıcıları (örneğin Google AdSense) kullanabilir. Bu üçüncü taraf sitelerin 
              kendi gizlilik politikaları bulunur ve onların içerikleri veya uygulamalarından 
              sorumlu değiliz.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Veri Güvenliği</h2>
            <p className="mb-4">
              Bilgilerinizi korumak için uygun güvenlik önlemlerini alıyoruz. Ancak internet 
              üzerindeki hiçbir veri aktarımının %100 güvenli olamayacağını ve sistemlerin 
              mutlak güvenliğini garanti edemeyeceğimizi lütfen unutmayın.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. İletişim</h2>
            <p className="mb-4">
              Gizlilik politikamızla ilgili herhangi bir sorunuz veya talebiniz olursa 
              <a href="mailto:2109muhammed@gmail.com" className="text-indigo-400 hover:underline mx-1">
                2109muhammed@gmail.com
              </a> 
              adresinden bizimle iletişime geçebilirsiniz.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

import { Header } from '../components/Header';
import { motion } from 'motion/react';

export function TermsOfService() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Hizmet Şartları</h1>
          
          <div className="prose prose-invert max-w-none text-white/70">
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Kabul Edilme</h2>
            <p className="mb-4">
              Bu web sitesini kullanarak veya ziyaret ederek, bu Hizmet Şartlarını ve Gizlilik Politikamızı 
              kabul etmiş sayılırsınız. Şartların herhangi bir bölümünü kabul etmiyorsanız, 
              lütfen sitemizi kullanmayı bırakın.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. İçerik ve Kullanım</h2>
            <p className="mb-4">
              Sitemizdeki tüm içerikler yalnızca bilgilendirme amaçlıdır. OYUNARŞİVİM.com, sunulan 
              bilgilerin doğruluğu ve güncelliği konusunda elinden geleni yapsa da, herhangi bir 
              garanti vermez. İçeriklerin izinsiz kopyalanması, çoğaltılması veya dağıtılması yasaktır.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Kullanıcı Sorumlulukları</h2>
            <p className="mb-4">
              Siteyi kullanırken yasalara uygun davranmayı ve diğer kullanıcıların haklarına saygı 
              göstermeyi kabul edersiniz. Siteye zarar verecek, işleyişini bozacak veya haksız erişim 
              sağlayacak herhangi bir eylemden kaçınmanız gerekmektedir.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Değişiklikler</h2>
            <p className="mb-4">
              OYUNARŞİVİM.com, bu Hizmet Şartlarını önceden bildirmeksizin istediği zaman değiştirme hakkını saklı tutar. 
              Değişiklikler sitede yayınlandığı andan itibaren geçerlidir. Sitenin güncel kullanım şartlarını takip etmek kullanıcının sorumluluğundadır.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. İletişim</h2>
            <p className="mb-4">
              Hizmet şartlarımızla ilgili her türlü soru ve öneriniz için 
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

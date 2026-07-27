import React, { useEffect, useRef } from 'react';

interface AdSenseProps {
  client?: string; // Örn: "ca-pub-1234567890123456"
  slot?: string;   // Örn: "1234567890"
  format?: string; // Örn: "auto", "fluid"
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSense({ 
  client = 'ca-pub-XXXXXXXXXXXXXXXX', // Kendi AdSense Client ID'niz ile değiştirin
  slot = 'XXXXXXXXXX',               // Kendi AdSense Slot ID'niz ile değiştirin
  format = 'auto', 
  responsive = true, 
  style, 
  className 
}: AdSenseProps) {
  
  const adPushed = useRef(false);
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!adPushed.current) {
      const pushAd = () => {
        try {
          if (typeof window !== 'undefined') {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            adPushed.current = true;
          }
        } catch (err: any) {
          if (!err.message?.includes('already have ads')) {
            console.error('AdSense error:', err);
          }
        }
      };

      // Check if width is > 0 before pushing, to prevent "No slot size for availableWidth=0"
      if (insRef.current && insRef.current.offsetWidth > 0) {
        pushAd();
      } else {
        // If width is 0 (e.g. hidden or not fully rendered), try again shortly
        const timer = setTimeout(() => {
          if (insRef.current && insRef.current.offsetWidth > 0) {
             pushAd();
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <div className={`adsense-wrapper w-full flex justify-center my-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl overflow-hidden min-h-[100px] border border-dashed border-gray-200 dark:border-gray-700 items-center relative ${className || ''}`}>
      {/* Bu div sadece test ortamında reklamın nerede çıkacağını göstermek için */}
      <span className="absolute text-xs text-gray-400 font-medium">Reklam Alanı</span>
      
      <ins
        ref={insRef}
        className="adsbygoogle relative z-10"
        style={{ display: 'block', width: '100%', minHeight: '100px', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}


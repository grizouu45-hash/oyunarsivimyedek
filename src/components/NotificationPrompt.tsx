import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkNotificationStatus = () => {
      const status = localStorage.getItem('notifications_prompt_status');
      const lastAsked = localStorage.getItem('notifications_prompt_last_asked');
      
      if (status === 'accepted') {
        return;
      }
      
      if (status === 'declined' && lastAsked) {
        const lastAskedTime = parseInt(lastAsked, 10);
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (Date.now() - lastAskedTime < oneDay) {
          return;
        }
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        localStorage.setItem('notifications_prompt_status', 'accepted');
        return;
      }

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    };

    checkNotificationStatus();
  }, []);

  const handleAccept = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setIsVisible(false);
        if (permission === 'granted') {
          localStorage.setItem('notifications_prompt_status', 'accepted');
        } else {
          // If they block it, we should probably set to declined but maybe not bug them. Let's just treat as declined.
          localStorage.setItem('notifications_prompt_status', 'declined');
          localStorage.setItem('notifications_prompt_last_asked', Date.now().toString());
        }
      });
    } else {
      setIsVisible(false);
      localStorage.setItem('notifications_prompt_status', 'accepted');
    }
  };

  const handleDecline = () => {
    setIsVisible(false);
    localStorage.setItem('notifications_prompt_status', 'declined');
    localStorage.setItem('notifications_prompt_last_asked', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-80 bg-white dark:bg-[#2D164B] border border-purple-200 dark:border-purple-400/30 p-5 rounded-2xl shadow-2xl z-50 backdrop-blur-md"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-100 dark:bg-purple-600/30 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
            <button onClick={handleDecline} className="text-gray-400 dark:text-purple-300/50 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-[#E0E0E0] mb-1">Bildirimleri açmak ister misiniz?</p>
          <p className="text-xs text-gray-500 dark:text-purple-200/60 mb-4">
            En yeni haberlerden ve gelişmelerden anında haberdar olun.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleAccept}
              className="flex-1 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-500 transition-colors"
            >
              Evet
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 py-2 bg-gray-50 dark:bg-[#1A0B2E] text-gray-700 dark:text-purple-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-purple-500/20 hover:bg-gray-100 dark:hover:bg-[#1A0B2E]/80 transition-colors"
            >
              Hayır
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

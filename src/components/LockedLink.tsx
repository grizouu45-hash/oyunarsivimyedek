import React, { useState, useEffect } from 'react';
import { ExternalLink, Lock, Unlock } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { isAdminUser } from '../lib/utils';
import { motion } from 'motion/react';

interface LockedLinkProps {
  url: string;
  title: string;
  className?: string;
  key?: any;
}

export function LockedLink({ url, title, className }: LockedLinkProps) {
  const [timeLeft, setTimeLeft] = useState(59);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const isAdmin = isAdminUser(user);
  const isLocked = timeLeft > 0;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLocked && !isAdmin) {
      e.preventDefault();
      // Optional: alert('Lütfen sürenin dolmasını bekleyin.');
    }
  };

  const lockedStyles = "bg-[#2d4a22] text-white border border-[#388e3c]/30";
  const unlockedStyles = "bg-[#00c853] hover:bg-[#00e676] text-white shadow-lg shadow-[#00c853]/20";
  const currentStyles = isLocked ? lockedStyles : unlockedStyles;

  const defaultClassName = `inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${currentStyles}`;

  return (
    <motion.a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      onClick={handleClick}
      className={className || defaultClassName}
      style={{ cursor: (isLocked && !isAdmin) ? 'not-allowed' : 'pointer' }}
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      animate={!isLocked && timeLeft === 0 ? {
        x: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.4, ease: "easeInOut" }
      } : {}}
    >
      {isLocked ? <Lock className="w-4 h-4 opacity-70" /> : <ExternalLink className="w-4 h-4" />}
      {title}
      {isLocked && (
        <span className="ml-2 px-2 py-0.5 text-xs bg-[#1b5e20] text-white rounded-md font-bold shadow-inner">
          {timeLeft}s
        </span>
      )}
    </motion.a>
  );
}

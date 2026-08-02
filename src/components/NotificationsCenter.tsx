import { ADMIN_EMAILS, hasAdminOrEditorAccess } from '../lib/utils';
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notification } from '../types';
import { User } from 'firebase/auth';
import { Bell, Check, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function NotificationsCenter({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isAdmin = user.email ? hasAdminOrEditorAccess(user) : false;

  useEffect(() => {
    // Listen for user, admin, and global notifications
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', isAdmin ? [user.uid, 'admin', 'all'] : [user.uid, 'all'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const readGlobal = JSON.parse(localStorage.getItem(`read_notifs_${user.uid}`) || '[]');
      
      const notifsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let isRead = data.read;
        if (data.userId === 'all') {
          isRead = readGlobal.includes(doc.id);
        }
        return {
          id: doc.id,
          ...data,
          read: isRead
        } as Notification;
      });
      
      // Sort client-side
      notifsData.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : Date.now();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : Date.now();
        return timeB - timeA;
      });
      
      setNotifications(notifsData);
    }, (error: any) => { if (error?.code !== "resource-exhausted") { console.error("Notifications error", error) } });

    return () => unsubscribe();
  }, [user, isAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notification: Notification) => {
    if (!notification.id) return;
    try {
      if (notification.userId === 'all') {
        const readGlobal = JSON.parse(localStorage.getItem(`read_notifs_${user.uid}`) || '[]');
        if (!readGlobal.includes(notification.id)) {
          readGlobal.push(notification.id);
          localStorage.setItem(`read_notifs_${user.uid}`, JSON.stringify(readGlobal));
          setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        }
      } else {
        await updateDoc(doc(db, 'notifications', notification.id), {
          read: true
        });
      }
    } catch (error) {
      if (error?.code !== "resource-exhausted") { console.error('Error marking as read', error); }
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notif of unread) {
      await markAsRead(notif);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification);
    }
    setIsOpen(false);
    navigate(`/post/${notification.postId}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-purple-900 dark:text-purple-100 hover:bg-purple-200/50 dark:hover:bg-purple-500/10 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#1A0B2E] border border-purple-100 dark:border-purple-800 rounded-xl shadow-xl z-50">
          <div className="sticky top-0 bg-white/90 dark:bg-[#1A0B2E]/90 backdrop-blur-md p-3 border-b border-purple-100 dark:border-purple-800 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Tümünü Okundu İşaretle
              </button>
            )}
          </div>

          <div className="p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Henüz bildiriminiz yok.
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex gap-3 items-start ${
                    notification.read 
                      ? 'hover:bg-gray-50 dark:hover:bg-purple-900/20' 
                      : 'bg-purple-50/50 dark:bg-purple-900/40 hover:bg-purple-100/50 dark:hover:bg-purple-900/60'
                  }`}
                >
                  <img 
                    src={notification.senderPhoto || `https://ui-avatars.com/api/?name=${notification.senderName}`} 
                    alt={notification.senderName}
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-semibold">{notification.senderName}</span>
                      {notification.type === 'reply' ? ' yorumuna cevap verdi.' : notification.type === 'like' ? ' yorumunu beğendi.' : ' yeni bir yorum yaptı.'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">"{notification.text.replace('Yorumunu beğendi: ', '')}"</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Şimdi'}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0 mt-1.5"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

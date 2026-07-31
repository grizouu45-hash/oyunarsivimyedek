import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Search, Calendar } from 'lucide-react';

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
}

export function AdminUsersModal({ isOpen, onClose, users }: AdminUsersModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  if (!isOpen) return null;

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (selectedDate) {
      const dateField = user.createdAt || user.lastLoginAt;
      if (dateField && dateField.toDate) {
        const userDate = new Date(dateField.toDate());
        const userDateString = `${userDate.getFullYear()}-${(userDate.getMonth() + 1).toString().padStart(2, '0')}-${userDate.getDate().toString().padStart(2, '0')}`;
        matchesDate = userDateString === selectedDate;
      } else if (dateField && dateField instanceof Date) {
        // if we just saved it as a native Date from our new code
        const userDate = dateField;
        const userDateString = `${userDate.getFullYear()}-${(userDate.getMonth() + 1).toString().padStart(2, '0')}-${userDate.getDate().toString().padStart(2, '0')}`;
        matchesDate = userDateString === selectedDate;
      } else if (dateField && typeof dateField.seconds === 'number') {
        const userDate = new Date(dateField.seconds * 1000);
        const userDateString = `${userDate.getFullYear()}-${(userDate.getMonth() + 1).toString().padStart(2, '0')}-${userDate.getDate().toString().padStart(2, '0')}`;
        matchesDate = userDateString === selectedDate;
      } else {
        matchesDate = false;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#1A0B2E] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kayıtlı Kullanıcılar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Siteye üye olan tüm kullanıcılar</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0F051D]">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full sm:w-auto flex-1">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="İsim veya e-posta ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1A0B2E] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-4 pr-4 py-2 bg-white dark:bg-[#1A0B2E] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white color-scheme-dark"
                />
              </div>
            </div>
            {selectedDate && (
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg whitespace-nowrap">
                {filteredUsers.length} kişi kayıt olmuş
              </div>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-[#0F051D]">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Aradığınız kritere uygun kullanıcı bulunamadı.' : 'Henüz hiç kullanıcı yok.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white dark:bg-[#1A0B2E] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (user.displayName || user.email || 'A').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {user.displayName || 'İsimsiz Kullanıcı'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.email || 'E-posta yok'}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Kayıt: {
                        user.createdAt?.toDate ? new Date(user.createdAt.toDate()).toLocaleDateString('tr-TR') :
                        user.createdAt instanceof Date ? user.createdAt.toLocaleDateString('tr-TR') :
                        user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('tr-TR') :
                        user.lastLoginAt?.toDate ? new Date(user.lastLoginAt.toDate()).toLocaleDateString('tr-TR') : 
                        'Bilinmiyor'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

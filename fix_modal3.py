with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

modal_code = """
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCategoryModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A0B2E] border border-white/10 rounded-2xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Kategorileri Yönet</h2>
                <button 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 bg-[#0F051D] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Yeni kategori adı"
                  />
                  <button
                    onClick={async () => {
                      if (!newCategory.trim()) return;
                      const catName = newCategory.trim().toUpperCase();
                      if (categories.includes(catName)) return;
                      const updated = [...categories, catName];
                      setCategories(updated);
                      setNewCategory('');
                      const { doc, setDoc } = await import('firebase/firestore');
                      const { db } = await import('../lib/firebase');
                      await setDoc(doc(db, 'site_settings', 'categories'), { list: updated }, { merge: true });
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    Ekle
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#0F051D] border border-white/5 p-3 rounded-xl">
                      <span className="text-white font-medium">{cat}</span>
                      <button
                        onClick={async () => {
                          const updated = categories.filter(c => c !== cat);
                          setCategories(updated);
                          const { doc, setDoc } = await import('firebase/firestore');
                          const { db } = await import('../lib/firebase');
                          await setDoc(doc(db, 'site_settings', 'categories'), { list: updated }, { merge: true });
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                     <div className="text-center text-white/50 text-sm py-4">Henüz kategori eklenmedi.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
"""

# Let's insert it right before the closing main tag
idx = text.find('</main>')
if idx != -1:
    text = text[:idx] + modal_code + text[idx:]

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(text)

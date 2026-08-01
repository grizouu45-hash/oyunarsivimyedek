import re

with open('src/pages/AdminPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

state_add = """  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(["DLS FORMALARI", "DLS 19 MODLARI", "PSP PES SERİSİ", "FTS MODLARI", "DİĞER OYUNLAR", "BİLGİLENDİRMELER"]);
  const [newCategory, setNewCategory] = useState("");
"""

content = content.replace('  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);', state_add + '  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);')


fetch_cat = """      const catRef = doc(db, 'site_settings', 'categories');
      const catDoc = await getDoc(catRef);
      if (catDoc.exists() && catDoc.data().list) {
        setCategories(catDoc.data().list);
      }
"""

content = content.replace('      const q = query(collection(db, \'games\'), orderBy(\'createdAt\', \'desc\'));', fetch_cat + '      const q = query(collection(db, \'games\'), orderBy(\'createdAt\', \'desc\'));')

button_add = """            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Kategori Yönet</span>
            </button>
"""

content = content.replace('            <button\n              onClick={handleOpenBloggerModal}', button_add + '            <button\n              onClick={handleOpenBloggerModal}')

# Wait, check if `Folder` is imported from lucide-react? No, we can just use `Plus`.
modal_add = """
      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

content = content.replace('      {/* Modal */}', modal_add + '\n      {/* Modal */}')

select_options = """                    <option value="">Seçiniz</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
"""
content = re.sub(r'<option value="">Seçiniz</option>.*?(?=<select|</div)', select_options, content, flags=re.DOTALL)


with open('src/pages/AdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

import { ADMIN_EMAILS, hasAdminOrEditorAccess, isAdminUser, isEditorUser } from '../lib/utils';
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth, storage } from "../lib/firebase";
import { Game } from "../types";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Gamepad2,
  X,
  Image as ImageIcon,
  Gift,
  Users,
  Download,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "../components/Header";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export function AdminPanel() {
  const [games, setGames] = useState<Game[]>([]);
  
  
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(["DLS FORMALARI", "DLS 19 MODLARI", "PSP PES SERİSİ", "FTS MODLARI", "DİĞER OYUNLAR", "BİLGİLENDİRMELER"]);
  const [newCategory, setNewCategory] = useState("");
  
  
  
        
      
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    youtubeLink: "",
    links: [] as { title: string; url: string }[],
    eventDate: "",
    eventTime: "",
    imageUrl: "",
    category: "",
    tags: "",
    status: "published",
  });

  const [isBloggerModalOpen, setIsBloggerModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [bloggerPosts, setBloggerPosts] = useState<any[]>([]);
  const [loadingBlogger, setLoadingBlogger] = useState(false);
  const [importingPostId, setImportingPostId] = useState<string | null>(null);

  const fetchBloggerPosts = () => {
    setLoadingBlogger(true);
    
    const callbackName = 'bloggerCallback_' + Math.round(100000 * Math.random());
    
    (window as any)[callbackName] = (data: any) => {
      if (data.feed?.entry) {
        setBloggerPosts(data.feed.entry);
      }
      setLoadingBlogger(false);
      delete (window as any)[callbackName];
      const scriptEl = document.getElementById(callbackName);
      if (scriptEl) scriptEl.remove();
    };

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `https://21muhammed09.blogspot.com/feeds/posts/default?alt=json-in-script&callback=${callbackName}&max-results=50`;
    script.onerror = () => {
      console.error("Blogger fetch error");
      alert("Haberleri çekerken hata oluştu.");
      setLoadingBlogger(false);
      delete (window as any)[callbackName];
      script.remove();
    };
    
    document.body.appendChild(script);
  };

  const handleOpenBloggerModal = () => {
    setIsBloggerModalOpen(true);
    fetchBloggerPosts();
  };

  const handleImportBloggerPost = async (entry: any) => {
    const entryId = entry.id.$t;
    setImportingPostId(entryId);
    try {
      let imageUrl = entry.media$thumbnail?.url || "";
      if (imageUrl) {
        imageUrl = imageUrl.replace(/\/s72\-c\//, "/s1920/");
      } else {
        const match = entry.content?.$t?.match(/<img[^>]+src="([^">]+)"/);
        if (match) {
          imageUrl = match[1];
        }
      }

      const existing = games.find(g => g.title === entry.title.$t);
      if (existing) {
        alert("Bu haber zaten ekli!");
        setImportingPostId(null);
        return;
      }

      const pubDate = new Date(entry.published.$t);
      const eventDate = pubDate.toISOString().split("T")[0];
      const eventTime = pubDate.toTimeString().substring(0, 5);
      
      const plainTextDesc = entry.content.$t.replace(/<[^>]*>?/gm, '');
      const description = plainTextDesc.substring(0, 150) + (plainTextDesc.length > 150 ? "..." : "");

      const submitData = {
        title: entry.title.$t,
        description: description,
        content: entry.content.$t,
        youtubeLink: "",
        links: [],
        eventDate: eventDate,
        eventTime: eventTime,
        imageUrl: imageUrl,
        category: "Diğer Oyunlar",
        tags: ["Blogger"],
      };
      
      const ytMatch = entry.content.$t.match(/youtube\.com\/embed\/([^"?]+)/);
      if (ytMatch) {
         submitData.youtubeLink = `https://youtube.com/watch?v=${ytMatch[1]}`;
      }

      await addDoc(collection(db, "games"), {
        ...submitData,
        createdAt: Timestamp.fromDate(pubDate),
        updatedAt: serverTimestamp(),
      });
      
      alert("Haber başarıyla eklendi!");
    } catch (error: any) {
      if (error?.code !== "resource-exhausted") { console.error("Import error", error); }
      alert("Eklenirken hata oluştu.");
    }
    setImportingPostId(null);
  };

  const handleImportAllBloggerPosts = async () => {
    if (bloggerPosts.length === 0) return;

    setLoadingBlogger(true);
    let successCount = 0;
    
    for (const post of bloggerPosts) {
      const isAlreadyAdded = games.some(g => g.title === post.title.$t);
      if (isAlreadyAdded) continue;

      try {
        let imageUrl = post.media$thumbnail?.url || "";
        if (imageUrl) {
          imageUrl = imageUrl.replace(/\/s72\-c\//, "/s1920/");
        } else {
          const match = post.content?.$t?.match(/<img[^>]+src="([^">]+)"/);
          if (match) imageUrl = match[1];
        }

        const pubDate = new Date(post.published.$t);
        const eventDate = pubDate.toISOString().split("T")[0];
        const eventTime = pubDate.toTimeString().substring(0, 5);
        
        const plainTextDesc = post.content.$t.replace(/<[^>]*>?/gm, '');
        const description = plainTextDesc.substring(0, 150) + (plainTextDesc.length > 150 ? "..." : "");

        const submitData = {
          title: post.title.$t,
          description: description,
          content: post.content.$t,
          youtubeLink: "",
          links: [],
          eventDate: eventDate,
          eventTime: eventTime,
          imageUrl: imageUrl,
          category: "Diğer Oyunlar",
          tags: ["Blogger"],
        };
        
        const ytMatch = post.content.$t.match(/youtube\.com\/embed\/([^"?]+)/);
        if (ytMatch) {
           submitData.youtubeLink = `https://youtube.com/watch?v=${ytMatch[1]}`;
        }

        await addDoc(collection(db, "games"), {
          ...submitData,
          createdAt: Timestamp.fromDate(pubDate),
          updatedAt: serverTimestamp(),
        });
        successCount++;
      } catch (error) {
        console.error("Error importing post", post.title.$t, error);
      }
    }
    
    setLoadingBlogger(false);
    alert(`${successCount} haber başarıyla eklendi!`);
    setIsBloggerModalOpen(false);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!hasAdminOrEditorAccess(currentUser)) {
        navigate("/");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "games"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const gamesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Game[];
        
        const now = Date.now();
        gamesData.forEach(g => {
          if (g.status === 'trash' && g.deletedAt) {
            try {
              const deletedTime = typeof g.deletedAt.toDate === 'function' ? g.deletedAt.toDate().getTime() : (typeof g.deletedAt === 'number' ? g.deletedAt : Date.now());
              const diffDays = (now - deletedTime) / (1000 * 60 * 60 * 24);
              if (diffDays > 30) {
                deleteDoc(doc(db, "games", g.id)).catch(e => console.error(e));
              }
            } catch (e) {
               console.error(e);
            }
          }
        });

        setGames(gamesData);
        setLoading(false);
      },
      (error: any) => {
        if (error?.code !== "resource-exhausted") { console.error("Error fetching games:", error); }
        // If permission denied, they are probably not admin
        if (error.message && error.message.includes("permission")) {
          console.error(
            "You do not have permission to access the admin panel.",
          );
          auth.signOut();
        }
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
      };
  }, [user]);

  const quillRef = useRef<ReactQuill>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const imageHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    const range = quill?.getSelection();
    const position = range ? range.index : (quill?.getLength() || 0);

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("Görsel boyutu çok büyük (Maks 5MB).");
          return;
        }
        setIsUploadingMedia(true);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            const MAX_WIDTH = 1000;
            const MAX_HEIGHT = 1000;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
              if (quill) {
                quill.insertEmbed(position, "image", compressedDataUrl);
                quill.setSelection(position + 1, 0);
              }
            }
            setIsUploadingMedia(false);
          };
          img.onerror = () => {
             alert("Görsel işlenirken hata oluştu.");
             setIsUploadingMedia(false);
          };
          img.src = reader.result as string;
        };
        reader.onerror = () => {
          alert("Dosya okunamadı.");
          setIsUploadingMedia(false);
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler],
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB initial limit before compression
        alert(
          "Dosya boyutu çok büyük (Maks 5MB). Lütfen daha küçük bir görsel seçin.",
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Max dimensions
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.7 quality
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

            // Base64 is ~33% larger, so 750KB limit for the string length equals ~1MB Firestore limit
            if (dataUrl.length > 900 * 1024) {
              alert(
                "Görsel sıkıştırıldıktan sonra bile çok büyük. Lütfen daha düşük çözünürlüklü bir görsel seçin.",
              );
              return;
            }

            setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const openAddModal = () => {
    setEditingGame(null);
    setFormData({
      title: "",
      description: "",
      content: "",
      youtubeLink: "",
      links: [] as { title: string; url: string }[],
      eventDate: "",
      eventTime: "",
      imageUrl: "",
      category: "",
      tags: "",
      status: "published",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      description: game.description,
      content: game.content || "",
      youtubeLink: game.youtubeLink || "",
      links: game.links || [],
      eventDate: game.eventDate || "",
      eventTime: game.eventTime || "",
      imageUrl: game.imageUrl,
      category: game.category,
      tags: game.tags ? game.tags.join(", ") : "",
      status: game.status || "published",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await updateDoc(doc(db, "games", id), {
        status: 'trash',
        deletedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error("Delete error:", error.message);
    }
  };;

  ;;

  ;;

  ;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        links: formData.links.filter((l) => l.url.trim() !== ""),
      };

      if (editingGame) {
        await updateDoc(doc(db, "games", editingGame.id), {
          ...submitData,
          updatedAt: serverTimestamp(),
        });
        alert("Değişiklikler başarıyla kaydedildi!");
      } else {
        const newDoc = await addDoc(collection(db, "games"), {
          ...submitData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        // Add global notification
        await addDoc(collection(db, "notifications"), {
          userId: 'all',
          postId: newDoc.id,
          type: 'post',
          senderName: 'OYUNARŞİVİM.com',
          senderPhoto: '/favicon.png', // Or some system icon
          text: `Yeni bir yama eklendi: "${submitData.title}"`,
          read: false,
          createdAt: serverTimestamp()
        });
        
        alert("Haber başarıyla eklendi!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Submit error:", error.message);
      alert("İşlem sırasında bir hata oluştu: " + error.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <Header
        rightContent={
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors bg-purple-100/50 dark:bg-purple-500/10 px-4 py-1.5 rounded-lg border border-purple-200 dark:border-purple-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Çıkış Yap</span>
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">
            Haberleri Yönet
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTrashModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Çöp Kutusu</span>
            </button>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Kategori Yönet</span>
            </button>
            <button
              onClick={handleOpenBloggerModal}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Blogger'dan Çek</span>
            </button>
            <button
              onClick={openAddModal}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Haber Ekle</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-purple-50/50 dark:bg-purple-900/20 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-purple-100 dark:border-purple-800/30">
                  <tr>
                    <th className="px-6 py-4">Haber</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Eklendi</th>
                    <th className="px-6 py-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 dark:divide-purple-800/30">
                  {games.filter(g => g.status !== 'trash').length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Haber bulunamadı. Başlamak için "Haber Ekle"ye tıklayın.
                      </td>
                    </tr>
                  ) : (
                    games.filter(g => g.status !== 'trash').map((game) => (
                      <tr
                        key={game.id}
                        className="hover:bg-purple-50/50 dark:hover:bg-purple-500/10 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {game.imageUrl ? (
                              <img
                                src={game.imageUrl}
                                alt={game.title}
                                className="w-10 h-10 rounded-lg object-cover bg-white/10"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-white/40" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white line-clamp-1">
                                {game.title}
                              </div>
                              <div className="text-xs text-white/60 line-clamp-1 max-w-[200px]">
                                {game.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-1 px-2.5 rounded-full text-xs font-medium uppercase tracking-wider">
                            {game.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs whitespace-nowrap">
                          {game.createdAt?.toDate
                            ? game.createdAt
                                .toDate()
                                .toLocaleDateString("tr-TR")
                            : "Az önce"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(game)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(game.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        </main>

      <AnimatePresence>


        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-purple-900/20 dark:bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a0b2e] rounded-2xl shadow-xl w-full max-w-lg border border-purple-100 dark:border-purple-800/50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-purple-100 dark:border-purple-500/20 bg-purple-50/50 dark:bg-[#2D164B] shrink-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {editingGame ? "Haberi Düzenle" : "Yeni Haber Ekle"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-4 overflow-y-auto flex-1"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Başlık
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  >
                                        <option value="">Seçiniz</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Görünürlük
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                    className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  >
                    <option value="published">Herkese Açık</option>
                    <option value="archived">Gizli / Arşiv</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Etiketler (Virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="örn: futbol, spor, turnuva"
                    className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Görsel Seç
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.imageUrl && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-purple-200 dark:border-purple-800">
                        <img
                          src={formData.imageUrl}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-50 file:text-purple-700
                        dark:file:bg-purple-900/50 dark:file:text-purple-300
                        hover:file:bg-purple-100 dark:hover:file:bg-purple-900/70
                        transition-all cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Açıklama (Kısa Özeti)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Detaylı İçerik
                  </label>
                  <div className="bg-white dark:bg-gray-100 rounded-xl quill-editor-container mb-4 border border-gray-200">
                    <ReactQuill
                      // @ts-ignore
                      ref={quillRef}
                      theme="snow"
                      value={formData.content}
                      onChange={(value) =>
                        setFormData({ ...formData, content: value })
                      }
                      className="text-gray-900"
                      modules={modules}
                    />
                  </div>
                  {isUploadingMedia && (
                    <div className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      Medya yükleniyor, lütfen bekleyin...
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tarih
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) =>
                        setFormData({ ...formData, eventDate: e.target.value })
                      }
                      className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Saat
                    </label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) =>
                        setFormData({ ...formData, eventTime: e.target.value })
                      }
                      className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    YouTube Video Linki
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeLink}
                    onChange={(e) =>
                      setFormData({ ...formData, youtubeLink: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ek Bağlantılar (Maksimum 10)
                    </label>
                    {formData.links.length < 10 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            links: [...formData.links, { title: "", url: "" }],
                          })
                        }
                        className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        <Plus className="w-3 h-3" /> Link Ekle
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {formData.links.map((link, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => {
                              const newLinks = [...formData.links];
                              newLinks[index].title = e.target.value;
                              setFormData({ ...formData, links: newLinks });
                            }}
                            placeholder="Bağlantı Adı (örn: İndir)"
                            className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...formData.links];
                              newLinks[index].url = e.target.value;
                              setFormData({ ...formData, links: newLinks });
                            }}
                            placeholder="https://"
                            className="w-full bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newLinks = formData.links.filter(
                              (_, i) => i !== index,
                            );
                            setFormData({ ...formData, links: newLinks });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0 mt-1 sm:mt-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-colors"
                  >
                    {editingGame ? "Değişiklikleri Kaydet" : "Haber Ekle"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        
      </AnimatePresence>

      <AnimatePresence>
        
      </AnimatePresence>

      <AnimatePresence>
        
      </AnimatePresence>

      <AnimatePresence>
        
      </AnimatePresence>

      <AnimatePresence>
        {isBloggerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-purple-900/20 dark:bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a0b2e] rounded-2xl shadow-xl w-full max-w-4xl border border-purple-100 dark:border-purple-800/50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-purple-100 dark:border-purple-500/20 bg-purple-50/50 dark:bg-[#2D164B]">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  Blogger'dan İçerik Çek
                </h3>
                <div className="flex items-center gap-3">
                  {!loadingBlogger && bloggerPosts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleImportAllBloggerPosts}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Tümünü Ekle
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsBloggerModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto p-6">
                {loadingBlogger ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400">Blogger verileri çekiliyor...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bloggerPosts.map((post) => {
                      const entryId = post.id.$t;
                      const isImporting = importingPostId === entryId;
                      const isAlreadyAdded = games.some(g => g.title === post.title.$t);

                      let imageUrl = post.media$thumbnail?.url || "";
                      if (imageUrl) {
                        imageUrl = imageUrl.replace(/\/s72\-c\//, "/s1920/");
                      } else {
                        const match = post.content?.$t?.match(/<img[^>]+src="([^">]+)"/);
                        if (match) imageUrl = match[1];
                      }

                      return (
                        <div key={entryId} className="bg-white dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-xl overflow-hidden flex flex-col shadow-sm">
                          {imageUrl ? (
                            <img src={imageUrl} alt={post.title.$t} className="w-full h-32 object-cover" />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="p-4 flex flex-col flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 text-sm">{post.title.$t}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{new Date(post.published.$t).toLocaleDateString("tr-TR")}</p>
                            <div className="mt-auto">
                              <button
                                onClick={() => handleImportBloggerPost(post)}
                                disabled={isImporting || isAlreadyAdded}
                                className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                                  isAlreadyAdded 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed"
                                    : "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                                }`}
                              >
                                {isImporting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isAlreadyAdded ? (
                                  "Zaten Ekli"
                                ) : (
                                  <>
                                    <Download className="w-4 h-4" /> İçeri Aktar
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {bloggerPosts.length === 0 && !loadingBlogger && (
                      <div className="col-span-full py-12 text-center text-gray-500">
                        Blogger'da içerik bulunamadı veya alınamadı.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTrashModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-purple-900/20 dark:bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a0b2e] rounded-2xl shadow-xl w-full max-w-4xl border border-purple-100 dark:border-purple-800/50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-purple-100 dark:border-purple-500/20 bg-purple-50/50 dark:bg-[#2D164B]">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  Çöp Kutusu (30 gün içinde silinir)
                </h3>
                <button
                  onClick={() => setIsTrashModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="bg-purple-50/50 dark:bg-purple-900/20 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-purple-100 dark:border-purple-800/30">
                    <tr>
                      <th className="px-4 py-3">Haber</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100 dark:divide-purple-800/30">
                    {games.filter(g => g.status === 'trash').length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                          Çöp kutusu boş.
                        </td>
                      </tr>
                    ) : (
                      games.filter(g => g.status === 'trash').map((game) => (
                        <tr key={game.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {game.title}
                            </div>
                            <div className="text-xs text-red-500 mt-1">
                              Silinme: {game.deletedAt?.toDate ? game.deletedAt.toDate().toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={async () => {
                                await updateDoc(doc(db, "games", game.id), {
                                  status: 'published',
                                  deletedAt: null
                                });
                              }}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-3 text-xs font-medium"
                            >
                              Geri Yükle
                            </button>
                            <button
                              onClick={async () => {
                                await deleteDoc(doc(db, "games", game.id));
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium"
                            >
                              Kalıcı Olarak Sil
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

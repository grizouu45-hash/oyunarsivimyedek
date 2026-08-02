import { ADMIN_EMAILS, hasAdminOrEditorAccess } from '../lib/utils';
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, getDoc, addDoc, serverTimestamp, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { X, MessageSquare, CornerDownRight, CheckCircle2, Heart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface AdminCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminCommentsModal({ isOpen, onClose }: AdminCommentsModalProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const commentsData = [];
      const postTitles: Record<string, string> = {};

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        if (!postTitles[data.postId]) {
          try {
            const postRef = doc(db, 'games', data.postId);
            const postDoc = await getDoc(postRef);
            if (postDoc.exists()) {
              postTitles[data.postId] = postDoc.data().title;
            } else {
              postTitles[data.postId] = 'Bilinmeyen Haber';
            }
          } catch (e) {
            if (e?.code !== "resource-exhausted") { console.error("Error fetching post title", e); }
            postTitles[data.postId] = 'Haber Bulunamadı';
          }
        }

        commentsData.push({
          id: docSnap.id,
          ...data,
          postTitle: postTitles[data.postId],
        });
      }
      setComments(commentsData);
    } catch (e) {
      if (e?.code !== "resource-exhausted") { console.error("Error fetching comments", e); }
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (comment: any) => {
    if (!replyText.trim() || submittingReply) return;
    
    setSubmittingReply(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const isAdmin = hasAdminOrEditorAccess(user);
      const currentUserName = isAdmin ? 'ADMIN' : (user.displayName || user.email?.split('@')[0] || 'Admin');
      const currentUserPhoto = isAdmin ? 'https://img.magnific.com/premium-vector/technology-concept-vector-illustration-featuring-consulting-design-flat-style-elements_1226483-4088.jpg?semt=ais_hybrid&w=740&q=80' : user.photoURL;

      await addDoc(collection(db, 'comments'), {
        postId: comment.postId,
        userId: user.uid,
        userName: currentUserName,
        userPhoto: currentUserPhoto,
        text: replyText.trim(),
        createdAt: serverTimestamp(),
        parentId: comment.parentId || comment.id // If it's already a reply, reply to the same parent, or reply to this comment
      });

      // Notify original comment author
      if (comment.userId !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId: comment.userId,
          senderId: user.uid,
          senderName: currentUserName,
          senderPhoto: currentUserPhoto,
          postId: comment.postId,
          type: 'reply',
          text: replyText.trim().substring(0, 50) + (replyText.trim().length > 50 ? '...' : ''),
          read: false,
          createdAt: serverTimestamp()
        });
      }

      setReplyText('');
      setReplyingTo(null);
      // Optional: Refetch comments or just show a success message
      fetchComments();
    } catch (e) {
      if (e?.code !== "resource-exhausted") { console.error("Error sending reply", e); }
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error: any) {
      if (error?.code !== "resource-exhausted") { console.error("Error deleting comment:", error); }
    }
  };

  const handleLike = async (comment: any) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const commentRef = doc(db, 'comments', comment.id);
    const hasLiked = comment.likes && comment.likes.includes(user.uid);
    
    try {
      if (hasLiked) {
        await updateDoc(commentRef, {
          likes: arrayRemove(user.uid)
        });
        setComments(comments.map(c => c.id === comment.id ? { ...c, likes: c.likes.filter((id: string) => id !== user.uid) } : c));
      } else {
        await updateDoc(commentRef, {
          likes: arrayUnion(user.uid)
        });
        setComments(comments.map(c => c.id === comment.id ? { ...c, likes: [...(c.likes || []), user.uid] } : c));
        
        const isAdmin = hasAdminOrEditorAccess(user);
        const currentUserName = isAdmin ? 'ADMIN' : (user.displayName || user.email?.split('@')[0] || 'Admin');
        const currentUserPhoto = isAdmin ? 'https://img.magnific.com/premium-vector/technology-concept-vector-illustration-featuring-consulting-design-flat-style-elements_1226483-4088.jpg?semt=ais_hybrid&w=740&q=80' : user.photoURL;

        // Notify original comment author
        if (comment.userId !== user.uid) {
          await addDoc(collection(db, 'notifications'), {
            userId: comment.userId,
            senderId: user.uid,
            senderName: currentUserName,
            senderPhoto: currentUserPhoto,
            postId: comment.postId,
            type: 'like',
            text: `Yorumunu beğendi: "${comment.text.substring(0, 30)}${comment.text.length > 30 ? '...' : ''}"`,
            read: false,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      if (error?.code !== "resource-exhausted") { console.error("Error liking comment:", error); }
    }
  };

  if (!isOpen) return null;

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
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tüm Yorumlar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yorumları görüntüleyin ve yanıtlayın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-[#0F051D]">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Henüz hiç yorum yapılmamış.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white dark:bg-[#1A0B2E] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                        {comment.userPhoto ? (
                          <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          comment.userName?.charAt(0).toUpperCase() || 'A'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleString('tr-TR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Şimdi'}
                          </span>
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          Haber: <Link to={`/post/${comment.postId}`} target="_blank" className="hover:underline">{comment.postTitle}</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pl-13 mt-2 text-gray-700 dark:text-gray-300">
                    <p className="whitespace-pre-wrap">{comment.text}</p>
                  </div>

                  <div className="pl-13 mt-3">
                    {replyingTo === comment.id ? (
                      <div className="mt-4 flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Yanıtınızı yazın..."
                          className="flex-1 min-h-[80px] p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F051D] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        />
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleReply(comment)}
                            disabled={!replyText.trim() || submittingReply}
                            className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl transition-colors flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="p-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors flex items-center justify-center"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            setReplyingTo(comment.id);
                            setReplyText('');
                          }}
                          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                        >
                          <CornerDownRight className="w-4 h-4" />
                          Yanıtla
                        </button>
                        <button
                          onClick={() => handleLike(comment)}
                          className={`flex items-center gap-1 text-sm font-medium transition-colors ${comment.likes?.includes(auth.currentUser?.uid) ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'}`}
                        >
                          <Heart className={`w-4 h-4 ${comment.likes?.includes(auth.currentUser?.uid) ? 'fill-current' : ''}`} />
                          Beğen {comment.likes?.length ? `(${comment.likes.length})` : ''}
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Sil
                        </button>
                      </div>
                    )}
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

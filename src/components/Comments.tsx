import { ADMIN_EMAILS, hasAdminOrEditorAccess } from '../lib/utils';
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Comment } from '../types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Reply, Heart, Trash2 } from 'lucide-react';

export function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!postId) return;
    
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const isAdmin = hasAdminOrEditorAccess(user);
      const currentUserName = isAdmin ? 'ADMIN' : (user.displayName || user.email?.split('@')[0] || 'Anonim');
      const currentUserPhoto = isAdmin ? 'https://img.magnific.com/premium-vector/technology-concept-vector-illustration-featuring-consulting-design-flat-style-elements_1226483-4088.jpg?semt=ais_hybrid&w=740&q=80' : user.photoURL;

      await addDoc(collection(db, 'comments'), {
        postId,
        userId: user.uid,
        userName: currentUserName,
        userPhoto: currentUserPhoto,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      });
      
      // Notify admin
      if (!isAdmin) {
        await addDoc(collection(db, 'notifications'), {
          userId: 'admin',
          senderId: user.uid,
          senderName: currentUserName,
          senderPhoto: currentUserPhoto,
          postId,
          type: 'new_comment',
          text: newComment.trim().substring(0, 50) + (newComment.trim().length > 50 ? '...' : ''),
          read: false,
          createdAt: serverTimestamp()
        });
      }
      
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;

    try {
      const isAdmin = hasAdminOrEditorAccess(user);
      const currentUserName = isAdmin ? 'ADMIN' : (user.displayName || user.email?.split('@')[0] || 'Anonim');
      const currentUserPhoto = isAdmin ? 'https://img.magnific.com/premium-vector/technology-concept-vector-illustration-featuring-consulting-design-flat-style-elements_1226483-4088.jpg?semt=ais_hybrid&w=740&q=80' : user.photoURL;

      await addDoc(collection(db, 'comments'), {
        postId,
        userId: user.uid,
        userName: currentUserName,
        userPhoto: currentUserPhoto,
        text: replyText.trim(),
        createdAt: serverTimestamp(),
        parentId
      });

      // Notify parent comment author
      const parentComment = comments.find(c => c.id === parentId);
      if (parentComment && parentComment.userId !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId: parentComment.userId,
          senderId: user.uid,
          senderName: currentUserName,
          senderPhoto: currentUserPhoto,
          postId,
          type: 'reply',
          text: replyText.trim().substring(0, 50) + (replyText.trim().length > 50 ? '...' : ''),
          read: false,
          createdAt: serverTimestamp()
        });
      }

      setReplyText('');
      setReplyTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleLike = async (comment: Comment) => {
    if (!user || !comment.id) return;
    
    const commentRef = doc(db, 'comments', comment.id);
    const hasLiked = comment.likes && comment.likes.includes(user.uid);
    
    try {
      if (hasLiked) {
        await updateDoc(commentRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(commentRef, {
          likes: arrayUnion(user.uid)
        });
        
        const isAdmin = hasAdminOrEditorAccess(user);
        const currentUserName = isAdmin ? 'ADMIN' : (user.displayName || user.email?.split('@')[0] || 'Anonim');
        const currentUserPhoto = isAdmin ? 'https://img.magnific.com/premium-vector/technology-concept-vector-illustration-featuring-consulting-design-flat-style-elements_1226483-4088.jpg?semt=ais_hybrid&w=740&q=80' : user.photoURL;

        // Notify original comment author
        if (comment.userId !== user.uid) {
          await addDoc(collection(db, 'notifications'), {
            userId: comment.userId,
            senderId: user.uid,
            senderName: currentUserName,
            senderPhoto: currentUserPhoto,
            postId,
            type: 'like',
            text: `Yorumunu beğendi: "${comment.text.substring(0, 30)}${comment.text.length > 30 ? '...' : ''}"`,
            read: false,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error: any) {
      console.error("Error deleting comment:", error);
    }
  };

  // Group comments
  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="mt-12 pt-8 border-t border-purple-100 dark:border-purple-800/50">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Yorumlar ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-10">
          <div className="flex gap-4">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
              alt={user.email || 'User'} 
              className="w-10 h-10 rounded-full border border-purple-200 dark:border-purple-800 shrink-0" 
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Bir yorum yazın..."
                className="w-full bg-white dark:bg-[#1A0B2E] border border-purple-200 dark:border-purple-800/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white min-h-[100px] resize-y"
              />
              <div className="mt-2 flex justify-end">
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Yorum Yap
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl mb-10 text-center border border-purple-100 dark:border-purple-800/50">
          <p className="text-purple-900 dark:text-purple-200 mb-3 font-medium">Yorum yapmak için giriş yapmalısınız.</p>
          <Link 
            to="/login"
            state={{ from: location }}
            className="inline-block px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
          >
            Giriş Yap / Kaydol
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {rootComments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        ) : (
          rootComments.map(comment => (
            <div key={comment.id} className="flex gap-3 sm:gap-4">
              <img 
                src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}`} 
                alt={comment.userName} 
                className="w-10 h-10 rounded-full border border-purple-100 dark:border-purple-800 shrink-0" 
              />
              <div className="flex-1">
                <div className="bg-white dark:bg-[#1A0B2E] p-4 rounded-2xl rounded-tl-none border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString('tr-TR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{comment.text}</p>
                </div>
                
                <div className="mt-2 flex items-center gap-4 text-sm">
                  {user && (
                    <>
                      <button 
                        onClick={() => {
                          setReplyTo(replyTo === comment.id ? null : comment.id || null);
                          setReplyText('');
                        }}
                        className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 font-medium flex items-center gap-1"
                      >
                        <Reply className="w-3 h-3" /> Yanıtla
                      </button>
                      <button
                        onClick={() => handleLike(comment)}
                        className={`flex items-center gap-1 text-sm font-medium transition-colors ${comment.likes?.includes(user.uid) ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'}`}
                      >
                        <Heart className={`w-3 h-3 ${comment.likes?.includes(user.uid) ? 'fill-current' : ''}`} />
                        Beğen {comment.likes?.length ? `(${comment.likes.length})` : ''}
                      </button>
                      {(comment.userId === user.uid || hasAdminOrEditorAccess(user)) && (
                        <button
                          onClick={() => handleDelete(comment.id!)}
                          className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" /> Sil
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Reply Form */}
                {replyTo === comment.id && user && (
                  <form onSubmit={(e) => handleSubmitReply(e, comment.id!)} className="mt-4 mb-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Yanıtınızı yazın..."
                          autoFocus
                          className="w-full bg-white dark:bg-[#1A0B2E] border border-purple-200 dark:border-purple-800/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white min-h-[80px] resize-y"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button 
                            type="button"
                            onClick={() => setReplyTo(null)}
                            className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-medium"
                          >
                            İptal
                          </button>
                          <button 
                            type="submit"
                            disabled={!replyText.trim()}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            Yanıtla
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Replies */}
                {getReplies(comment.id!).length > 0 && (
                  <div className="mt-4 space-y-4">
                    {getReplies(comment.id!).map(reply => (
                      <div key={reply.id} className="flex gap-3">
                        <img 
                          src={reply.userPhoto || `https://ui-avatars.com/api/?name=${reply.userName}`} 
                          alt={reply.userName} 
                          className="w-8 h-8 rounded-full border border-purple-100 dark:border-purple-800 shrink-0" 
                        />
                        <div className="flex-1">
                          <div className="bg-purple-50/50 dark:bg-[#2D164B]/50 p-3 rounded-2xl rounded-tl-none border border-purple-100/50 dark:border-purple-800/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-900 dark:text-white text-sm">{reply.userName}</span>
                              <span className="text-xs text-gray-500">
                                {reply.createdAt?.toDate ? reply.createdAt.toDate().toLocaleString('tr-TR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{reply.text}</p>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            {user && (
                              <>
                                <button
                                  onClick={() => handleLike(reply)}
                                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${reply.likes?.includes(user.uid) ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'}`}
                                >
                                  <Heart className={`w-3 h-3 ${reply.likes?.includes(user.uid) ? 'fill-current' : ''}`} />
                                  Beğen {reply.likes?.length ? `(${reply.likes.length})` : ''}
                                </button>
                                {(reply.userId === user.uid || hasAdminOrEditorAccess(user)) && (
                                  <button
                                    onClick={() => handleDelete(reply.id!)}
                                    className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center gap-1 ml-auto"
                                  >
                                    <Trash2 className="w-3 h-3" /> Sil
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

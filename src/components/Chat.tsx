import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, setDoc, doc } from 'firebase/firestore';
import { ChatMessage } from '../types';
import { MessageSquare, Send, X, Headset, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Chat() {
  const { user, userData, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    // In a real app, users chat with admins
    // For simplicity, we use a chat document per user
    const chatId = user.uid;
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText.trim();
    setInputText('');
    
    try {
      const chatId = user.uid;
      const msgData = {
        from: isAdmin ? 'admin' : 'user',
        fromName: userData?.name || user.email || 'Anonymous',
        text,
        time: new Date().toISOString()
      };

      await addDoc(collection(db, 'chats', chatId, 'messages'), msgData);
      
      // Update chat index for admin
      await setDoc(doc(db, 'chatUsers', user.uid), {
        name: userData?.name || user.email || 'Anonymous',
        lastMessage: text,
        lastTime: new Date().toISOString(),
        unread: isAdmin ? 0 : 1
      }, { merge: true });

    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-[60] w-14 h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-sky-500/40 transition-all active:scale-90 hover:scale-110"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 left-6 z-[60] w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-4 bg-sky-500 text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Headset size={20} />
              </div>
              <div className="text-right flex-1">
                <h4 className="text-sm font-bold">الدعم الفني</h4>
                <p className="text-[10px] text-sky-100">نتواجد دائماً لمساعدتك</p>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/50"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                  <MessageSquare size={40} className="mb-4 text-slate-300" />
                  <p className="text-xs font-bold text-slate-500">أهلاً بك! كيف يمكننا مساعدتك اليوم؟</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                      msg.from === 'admin' 
                        ? "self-start bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tr-none" 
                        : "self-end bg-sky-500 text-white mr-auto rounded-tl-none shadow-lg shadow-sky-500/10"
                    )}
                  >
                    <p className="text-right rtl whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[10px] mt-1 block opacity-60 text-left">
                      {new Date(msg.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:border-sky-500 transition-all text-right"
                placeholder="اكتب رسالتك..."
              />
              <button
                type="submit"
                className="w-10 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90 shrink-0"
              >
                <Send size={18} className="rotate-180" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

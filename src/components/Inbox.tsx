"use client";
import { useState, useEffect } from 'react';
import { Mail, Send, Inbox as InboxIcon, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; nickname: string; avatar: string | null };
  receiver: { id: string; nickname: string; avatar: string | null };
}

export default function Inbox() {
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [tab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dm?type=${tab}`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (tab === 'sent') return;
    try {
      await fetch(`/api/dm/${id}`, { method: 'PUT' });
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <h2 className="text-2xl font-black text-text-primary mb-6 flex items-center gap-2">
        <Mail className="text-mint" /> 쪽지함
      </h2>

      <div className="flex gap-4 mb-6 border-b border-vault-border">
        <button
          onClick={() => setTab('received')}
          className={`pb-3 px-4 font-bold transition-colors ${tab === 'received' ? 'text-mint border-b-2 border-mint' : 'text-text-muted hover:text-text-secondary'}`}
        >
          <div className="flex items-center gap-2"><InboxIcon size={16} /> 받은 쪽지</div>
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`pb-3 px-4 font-bold transition-colors ${tab === 'sent' ? 'text-mint border-b-2 border-mint' : 'text-text-muted hover:text-text-secondary'}`}
        >
          <div className="flex items-center gap-2"><Send size={16} /> 보낸 쪽지</div>
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-text-muted">로딩 중...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-text-muted border border-dashed border-vault-border/50 rounded-xl">
            {tab === 'received' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}
          </div>
        ) : (
          messages.map(msg => {
            const isUnread = tab === 'received' && !msg.isRead;
            const targetUser = tab === 'received' ? msg.sender : msg.receiver;
            
            return (
              <div 
                key={msg.id} 
                onClick={() => markAsRead(msg.id)}
                className={`bg-vault-surface border rounded-xl p-4 transition-all cursor-pointer ${isUnread ? 'border-mint shadow-[0_0_10px_rgba(45,212,191,0.1)]' : 'border-vault-border hover:border-vault-border-light'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/profile/${targetUser.id}`} className="flex items-center gap-2 hover:text-mint transition-colors">
                    <img src={targetUser.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroMaster&backgroundColor=1A1A1A"} alt="Avatar" className="w-8 h-8 rounded-md bg-vault-bg border border-vault-border object-cover" />
                    <span className="font-bold text-text-primary text-sm">{targetUser.nickname || '알 수 없는 유저'}</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{new Date(msg.createdAt).toLocaleString()}</span>
                    {tab === 'received' && msg.isRead && <CheckCircle2 size={14} className="text-text-muted" />}
                    {tab === 'received' && !msg.isRead && <div className="w-2 h-2 rounded-full bg-mint" />}
                  </div>
                </div>
                <p className="text-sm text-text-secondary whitespace-pre-wrap ml-10">{msg.content}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

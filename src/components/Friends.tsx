"use client";
import { useState, useEffect } from 'react';
import { Mail, Send, Inbox as InboxIcon, CheckCircle2, Users, UserPlus, UserX, X, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { getFriends, acceptFriendRequest, rejectFriendRequest, removeFriend } from '@/app/actions/friends';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; nickname: string; image: string | null };
  receiver: { id: string; nickname: string; image: string | null };
}

export default function Friends() {
  const [tab, setTab] = useState<'friends' | 'requests' | 'received' | 'sent'>('friends');
  
  // Friends State
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Message State
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // DM Modal State
  const [dmModalOpen, setDmModalOpen] = useState(false);
  const [dmReceiverId, setDmReceiverId] = useState<string | null>(null);
  const [dmContent, setDmContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (tab === 'friends' || tab === 'requests') {
      fetchFriendsData();
    } else {
      fetchMessages(tab);
    }
  }, [tab]);

  const fetchFriendsData = async () => {
    setLoadingFriends(true);
    try {
      const data = await getFriends();
      setFriends(data.friends);
      setRequests(data.requests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchMessages = async (type: 'received' | 'sent') => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/dm?type=${type}`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
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

  const handleSendDM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmReceiverId || !dmContent.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: dmReceiverId, content: dmContent })
      });
      if (res.ok) {
        alert('쪽지를 보냈습니다.');
        setDmModalOpen(false);
        setDmContent('');
      } else {
        alert('쪽지 전송 실패');
      }
    } catch (e) {
      alert('오류 발생');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <h2 className="text-2xl font-black text-text-primary mb-6 flex items-center gap-2">
        <Users className="text-mint" /> 친구 및 쪽지함
      </h2>

      <div className="flex flex-wrap gap-4 mb-6 border-b border-vault-border">
        <button onClick={() => setTab('friends')} className={`pb-3 px-4 font-bold transition-colors ${tab === 'friends' ? 'text-mint border-b-2 border-mint' : 'text-text-muted hover:text-text-secondary'}`}>
          <div className="flex items-center gap-2"><Users size={16} /> 친구 목록</div>
        </button>
        <button onClick={() => setTab('requests')} className={`pb-3 px-4 font-bold transition-colors relative ${tab === 'requests' ? 'text-mint border-b-2 border-mint' : 'text-text-muted hover:text-text-secondary'}`}>
          <div className="flex items-center gap-2">
            <UserPlus size={16} /> 친구 요청
            {requests.length > 0 && <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-coral text-vault-bg text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{requests.length}</span>}
          </div>
        </button>
        <button onClick={() => setTab('received')} className={`pb-3 px-4 font-bold transition-colors ${tab === 'received' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-text-muted hover:text-text-secondary'}`}>
          <div className="flex items-center gap-2"><InboxIcon size={16} /> 받은 쪽지</div>
        </button>
        <button onClick={() => setTab('sent')} className={`pb-3 px-4 font-bold transition-colors ${tab === 'sent' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-text-muted hover:text-text-secondary'}`}>
          <div className="flex items-center gap-2"><Send size={16} /> 보낸 쪽지</div>
        </button>
      </div>

      <div className="space-y-4">
        {tab === 'friends' && (
          loadingFriends ? <div className="text-center py-10 text-text-muted">로딩 중...</div> :
          friends.length === 0 ? <div className="text-center py-10 text-text-muted border border-dashed border-vault-border/50 rounded-xl">등록된 친구가 없습니다.</div> :
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map(f => (
              <div key={f.id} className="bg-vault-surface border border-vault-border rounded-xl p-4 flex items-center justify-between hover:border-vault-border-light transition-colors">
                <Link href={`/profile/${f.id}`} className="flex items-center gap-3 hover:opacity-80">
                  <img src={f.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${f.id}&backgroundColor=1A1A1A`} alt="Avatar" className="w-10 h-10 rounded-lg object-cover bg-vault-bg border border-vault-border" />
                  <span className="font-bold text-text-primary">{f.nickname || '알 수 없는 유저'}</span>
                </Link>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setDmReceiverId(f.id); setDmModalOpen(true); }} className="p-2 text-neon-blue bg-neon-blue/10 hover:bg-neon-blue/20 rounded-lg transition-colors" title="쪽지 보내기">
                    <MessageSquare size={16} />
                  </button>
                  <button onClick={async () => {
                    if (window.confirm('정말 친구를 삭제하시겠습니까?')) {
                      await removeFriend(f.id);
                      fetchFriendsData();
                    }
                  }} className="p-2 text-coral bg-coral/10 hover:bg-coral/20 rounded-lg transition-colors" title="친구 삭제">
                    <UserX size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'requests' && (
          loadingFriends ? <div className="text-center py-10 text-text-muted">로딩 중...</div> :
          requests.length === 0 ? <div className="text-center py-10 text-text-muted border border-dashed border-vault-border/50 rounded-xl">대기 중인 친구 요청이 없습니다.</div> :
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="bg-vault-surface border border-vault-border rounded-xl p-4 flex items-center justify-between">
                <Link href={`/profile/${r.user.id}`} className="flex items-center gap-3 hover:opacity-80">
                  <img src={r.user.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${r.user.id}&backgroundColor=1A1A1A`} alt="Avatar" className="w-10 h-10 rounded-lg object-cover bg-vault-bg border border-vault-border" />
                  <span className="font-bold text-text-primary">{r.user.nickname || '알 수 없는 유저'}</span>
                </Link>
                <div className="flex items-center gap-2">
                  <button onClick={async () => {
                    await acceptFriendRequest(r.id);
                    fetchFriendsData();
                  }} className="px-3 py-1.5 bg-mint text-vault-bg text-sm font-bold rounded hover:opacity-90">수락</button>
                  <button onClick={async () => {
                    await rejectFriendRequest(r.id);
                    fetchFriendsData();
                  }} className="px-3 py-1.5 bg-coral/10 text-coral border border-coral/30 text-sm font-bold rounded hover:bg-coral/20">거절</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(tab === 'received' || tab === 'sent') && (
          loadingMessages ? <div className="text-center py-10 text-text-muted">로딩 중...</div> :
          messages.length === 0 ? <div className="text-center py-10 text-text-muted border border-dashed border-vault-border/50 rounded-xl">{tab === 'received' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}</div> :
          <div className="space-y-3">
            {messages.map(msg => {
              const isUnread = tab === 'received' && !msg.isRead;
              const targetUser = tab === 'received' ? msg.sender : msg.receiver;
              
              return (
                <div key={msg.id} onClick={() => markAsRead(msg.id)} className={`bg-vault-surface border rounded-xl p-4 transition-all cursor-pointer ${isUnread ? 'border-neon-blue shadow-[0_0_10px_rgba(74,168,255,0.1)]' : 'border-vault-border hover:border-vault-border-light'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/profile/${targetUser.id}`} className="flex items-center gap-2 hover:text-neon-blue transition-colors">
                      <img src={targetUser.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${targetUser.id}&backgroundColor=1A1A1A`} alt="Avatar" className="w-8 h-8 rounded-md bg-vault-bg border border-vault-border object-cover" />
                      <span className="font-bold text-text-primary text-sm">{targetUser.nickname || '알 수 없는 유저'}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">{new Date(msg.createdAt).toLocaleString()}</span>
                      {tab === 'received' && msg.isRead && <CheckCircle2 size={14} className="text-text-muted" />}
                      {tab === 'received' && !msg.isRead && <div className="w-2 h-2 rounded-full bg-neon-blue" />}
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap ml-10">{msg.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {dmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2"><Send size={18} className="text-neon-blue"/> 쪽지 보내기</h3>
              <button onClick={() => setDmModalOpen(false)} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
            </div>
            <form onSubmit={handleSendDM} className="p-4 space-y-4">
              <textarea
                value={dmContent}
                onChange={e => setDmContent(e.target.value)}
                placeholder="내용을 입력하세요..."
                className="w-full h-32 bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary resize-none focus:border-neon-blue focus:outline-none transition-colors"
                required
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setDmModalOpen(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">취소</button>
                <button type="submit" disabled={sendingMessage} className="px-4 py-2 bg-neon-blue text-vault-bg rounded-lg text-sm font-bold disabled:opacity-50">
                  {sendingMessage ? '전송 중...' : '보내기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

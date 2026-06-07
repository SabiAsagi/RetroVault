"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Users, FolderHeart, Gamepad2, Search } from 'lucide-react';
import { BoxArtPlaceholder } from './GameCard';

export default function Community({ users, groups }: { users: any[], groups: any[] }) {
  const [tab, setTab] = useState<'users' | 'groups'>('users');
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.nickname?.toLowerCase().includes(search.toLowerCase()) || 
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.user?.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-black text-text-primary flex items-center gap-2">
          <Users className="text-mint" /> 커뮤니티 탐색
        </h2>
        
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="유저명, 컬렉션명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-vault-surface border border-vault-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-mint transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-vault-border">
        <button
          onClick={() => setTab('users')}
          className={`pb-3 px-4 font-bold transition-colors ${tab === 'users' ? 'text-mint border-b-2 border-mint' : 'text-text-muted hover:text-text-secondary'}`}
        >
          <div className="flex items-center gap-2"><Gamepad2 size={16} /> 유저별 컬렉션</div>
        </button>
        <button
          onClick={() => setTab('groups')}
          className={`pb-3 px-4 font-bold transition-colors ${tab === 'groups' ? 'text-mint border-b-2 border-mint' : 'text-text-muted hover:text-text-secondary'}`}
        >
          <div className="flex items-center gap-2"><FolderHeart size={16} /> 테마별 그룹</div>
        </button>
      </div>

      {tab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-20 text-text-muted">공개된 유저 컬렉션이 없습니다.</div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden hover:border-vault-border-light transition-colors group">
                <div className="p-4 border-b border-vault-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroMaster&backgroundColor=1A1A1A"} className="w-10 h-10 rounded-lg bg-vault-bg border border-vault-border object-cover" alt="avatar" />
                    <div>
                      <h3 className="font-bold text-text-primary group-hover:text-mint transition-colors">{user.nickname || user.name || '알 수 없는 유저'}</h3>
                      <p className="text-xs text-text-secondary">공개 게임 {user._count.collections}개</p>
                    </div>
                  </div>
                  <Link href={`/profile/${user.nickname || user.id}`} className="px-3 py-1 bg-vault-bg hover:bg-vault-surface-light border border-vault-border rounded-lg text-xs font-bold text-text-primary transition-colors">
                    프로필 보기                 </Link>
                </div>
                <div className="p-4 bg-vault-bg/50">
                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                    {user.collections.map((c: any) => (
                      <div key={c.id} className="w-12 h-16 shrink-0 rounded overflow-hidden shadow">
                        {c.game.imageUrl ? <img src={c.game.imageUrl} className="w-full h-full object-cover" /> : <BoxArtPlaceholder game={c.game} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.length === 0 ? (
            <div className="col-span-full text-center py-20 text-text-muted">공개된 그룹이 없습니다.</div>
          ) : (
            filteredGroups.map(group => (
              <div key={group.id} className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden hover:border-vault-border-light transition-colors group">
                <div className="p-4 border-b border-vault-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-text-primary group-hover:text-mint transition-colors text-lg mb-1">{group.name}</h3>
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        by <Link href={`/profile/${group.user.nickname || group.user.id}`} className="text-text-secondary hover:text-text-primary hover:underline">{group.user.nickname || group.user.name}</Link>
                      </p>
                    </div>
                    <Link href={`/profile/${group.user.nickname || group.user.id}?group=${group.id}`} className="px-3 py-1 bg-vault-bg hover:bg-vault-surface-light border border-vault-border rounded-lg text-xs font-bold text-text-primary transition-colors">
                      컬렉션 보기
                    </Link>
                  </div>
                  {group.description && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{group.description}</p>}
                </div>
                <div className="p-4 bg-vault-bg/50">
                  <p className="text-xs font-bold text-text-muted mb-2">총 {group._count.items}개 게임</p>
                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                    {group.items.map((i: any) => (
                      <div key={i.id} className="w-12 h-16 shrink-0 rounded overflow-hidden shadow">
                        {i.item.game.imageUrl ? <img src={i.item.game.imageUrl} className="w-full h-full object-cover" /> : <BoxArtPlaceholder game={i.item.game} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

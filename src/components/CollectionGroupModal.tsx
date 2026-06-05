import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Folder } from 'lucide-react';
import { CollectionItem, Game } from '../types';

interface CollectionGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: CollectionItem[];
  games: Game[];
}

export default function CollectionGroupModal({ isOpen, onClose, collection, games }: CollectionGroupModalProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/collection-groups');
      const data = await res.json();
      if (Array.isArray(data)) setGroups(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await fetch('/api/collection-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, description: '', isPublic: true })
      });
      setNewGroupName('');
      fetchGroups();
    } catch (e) {
      alert('생성 실패');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm('그룹을 삭제하시겠습니까? (그룹 내 게임은 컬렉션에서 삭제되지 않습니다)')) return;
    try {
      await fetch(`/api/collection-groups/${id}`, { method: 'DELETE' });
      fetchGroups();
    } catch (e) {
      alert('삭제 실패');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-vault-surface border border-vault-border rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Folder className="text-mint" size={20} /> 컬렉션 그룹 관리
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={newGroupName} 
            onChange={e => setNewGroupName(e.target.value)} 
            placeholder="새 그룹 이름..."
            className="flex-1 bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-mint"
          />
          <button 
            onClick={handleCreateGroup}
            className="px-4 py-2 bg-mint text-vault-bg font-bold rounded-lg hover:bg-mint-dim transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> 생성
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {groups.map(g => (
            <div key={g.id} className="bg-vault-bg border border-vault-border rounded-lg p-4 flex justify-between items-center group">
              <div>
                <h4 className="font-bold text-text-primary mb-1">{g.name}</h4>
                <p className="text-xs text-text-muted">{g.items?.length || 0}개의 게임 포함</p>
              </div>
              <button 
                onClick={() => handleDeleteGroup(g.id)}
                className="p-2 text-text-muted hover:text-coral hover:bg-coral/10 rounded transition-colors"
                title="삭제"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {groups.length === 0 && (
            <p className="text-center text-text-muted py-8 text-sm">생성된 그룹이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

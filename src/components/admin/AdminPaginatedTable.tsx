"use client";
import { Search, Edit, Trash2, Plus } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  width?: string;
  render: (item: T) => React.ReactNode;
}

interface AdminPaginatedTableProps<T> {
  title: string;
  items: T[];
  search: string;
  onSearch: (s: string) => void;
  page: number;
  onPageChange: (p: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  searchFilter: (item: T, search: string) => boolean;
  onAdd: () => void;
  addLabel?: string;
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  getItemId: (item: T) => string;
}

export default function AdminPaginatedTable<T>({
  title, items, search, onSearch, page, onPageChange, itemsPerPage,
  searchFilter, onAdd, addLabel = "추가", columns, onEdit, onDelete, getItemId
}: AdminPaginatedTableProps<T>) {
  
  const filteredItems = items.filter(item => searchFilter(item, search));
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-primary">{title}</h3>
        <button 
          onClick={onAdd}
          className="bg-neon-blue hover:bg-neon-blue/80 text-text-primary px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2"
        >
          <Plus size={14} /> {addLabel}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder={`${title} 검색...`} 
            value={search} 
            onChange={e => { onSearch(e.target.value); onPageChange(1); }} 
            className="w-full bg-vault-surface border border-vault-border rounded text-sm text-text-primary px-9 py-2 focus:outline-none focus:border-neon-blue" 
          />
        </div>
      </div>

      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              {columns.map(col => (
                <th key={col.key} className={`px-4 py-3 ${col.width || ''}`}>{col.label}</th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-3 text-right">관리</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {currentItems.map(item => (
              <tr key={getItemId(item)} className="hover:bg-vault-surface-light">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-text-secondary truncate">
                    {col.render(item)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-text-muted hover:text-neon-blue rounded transition-colors" title="수정"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-text-muted hover:text-coral rounded transition-colors" title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-4 py-8 text-center text-text-muted">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {filteredItems.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-vault-bg border-t border-vault-border">
            <span className="text-xs text-text-muted">총 {filteredItems.length}개</span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => onPageChange(p => p - 1)} 
                className="px-3 py-1 bg-vault-surface hover:bg-vault-surface-light border border-vault-border rounded text-xs text-text-primary disabled:opacity-50"
              >
                이전
              </button>
              <span className="px-3 py-1 text-xs text-text-primary">{page} / {totalPages}</span>
              <button 
                disabled={page >= totalPages} 
                onClick={() => onPageChange(p => p + 1)} 
                className="px-3 py-1 bg-vault-surface hover:bg-vault-surface-light border border-vault-border rounded text-xs text-text-primary disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

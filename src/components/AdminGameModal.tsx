"use client";
import { useState, useRef } from 'react';
import { PlusCircle, Loader2, Image as ImageIcon, Info, Calendar, Monitor, Gamepad2, Upload, Star, X, XCircle } from 'lucide-react';

export default function AdminGameModal({ 
  isOpen, 
  onClose, 
  initialData, 
  onSave, 
  isSubmitting, 
  handleImageUpload, 
  uploadingImage 
}: any) {
  if (!isOpen) return null;
  const [formData, setFormData] = useState<any>(initialData || {});
  const [activeTab, setActiveTab] = useState<'info' | 'era'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-[1000px] overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50 shrink-0">
          <h3 className="text-lg font-bold text-text-primary">{formData.id ? '게임 수정' : '게임 추가'}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <XCircle size={20} />
          </button>
        </div>
        
        <form onSubmit={async (e) => {
          e.preventDefault();
          
          let finalReleaseYear = formData.releaseYear;
          if (formData.releaseDate) {
            finalReleaseYear = new Date(formData.releaseDate).getFullYear();
          }

          onSave({ ...formData, releaseYear: finalReleaseYear });
        }} className="p-6 overflow-y-auto flex-1 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Image Upload */}
            <div className="w-full md:w-72 shrink-0">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative bg-vault-surface border-2 border-dashed border-vault-border hover:border-mint transition-colors rounded-xl overflow-hidden cursor-pointer group flex flex-col items-center justify-center aspect-[3/4]`}
              >
                {formData.imageUrl || formData.coverImageUrl ? (
                  <img src={formData.imageUrl || formData.coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <Upload size={32} className="mx-auto text-text-muted group-hover:text-mint mb-2 transition-colors" />
                    <p className="text-sm font-bold text-text-secondary group-hover:text-text-primary">{uploadingImage ? '업로드 중...' : '사진 업로드'}</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, (url: string) => setFormData({...formData, imageUrl: url}))} accept="image/*" className="hidden" disabled={uploadingImage} />
              
              <div className="mt-4">
                <label className="block text-xs font-bold text-text-muted mb-1">이미지 URL 직접 입력</label>
                <input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary focus:border-mint focus:outline-none" placeholder="https://..." />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <input name="country" value={formData.country || ''} onChange={handleChange} placeholder="국가 (예: 일본, 미국)" className="w-32 px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none" />
                
                <select name="releaseStatus" value={formData.releaseStatus || 'RELEASED'} onChange={handleChange} className="px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none">
                  <option value="RELEASED">정식 출시 (RELEASED)</option>
                  <option value="UNRELEASED">미출시 (UNRELEASED)</option>
                  <option value="EARLY_ACCESS">얼리억세스 (EARLY_ACCESS)</option>
                  <option value="CANCELLED">개발 취소 (CANCELLED)</option>
                </select>
              </div>

              <input required name="title" value={formData.title || ''} onChange={handleChange} placeholder="게임명 입력 (필수)" className="w-full text-3xl font-black bg-transparent border-b-2 border-vault-border focus:border-mint pb-2 text-text-primary focus:outline-none placeholder:text-text-muted/50" />
              
              <input name="originalTitle" value={formData.originalTitle || ''} onChange={handleChange} placeholder="원제 (선택)" className="w-full text-xl font-bold bg-transparent border-b border-vault-border focus:border-mint pb-1 text-text-secondary focus:outline-none placeholder:text-text-muted/50 mt-2" />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <input name="platform" value={formData.platform || ''} onChange={handleChange} placeholder="플랫폼 (예: SFC, MD) - 여러 개 입력 가능" className="col-span-2 md:col-span-1 w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                <input name="developer" value={formData.developer || ''} onChange={handleChange} placeholder="개발사" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                <input name="publisher" value={formData.publisher || ''} onChange={handleChange} placeholder="유통사" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                <input required type="date" name="releaseDate" value={formData.releaseDate || ''} onChange={handleChange} placeholder="출시 날짜 (필수)" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" title="출시 날짜" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-6 p-4 mt-6 bg-vault-surface border border-vault-border rounded-xl">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center text-amber shrink-0">
                    <Star size={20} className="fill-amber" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-muted mb-1">별점</p>
                    <input type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating || ''} onChange={handleChange} placeholder="예: 4.5" className="w-16 bg-transparent border-b border-vault-border focus:border-mint pb-1 text-sm font-bold text-text-primary focus:outline-none" />
                  </div>
                </div>
                <div className="hidden md:block h-10 w-px bg-vault-border" />
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center text-mint shrink-0">
                    <Info size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text-muted mb-1">한 줄 소개 (Short Description)</p>
                    <input name="shortDescription" value={formData.shortDescription || ''} onChange={handleChange} placeholder="예: 비디오 게임 역사상 가장 유명한 배관공의 모험" className="w-full bg-transparent border-b border-vault-border focus:border-mint pb-1 text-sm font-bold text-text-primary focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex gap-1 border-b border-vault-border mb-4">
              <button type="button" onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-mint text-mint' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
                기본 정보
              </button>
              <button type="button" onClick={() => setActiveTab('era')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'era' ? 'border-mint text-mint' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
                시대 정보 및 추가 스펙
              </button>
            </div>

            <div className="text-sm text-text-secondary leading-relaxed bg-vault-surface border border-vault-border p-5 rounded-xl">
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">상세 설명</label>
                  <textarea required name="description" value={formData.description || ''} onChange={handleChange} placeholder="상세 설명을 적어주세요." className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none min-h-[150px] resize-y" />
                  
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1 mt-4">트레일러 URL (YouTube)</label>
                  <input name="trailerUrl" value={formData.trailerUrl || ''} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                </div>
              )}
              {activeTab === 'era' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">시대적 배경 / 역사적 의의</label>
                  <textarea name="historicalContext" value={formData.historicalContext || ''} onChange={handleChange} placeholder="이 게임이 당시 게임계에 미친 영향 등을 적어주세요." className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none min-h-[100px] resize-y" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">최소 사양</label>
                      <input name="pcSpecsMin" value={formData.pcSpecsMin || ''} onChange={handleChange} placeholder="예: Windows 95, 16MB RAM" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">권장 사양</label>
                      <input name="pcSpecsRec" value={formData.pcSpecsRec || ''} onChange={handleChange} placeholder="예: Pentium II, 64MB RAM" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">설치 용량</label>
                      <input name="installSize" value={formData.installSize || ''} onChange={handleChange} placeholder="예: 650MB" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-vault-border shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">취소</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-neon-blue text-vault-bg font-bold rounded-lg disabled:opacity-50">
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

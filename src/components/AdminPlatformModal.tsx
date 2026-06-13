"use client";
import { useState, useRef } from 'react';
import { Upload, XCircle, Info } from 'lucide-react';

export default function AdminPlatformModal({ 
  isOpen, 
  onClose, 
  initialData, 
  onSave, 
  isSubmitting, 
  handleImageUpload, 
  uploadingImage 
}: any) {
  if (!isOpen) return null;
  const [formData, setFormData] = useState<any>(initialData || { dateType: 'EXACT' });
  const [activeTab, setActiveTab] = useState<'info' | 'era'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-[1000px] overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50 shrink-0">
          <h3 className="text-lg font-bold text-text-primary">{formData.id ? '콘솔 수정' : '콘솔 추가'}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <XCircle size={20} />
          </button>
        </div>
        
        <form onSubmit={async (e) => {
          e.preventDefault();
          
          let finalReleaseYear = formData.releaseYear;
          if (formData.dateType === 'UNKNOWN') {
            finalReleaseYear = 0;
          } else if (formData.releaseDate) {
            const match = String(formData.releaseDate).match(/\d{4}/);
            if (match) finalReleaseYear = Number(match[0]);
          }
          const finalReleaseDate = formData.dateType === 'UNKNOWN' ? '불명' : formData.releaseDate;

          onSave({ 
            ...formData, 
            releaseDate: finalReleaseDate,
            releaseYear: finalReleaseYear,
            generation: formData.generation ? parseInt(formData.generation) : 1
          });
        }} className="p-6 overflow-y-auto flex-1 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Image Upload */}
            <div className="w-full md:w-72 shrink-0">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative bg-vault-surface border-2 border-dashed border-vault-border hover:border-mint transition-colors rounded-xl overflow-hidden cursor-pointer group flex flex-col items-center justify-center aspect-[4/3]`}
              >
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
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
                <select name="discontinued" value={formData.discontinued ? "true" : "false"} onChange={e => setFormData({...formData, discontinued: e.target.value === "true"})} className="px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none">
                  <option value="false">생산중</option>
                  <option value="true">단종</option>
                </select>
              </div>

              <input required name="name" value={formData.name || ''} onChange={handleChange} placeholder="콘솔명 입력 (필수)" className="w-full text-3xl font-black bg-transparent border-b-2 border-vault-border focus:border-mint pb-2 text-text-primary focus:outline-none placeholder:text-text-muted/50" />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <input required name="manufacturer" value={formData.manufacturer || ''} onChange={handleChange} placeholder="제조사 (필수)" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                <div className="w-full flex gap-2">
                  <select name="dateType" value={formData.dateType || 'EXACT'} onChange={handleChange} className="bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none shrink-0 w-32">
                    <option value="EXACT">정확한 날짜</option>
                    <option value="YEAR">연도만</option>
                    <option value="UNKNOWN">불명</option>
                  </select>
                  {formData.dateType !== 'UNKNOWN' && (
                    <input type="text" name="releaseDate" value={formData.releaseDate || ''} onChange={handleChange} placeholder={formData.dateType === 'YEAR' ? 'YYYY년 (예: 1990년)' : 'YYYY년 MM월 DD일'} className="flex-1 bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  )}
                </div>
                
                <select name="type" value={formData.type || 'HOME'} onChange={handleChange} className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none">
                  <option value="HOME">가정용 (HOME)</option>
                  <option value="HANDHELD">휴대용 (HANDHELD)</option>
                  <option value="HYBRID">하이브리드 (HYBRID)</option>
                  <option value="ARCADE">아케이드 (ARCADE)</option>
                  <option value="ETC">기타 (ETC)</option>
                </select>
                <select name="generation" value={formData.generation || ''} onChange={handleChange} className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none">
                  <option value="">세대 선택 안함</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <option key={num} value={num}>{num}세대</option>
                  ))}
                </select>
                <input name="country" value={formData.country || ''} onChange={handleChange} placeholder="개발/발매 국가 (예: 일본, 미국, 한국)" className="col-span-2 md:col-span-1 w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-6 p-4 mt-6 bg-vault-surface border border-vault-border rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center text-mint shrink-0">
                    <Info size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text-muted mb-1">혁신 포인트 (Innovation Point)</p>
                    <input name="innovationPoint" value={formData.innovationPoint || ''} onChange={handleChange} placeholder="예: 최초로 CD-ROM을 탑재한..." className="w-full bg-transparent border-b border-vault-border focus:border-mint pb-1 text-sm font-bold text-text-primary focus:outline-none" />
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
                </div>
              )}
              {activeTab === 'era' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">기기 스펙</label>
                      <textarea name="specs" value={formData.specs || formData.cpuSpec || ''} onChange={handleChange} placeholder="예: CPU: Custom RISC 3GHz, RAM: 8GB..." className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none h-24 resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">보조 입력 기기</label>
                      <textarea name="additionalInput" value={formData.additionalInput || ''} onChange={handleChange} placeholder="예: 듀얼쇼크, 키넥트 등" className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none h-24 resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">출시 가격</label>
                      <input name="launchPrice" value={formData.launchPrice || ''} onChange={handleChange} placeholder="예: $299 / 29,800엔" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">총 판매량</label>
                      <input name="totalSales" value={formData.totalSales || ''} onChange={handleChange} placeholder="예: 1억 5500만대" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-vault-border shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">취소</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-neon-purple text-vault-bg font-bold rounded-lg disabled:opacity-50">
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState, useRef } from 'react';
import { Upload, XCircle, Info } from 'lucide-react';

export default function AdminCompanyModal({ 
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
  const [activeTab, setActiveTab] = useState<'info'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-[1000px] overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50 shrink-0">
          <h3 className="text-lg font-bold text-text-primary">{formData.id ? '제작사 수정' : '제작사 추가'}</h3>
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

          onSave({ ...formData, foundedYear: finalReleaseYear, releaseDate: finalReleaseDate });
        }} className="p-6 overflow-y-auto flex-1 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Image Upload */}
            <div className="w-full md:w-72 shrink-0">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative bg-vault-surface border-2 border-dashed border-vault-border hover:border-mint transition-colors rounded-xl overflow-hidden cursor-pointer group flex flex-col items-center justify-center aspect-square`}
              >
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-cover p-4 bg-white" />
                ) : (
                  <div className="text-center p-6">
                    <Upload size={32} className="mx-auto text-text-muted group-hover:text-mint mb-2 transition-colors" />
                    <p className="text-sm font-bold text-text-secondary group-hover:text-text-primary">{uploadingImage ? '업로드 중...' : '로고 업로드'}</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, (url: string) => setFormData({...formData, logoUrl: url}))} accept="image/*" className="hidden" disabled={uploadingImage} />
              
              <div className="mt-4">
                <label className="block text-xs font-bold text-text-muted mb-1">로고 URL 직접 입력</label>
                <input type="text" value={formData.logoUrl || ''} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary focus:border-mint focus:outline-none" placeholder="https://..." />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <select name="companyStatus" value={formData.companyStatus || 'ACTIVE'} onChange={handleChange} className="px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none">
                  <option value="ACTIVE">운영중</option>
                  <option value="DEFUNCT">폐업</option>
                  <option value="ACQUIRED">인수합병</option>
                </select>
                <select name="type" value={formData.type || formData.companyType || 'DEVELOPER'} onChange={handleChange} className="px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none">
                  <option value="DEVELOPER">개발사</option>
                  <option value="PUBLISHER">유통사</option>
                  <option value="BOTH">개발/유통 모두</option>
                </select>
              </div>

              <input required name="name" value={formData.name || ''} onChange={handleChange} placeholder="제작사명 입력 (필수)" className="w-full text-3xl font-black bg-transparent border-b-2 border-vault-border focus:border-mint pb-2 text-text-primary focus:outline-none placeholder:text-text-muted/50" />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="w-full col-span-2 md:col-span-1 flex gap-2">
                  <select name="dateType" value={formData.dateType || 'EXACT'} onChange={handleChange} className="bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none shrink-0 w-32">
                    <option value="EXACT">정확한 날짜</option>
                    <option value="YEAR">연도만</option>
                    <option value="UNKNOWN">불명</option>
                  </select>
                  {formData.dateType !== 'UNKNOWN' && (
                    <input type="text" name="releaseDate" value={formData.releaseDate || ''} onChange={handleChange} placeholder={formData.dateType === 'YEAR' ? 'YYYY년 (예: 1990년)' : 'YYYY년 MM월 DD일'} className="flex-1 bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  )}
                </div>
                <input type="url" name="websiteUrl" value={formData.websiteUrl || ''} onChange={handleChange} placeholder="웹사이트 URL" className="w-full col-span-2 md:col-span-1 bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                <input name="country" value={formData.country || ''} onChange={handleChange} placeholder="설립 국가 (예: 일본, 미국, 한국)" className="col-span-2 md:col-span-1 w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                <input name="keyFigures" value={formData.keyFigures || ''} onChange={handleChange} placeholder="핵심 인물 (예: 미야모토 시게루)" className="col-span-2 md:col-span-1 w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                <input name="subsidiaries" value={formData.subsidiaries || ''} onChange={handleChange} placeholder="산하 스튜디오 (쉼표로 구분)" className="col-span-2 w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                <input name="flagshipFranchises" value={formData.flagshipFranchises || ''} onChange={handleChange} placeholder="대표 프랜차이즈 (쉼표로 구분)" className="col-span-2 w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-6 p-4 mt-6 bg-vault-surface border border-vault-border rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center text-mint shrink-0">
                    <Info size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text-muted mb-1">한 줄 소개 (Short Description)</p>
                    <input name="shortDescription" value={formData.shortDescription || ''} onChange={handleChange} placeholder="예: 세계 최고의 게임 개발사" className="w-full bg-transparent border-b border-vault-border focus:border-mint pb-1 text-sm font-bold text-text-primary focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex gap-1 border-b border-vault-border mb-4">
              <button type="button" className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors border-mint text-mint`}>
                상세 정보
              </button>
            </div>

            <div className="text-sm text-text-secondary leading-relaxed bg-vault-surface border border-vault-border p-5 rounded-xl">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">역사 / 주요 사건 / 설명</label>
                <textarea name="description" value={formData.description || formData.historicalContext || ''} onChange={handleChange} placeholder="회사의 주요 역사적 사건을 적어주세요." className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none min-h-[150px] resize-y" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-vault-border shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">취소</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-amber text-vault-bg font-bold rounded-lg disabled:opacity-50">
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

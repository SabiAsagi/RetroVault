"use client";
import { useState, useRef } from 'react';
import { PlusCircle, Loader2, Image as ImageIcon, Info, Calendar, Monitor, Gamepad2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useSearchParams } from 'next/navigation';

export default function RequestItem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const initialTab = (searchParams?.get('tab') as 'game' | 'platform' | 'company') || 'game';
  const [requestType, setRequestType] = useState<'game' | 'platform' | 'company'>(initialTab);
  const [activeTab, setActiveTab] = useState<'info' | 'era'>('info');
  
  const [formData, setFormData] = useState<any>({
    title: '', originalTitle: '', platform: '', releaseYear: '', developer: '', publisher: '',
    releaseStatus: 'RELEASED', country: '', genre: '', shortDescription: '', description: '',
    historicalContext: '', trailerUrl: '', pcSpecsMin: '', pcSpecsRec: '', installSize: '',
    name: '', manufacturer: '', type: 'HOME', generation: '', specs: '', additionalInput: '', 
    launchPrice: '', totalSales: '', discontinued: 'false', websiteUrl: '', companyType: 'DEVELOPER'
  });
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    if (!res.ok) throw new Error('이미지 업로드에 실패했습니다.');
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let uploadedImageUrl = '';
      if (coverImage) {
        uploadedImageUrl = await uploadImage(coverImage);
      }

      // Map mock form data to actual API expected fields
      // Our existing api/request/route.ts might only take basic fields, so we will send everything and let the API store them if it can (or we can update the API later)
      const submitData = { 
        requestType, 
        ...formData,
        imageUrl: uploadedImageUrl,
        // Ensure required fields for API are present even if aliased
        title: requestType === 'game' ? formData.title : formData.name,
        name: formData.name || formData.title,
        type: requestType === 'company' ? formData.companyType : formData.type,
      };

      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!res.ok) throw new Error('요청에 실패했습니다.');

      showToast('추가 요청이 접수되었습니다. 관리자 승인 후 반영됩니다.');
      router.push(requestType === 'game' ? '/games' : requestType === 'platform' ? '/platforms' : '/companies');
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-text-primary flex items-center gap-2 mb-2">
            <PlusCircle className="text-mint" /> 새로운 아카이브 추가 요청
          </h2>
          <p className="text-text-secondary text-sm">상세 페이지와 동일한 형식으로 빈 칸을 채워주세요.</p>
        </div>
        <div className="flex bg-vault-surface border border-vault-border rounded-lg p-1">
          <button onClick={() => setRequestType('game')} className={`px-6 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'game' ? 'bg-mint text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>게임</button>
          <button onClick={() => setRequestType('platform')} className={`px-6 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'platform' ? 'bg-neon-purple text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>콘솔</button>
          <button onClick={() => setRequestType('company')} className={`px-6 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'company' ? 'bg-amber text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>제작사</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <div className="p-4 bg-coral/10 border border-coral/30 rounded-lg text-coral font-bold">{error}</div>}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Image Upload */}
          <div className="w-full md:w-72 shrink-0">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative bg-vault-surface border-2 border-dashed border-vault-border hover:border-mint transition-colors rounded-xl overflow-hidden cursor-pointer group flex flex-col items-center justify-center
                ${requestType === 'game' ? 'aspect-[3/4]' : requestType === 'platform' ? 'aspect-[4/3]' : 'aspect-square'}
              `}
            >
              {coverImagePreview ? (
                <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <Upload size={32} className="mx-auto text-text-muted group-hover:text-mint mb-2 transition-colors" />
                  <p className="text-sm font-bold text-text-secondary group-hover:text-text-primary">사진 업로드</p>
                  <p className="text-xs text-text-muted mt-1">클릭하여 파일 선택</p>
                </div>
              )}
              {coverImagePreview && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg">사진 변경</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>

          {/* Right Column: Title and Header Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <input name="country" value={formData.country} onChange={handleChange} placeholder="국가 (예: JP, US)" className="w-24 px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none" />
              {requestType === 'platform' && (
                <>
                  <select name="releaseStatus" value={formData.releaseStatus} onChange={handleChange} className="px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none">
                    <option value="RELEASED">발매됨 (RELEASED)</option>
                    <option value="UNRELEASED">미발매 (UNRELEASED)</option>
                    <option value="CANCELLED">발매 취소 (CANCELLED)</option>
                  </select>
                  <select name="discontinued" value={formData.discontinued} onChange={handleChange} className="px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none">
                    <option value="false">생산중</option>
                    <option value="true">단종</option>
                  </select>
                </>
              )}
            </div>

            <input required name={requestType === 'game' ? 'title' : 'name'} value={requestType === 'game' ? formData.title : formData.name} onChange={handleChange} placeholder={`${requestType === 'game' ? '게임명' : requestType === 'platform' ? '콘솔명' : '회사명'} 입력 (필수)`} className="w-full text-3xl font-black bg-transparent border-b-2 border-vault-border focus:border-mint pb-2 text-text-primary focus:outline-none placeholder:text-text-muted/50" />
            
            {requestType === 'game' && (
              <input name="originalTitle" value={formData.originalTitle} onChange={handleChange} placeholder="원제 (선택)" className="w-full text-xl font-bold bg-transparent border-b border-vault-border focus:border-mint pb-1 text-text-secondary focus:outline-none placeholder:text-text-muted/50 mt-2" />
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              {requestType === 'game' && (
                <>
                  <input required name="platform" value={formData.platform} onChange={handleChange} placeholder="플랫폼 (필수)" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <input name="developer" value={formData.developer} onChange={handleChange} placeholder="개발사" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <input name="publisher" value={formData.publisher} onChange={handleChange} placeholder="유통사" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <input required type="number" name="releaseYear" value={formData.releaseYear} onChange={handleChange} placeholder="출시 연도 (필수, 예: 1995)" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                </>
              )}
              {requestType === 'platform' && (
                <>
                  <input required name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="제조사 (필수)" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <input required type="number" name="releaseYear" value={formData.releaseYear} onChange={handleChange} placeholder="출시 연도 (필수, 예: 1995)" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none">
                    <option value="HOME">가정용 (HOME)</option>
                    <option value="HANDHELD">휴대용 (HANDHELD)</option>
                    <option value="HYBRID">하이브리드 (HYBRID)</option>
                    <option value="ARCADE">아케이드 (ARCADE)</option>
                    <option value="PC">PC</option>
                  </select>
                  <input type="number" name="generation" value={formData.generation} onChange={handleChange} placeholder="세대 (예: 5)" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                </>
              )}
              {requestType === 'company' && (
                <>
                  <select required name="companyType" value={formData.companyType} onChange={handleChange} className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none">
                    <option value="DEVELOPER">개발사</option>
                    <option value="PUBLISHER">유통사</option>
                    <option value="BOTH">개발/유통 모두</option>
                  </select>
                  <input type="number" name="releaseYear" value={formData.releaseYear} onChange={handleChange} placeholder="설립 연도 (예: 1889)" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="웹사이트 URL" className="w-full col-span-2 bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                </>
              )}
            </div>

            {/* Quick Stats like GameDetailClient */}
            <div className="flex items-center gap-6 p-4 mt-6 bg-vault-surface border border-vault-border rounded-xl">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center text-mint shrink-0">
                  <Info size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text-muted mb-1">한 줄 소개 (Short Description)</p>
                  <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="예: 비디오 게임 역사상 가장 유명한 배관공의 모험" className="w-full bg-transparent border-b border-vault-border focus:border-mint pb-1 text-sm font-bold text-text-primary focus:outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Description */}
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
                <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="상세 설명을 적어주세요." className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none min-h-[150px] resize-y" />
                
                {requestType === 'game' && (
                  <>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1 mt-4">트레일러 URL (YouTube)</label>
                    <input name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                  </>
                )}
              </div>
            )}
            {activeTab === 'era' && (
              <div className="space-y-4">
                {requestType === 'game' ? (
                  <>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">시대적 배경 / 역사적 의의</label>
                    <textarea name="historicalContext" value={formData.historicalContext} onChange={handleChange} placeholder="이 게임이 당시 게임계에 미친 영향 등을 적어주세요." className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none min-h-[100px] resize-y" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">최소 사양</label>
                        <input name="pcSpecsMin" value={formData.pcSpecsMin} onChange={handleChange} placeholder="예: Windows 95, 16MB RAM" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">권장 사양</label>
                        <input name="pcSpecsRec" value={formData.pcSpecsRec} onChange={handleChange} placeholder="예: Pentium II, 64MB RAM" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">설치 용량</label>
                        <input name="installSize" value={formData.installSize} onChange={handleChange} placeholder="예: 650MB" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                      </div>
                    </div>
                  </>
                ) : requestType === 'platform' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">기기 스펙</label>
                        <textarea name="specs" value={formData.specs} onChange={handleChange} placeholder="예: CPU: Custom RISC 3GHz, RAM: 8GB..." className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none h-24 resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">보조 입력 기기</label>
                        <textarea name="additionalInput" value={formData.additionalInput} onChange={handleChange} placeholder="예: 듀얼쇼크, 키넥트 등" className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none h-24 resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">출시 가격</label>
                        <input name="launchPrice" value={formData.launchPrice} onChange={handleChange} placeholder="예: $299 / 29,800엔" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">총 판매량</label>
                        <input name="totalSales" value={formData.totalSales} onChange={handleChange} placeholder="예: 1억 5500만대" className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-text-primary focus:border-mint focus:outline-none" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">역사 / 주요 사건</label>
                    <textarea name="historicalContext" value={formData.historicalContext} onChange={handleChange} placeholder="회사의 주요 역사적 사건을 적어주세요." className="w-full bg-vault-bg border border-vault-border rounded-lg p-4 text-text-primary focus:border-mint focus:outline-none min-h-[100px] resize-y" />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-vault-border">
          <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-mint text-vault-bg font-black rounded-lg transition-all hover:bg-mint-dim hover:shadow-[0_0_20px_rgba(74,237,196,0.3)] flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
            건의사항 제출하기
          </button>
        </div>
      </form>
    </div>
  );
}

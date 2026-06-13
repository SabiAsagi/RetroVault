"use client";
import { useState, useRef, useEffect } from 'react';
import { PlusCircle, Loader2, Image as ImageIcon, Info, Calendar, Monitor, Gamepad2, Upload, Star, X } from 'lucide-react';
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
    launchPrice: '', totalSales: '', discontinued: 'false', websiteUrl: '', companyType: 'DEVELOPER',
    rating: '', releaseDate: ''
  });
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [platforms, setPlatforms] = useState<any[]>([]);
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [platformSearchQuery, setPlatformSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/platforms-list')
      .then(res => res.json())
      .then(data => setPlatforms(data || []))
      .catch(err => console.error(err));
  }, []);

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

      // If they used date, parse out the year
      let finalReleaseYear = formData.releaseYear;
      if (formData.dateType === 'UNKNOWN') {
        finalReleaseYear = '0';
      } else if (formData.releaseDate) {
        const match = formData.releaseDate.match(/\d{4}/);
        if (match) finalReleaseYear = match[0];
      }

      const finalReleaseDate = formData.dateType === 'UNKNOWN' ? '불명' : formData.releaseDate;

      const submitData = { 
        requestType, 
        ...formData,
        releaseDate: finalReleaseDate,
        releaseYear: finalReleaseYear,
        imageUrl: uploadedImageUrl,
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

  const togglePlatform = (platformName: string) => {
    const currentPlatforms = formData.platform ? formData.platform.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
    if (currentPlatforms.includes(platformName)) {
      setFormData({ ...formData, platform: currentPlatforms.filter((p: string) => p !== platformName).join(', ') });
    } else {
      currentPlatforms.push(platformName);
      setFormData({ ...formData, platform: currentPlatforms.join(', ') });
    }
  };

  const selectedPlatforms = formData.platform ? formData.platform.split(',').map((p: string) => p.trim()).filter(Boolean) : [];

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
          <button type="button" onClick={() => setRequestType('game')} className={`px-6 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'game' ? 'bg-mint text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>게임</button>
          <button type="button" onClick={() => setRequestType('platform')} className={`px-6 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'platform' ? 'bg-neon-purple text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>콘솔</button>
          <button type="button" onClick={() => setRequestType('company')} className={`px-6 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'company' ? 'bg-amber text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>제작사</button>
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
          <div className="flex-1 space-y-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <input name="country" value={formData.country} onChange={handleChange} placeholder="국가 (예: 일본, 미국)" className="w-32 px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none" />
              
              {(requestType === 'platform' || requestType === 'game') && (
                <select name="releaseStatus" value={formData.releaseStatus} onChange={handleChange} className="px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none">
                  <option value="RELEASED">정식 출시 (RELEASED)</option>
                  <option value="UNRELEASED">미출시 (UNRELEASED)</option>
                  <option value="EARLY_ACCESS">얼리억세스 (EARLY_ACCESS)</option>
                  <option value="CANCELLED">개발 취소 (CANCELLED)</option>
                </select>
              )}
              {requestType === 'platform' && (
                <select name="discontinued" value={formData.discontinued} onChange={handleChange} className="px-2 py-1 bg-vault-surface border border-vault-border rounded text-xs font-bold text-text-primary focus:border-mint focus:outline-none">
                  <option value="false">생산중</option>
                  <option value="true">단종</option>
                </select>
              )}
            </div>

            <input required name={requestType === 'game' ? 'title' : 'name'} value={requestType === 'game' ? formData.title : formData.name} onChange={handleChange} placeholder={`${requestType === 'game' ? '게임명' : requestType === 'platform' ? '콘솔명' : '회사명'} 입력 (필수)`} className="w-full text-3xl font-black bg-transparent border-b-2 border-vault-border focus:border-mint pb-2 text-text-primary focus:outline-none placeholder:text-text-muted/50" />
            
            {requestType === 'game' && (
              <input name="originalTitle" value={formData.originalTitle} onChange={handleChange} placeholder="원제 (선택)" className="w-full text-xl font-bold bg-transparent border-b border-vault-border focus:border-mint pb-1 text-text-secondary focus:outline-none placeholder:text-text-muted/50 mt-2" />
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              {requestType === 'game' && (
                <>
                  <div className="relative col-span-2 md:col-span-1">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {selectedPlatforms.map((p: string) => (
                        <span key={p} className="flex items-center gap-1 px-2 py-0.5 bg-vault-surface border border-vault-border rounded text-[10px] text-text-primary">
                          {p} <X size={10} className="cursor-pointer hover:text-coral" onClick={() => togglePlatform(p)} />
                        </span>
                      ))}
                    </div>
                    <div 
                      className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary cursor-text flex items-center justify-between"
                      onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
                    >
                      <span className={selectedPlatforms.length === 0 ? "text-text-muted/50" : ""}>
                        {selectedPlatforms.length === 0 ? "플랫폼 선택 (여러 개 가능)" : "플랫폼 추가 선택..."}
                      </span>
                    </div>
                    {isPlatformDropdownOpen && (
                      <div className="absolute z-10 top-full left-0 mt-1 w-full max-h-60 flex flex-col bg-vault-surface border border-vault-border rounded-lg shadow-xl p-2">
                        <div className="pb-2 mb-2 border-b border-vault-border">
                          <input 
                            type="text" 
                            placeholder="플랫폼 검색 또는 직접 입력 후 엔터..." 
                            value={platformSearchQuery}
                            onChange={e => setPlatformSearchQuery(e.target.value)}
                            className="w-full bg-vault-bg border border-vault-border rounded p-2 text-xs text-text-primary focus:border-mint focus:outline-none"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = platformSearchQuery.trim();
                                if (val && !selectedPlatforms.includes(val)) {
                                  togglePlatform(val);
                                  setPlatformSearchQuery('');
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                          {platforms.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase())).map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => togglePlatform(p.name)}
                              className="flex items-center gap-2 p-2 hover:bg-vault-surface-light rounded cursor-pointer"
                            >
                              <input type="checkbox" checked={selectedPlatforms.includes(p.name)} readOnly className="accent-mint" />
                              <span className="text-sm text-text-primary">{p.name}</span>
                            </div>
                          ))}
                          {platforms.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase())).length === 0 && (
                            <div className="text-center p-2 text-text-muted text-xs">
                              검색 결과가 없습니다. <br/>입력 후 엔터를 누르면 새 플랫폼이 추가됩니다.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <input name="developer" value={formData.developer} onChange={handleChange} placeholder="개발사" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <input name="publisher" value={formData.publisher} onChange={handleChange} placeholder="유통사" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <div className="w-full col-span-2 md:col-span-1 flex gap-2">
                    <select name="dateType" value={formData.dateType || 'EXACT'} onChange={handleChange} className="bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none shrink-0 w-32">
                      <option value="EXACT">정확한 날짜</option>
                      <option value="YEAR">연도만</option>
                      <option value="UNKNOWN">불명</option>
                    </select>
                    {formData.dateType !== 'UNKNOWN' && (
                      <input type="text" name="releaseDate" value={formData.releaseDate} onChange={handleChange} placeholder={formData.dateType === 'YEAR' ? 'YYYY년 (예: 1990년)' : 'YYYY년 MM월 DD일'} className="flex-1 bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                    )}
                  </div>
                  <input name="country" value={formData.country || ''} onChange={handleChange} placeholder="발매 국가 (예: 일본, 미국, 한국)" className="col-span-2 md:col-span-1 w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                </>
              )}
              {requestType === 'platform' && (
                <>
                  <input required name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="제조사 (필수)" className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <div className="w-full flex gap-2">
                    <select name="dateType" value={formData.dateType || 'EXACT'} onChange={handleChange} className="bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none shrink-0 w-32">
                      <option value="EXACT">정확한 날짜</option>
                      <option value="YEAR">연도만</option>
                      <option value="UNKNOWN">불명</option>
                    </select>
                    {formData.dateType !== 'UNKNOWN' && (
                      <input type="text" name="releaseDate" value={formData.releaseDate} onChange={handleChange} placeholder={formData.dateType === 'YEAR' ? 'YYYY년 (예: 1990년)' : 'YYYY년 MM월 DD일'} className="flex-1 bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                    )}
                  </div>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none">
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
                  <input name="country" value={formData.country || ''} onChange={handleChange} placeholder="개발/발매 국가 (예: 일본, 미국)" className="col-span-2 md:col-span-1 w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                </>
              )}
              {requestType === 'company' && (
                <>
                  <select required name="companyType" value={formData.companyType} onChange={handleChange} className="w-full bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none">
                    <option value="DEVELOPER">개발사</option>
                    <option value="PUBLISHER">유통사</option>
                    <option value="BOTH">개발/유통 모두</option>
                  </select>
                  <div className="w-full flex gap-2">
                    <select name="dateType" value={formData.dateType || 'EXACT'} onChange={handleChange} className="bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none shrink-0 w-32">
                      <option value="EXACT">정확한 날짜</option>
                      <option value="YEAR">연도만</option>
                      <option value="UNKNOWN">불명</option>
                    </select>
                    {formData.dateType !== 'UNKNOWN' && (
                      <input type="text" name="releaseDate" value={formData.releaseDate} onChange={handleChange} placeholder={formData.dateType === 'YEAR' ? 'YYYY년 (예: 1990년)' : 'YYYY년 MM월 DD일'} className="flex-1 bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                    )}
                  </div>
                  <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="웹사이트 URL" className="w-full col-span-2 md:col-span-1 bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                  <input name="country" value={formData.country || ''} onChange={handleChange} placeholder="설립 국가 (예: 일본, 미국)" className="w-full col-span-2 md:col-span-1 bg-vault-surface border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-mint focus:outline-none" />
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 p-4 mt-6 bg-vault-surface border border-vault-border rounded-xl">
              {requestType === 'game' && (
                <>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center text-amber shrink-0">
                      <Star size={20} className="fill-amber" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-muted mb-1">별점</p>
                      <input type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating} onChange={handleChange} placeholder="예: 4.5" className="w-16 bg-transparent border-b border-vault-border focus:border-mint pb-1 text-sm font-bold text-text-primary focus:outline-none" />
                    </div>
                  </div>
                  <div className="hidden md:block h-10 w-px bg-vault-border" />
                </>
              )}
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

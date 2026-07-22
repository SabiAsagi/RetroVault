import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building2, ArrowLeft, Link as LinkIcon, Gamepad2, Package } from "lucide-react";
import Link from "next/link";
import GameGrid from "@/components/GameGrid";
import ViewAllGamesButton from "@/components/ViewAllGamesButton";

import { parseCompanySlug } from "@/lib/slug";

const typeLabels: Record<string, string> = { DEVELOPER: '개발사', PUBLISHER: '유통사', BOTH: '개발/유통' };
const statusLabels: Record<string, string> = { ACTIVE: '운영중', DEFUNCT: '폐업', ACQUIRED: '인수합병' };
const countryLabels: Record<string, string> = {
  'Japan': '일본',
  'United States': '미국',
  'South Korea': '한국',
  'United Kingdom': '영국',
  'France': '프랑스',
  'Canada': '캐나다',
  'Germany': '독일',
  'Sweden': '스웨덴',
  'Poland': '폴란드',
  'China': '중국',
  'Australia': '호주',
  'Russia': '러시아',
  'Spain': '스페인',
  'Italy': '이탈리아',
  'Netherlands': '네덜란드',
  'Finland': '핀란드',
  'Norway': '노르웨이',
  'Denmark': '덴마크',
  'Brazil': '브라질',
  'Taiwan': '대만'
};

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { year, name } = parseCompanySlug(slug);
  
  const company = await prisma.company.findFirst({
    where: { 
      name,
    },
    include: {
      developedGames: {
        orderBy: { releaseYear: 'desc' },
        include: { platform: true }
      },
      publishedGames: {
        orderBy: { releaseYear: 'desc' },
        include: { platform: true }
      }
    }
  });

  if (company) {
    await prisma.company.update({
      where: { id: company.id },
      data: { views: { increment: 1 } }
    });
  }

  if (!company) {
    notFound();
  }

  const formatGame = (g: any) => ({
    ...g,
    platform: g.platform?.name || 'Unknown',
    imageUrl: g.coverImageUrl || '',
    era: g.releaseYear ? `${Math.floor(g.releaseYear / 10) * 10}s` : 'Unknown',
    rarity: 'Common'
  });

  const devGames = company.developedGames.map(formatGame);
  const pubGames = company.publishedGames.map(formatGame);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <Link href="/companies" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors mb-6">
        <ArrowLeft size={16} /> 제작사 목록으로 돌아가기
      </Link>

      <div className="bg-vault-surface border border-vault-border rounded-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          {/* Left Column: Logo Image Box */}
          <div className="w-full md:w-80 shrink-0">
            <div className="aspect-[4/3] border rounded-xl overflow-hidden flex items-center justify-center p-6" style={{ background: 'var(--platform-logo-bg)', borderColor: 'var(--platform-logo-border)' }}>
              {company.logoUrl ? (
                <img 
                  src={company.logoUrl} 
                  alt={company.name} 
                  className="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <Building2 size={64} className="text-text-muted" />
              )}
            </div>
          </div>

          {/* Right Column: Title, Badges, and Info Table */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-amber/20 border border-amber/30 text-amber rounded-lg text-xs font-bold">
                {typeLabels[company.type] || company.type}
              </span>
              {company.country && (
                <span className="px-3 py-1 bg-vault-bg border border-vault-border text-text-secondary rounded-lg text-xs font-bold">
                  {countryLabels[company.country] || company.country}
                </span>
              )}
              {company.companyStatus && (
                <span className={`px-3 py-1 border rounded-lg text-xs font-bold flex items-center gap-1 ${company.companyStatus === 'ACTIVE' ? 'bg-mint/10 border-mint/30 text-mint' : 'bg-coral/10 border-coral/30 text-coral'}`}>
                  <span className={`w-2 h-2 rounded-full ${company.companyStatus === 'ACTIVE' ? 'bg-mint animate-pulse' : 'bg-coral'}`}></span>
                  {statusLabels[company.companyStatus] || company.companyStatus}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-6">{company.name}</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50">
                <span className="text-text-muted text-sm font-bold">설립일</span>
                <span className="text-text-primary text-sm font-bold">{company.foundedAt || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50">
                <span className="text-text-muted text-sm font-bold">구분</span>
                <span className="text-text-primary text-sm font-bold">{typeLabels[company.type] || company.type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50">
                <span className="text-text-muted text-sm font-bold">소재지</span>
                <span className="text-text-primary text-sm font-bold">{countryLabels[company.country || ''] || company.country || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50">
                <span className="text-text-muted text-sm font-bold">현재 상태</span>
                <span className="text-text-primary text-sm font-bold">{statusLabels[company.companyStatus || ''] || company.companyStatus || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50 col-span-1 sm:col-span-2">
                <span className="text-text-muted text-sm font-bold w-24 shrink-0">주요 인물</span>
                <span className="text-text-primary text-sm font-bold text-right truncate" title={company.keyFigures || ''}>{company.keyFigures || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50 col-span-1 sm:col-span-2">
                <span className="text-text-muted text-sm font-bold w-24 shrink-0">대표작</span>
                <span className="text-text-primary text-sm font-bold text-right truncate" title={company.flagshipFranchises || ''}>{company.flagshipFranchises || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50 col-span-1 sm:col-span-2">
                <span className="text-text-muted text-sm font-bold w-24 shrink-0">산하 스튜디오</span>
                <span className="text-text-primary text-sm font-bold text-right truncate" title={company.subsidiaries || ''}>{company.subsidiaries || '불명'}</span>
              </div>
              {company.websiteUrl && (
                <div className="flex justify-between items-center py-2 border-b border-vault-border/50 col-span-1 sm:col-span-2">
                  <span className="text-text-muted text-sm font-bold w-24 shrink-0">웹사이트</span>
                  <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-neon-blue font-bold text-right truncate hover:underline flex items-center gap-1">
                    <LinkIcon size={12} /> 공식 홈페이지
                  </a>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <h3 className="text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">소개</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">
                {company.description || '상세 정보가 없습니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {devGames.length > 0 && (
          <div>
            <div className="flex items-center gap-2 border-b border-vault-border pb-4 mb-6">
              <Gamepad2 className="text-mint" size={24} />
              <h2 className="text-2xl font-black text-text-primary">개발한 게임</h2>
              <span className="ml-2 px-2 py-1 bg-vault-surface border border-vault-border rounded-md text-xs font-bold text-text-muted">
                {devGames.length}
              </span>
            </div>
            <GameGrid games={devGames.slice(0, 12)} />
            {devGames.length > 12 && (
              <ViewAllGamesButton developer={company.name} count={devGames.length} />
            )}
          </div>
        )}

        {pubGames.length > 0 && (
          <div>
            <div className="flex items-center gap-2 border-b border-vault-border pb-4 mb-6">
              <Package className="text-neon-blue" size={24} />
              <h2 className="text-2xl font-black text-text-primary">유통한 게임</h2>
              <span className="ml-2 px-2 py-1 bg-vault-surface border border-vault-border rounded-md text-xs font-bold text-text-muted">
                {pubGames.length}
              </span>
            </div>
            <GameGrid games={pubGames.slice(0, 12)} />
            {pubGames.length > 12 && (
              <ViewAllGamesButton publisher={company.name} count={pubGames.length} />
            )}
          </div>
        )}

        {devGames.length === 0 && pubGames.length === 0 && (
          <div className="py-20 text-center bg-vault-surface border border-vault-border rounded-xl">
            <p className="text-text-muted">등록된 게임이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

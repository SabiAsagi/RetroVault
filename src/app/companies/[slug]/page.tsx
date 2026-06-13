import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building2, ArrowLeft, Link as LinkIcon, Gamepad2, Package } from "lucide-react";
import Link from "next/link";
import GameGrid from "@/components/GameGrid";

import { parseCompanySlug } from "@/lib/slug";

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { year, name } = parseCompanySlug(slug);
  
  const company = await prisma.company.findFirst({
    where: { 
      name,
      // If we need strict matching with year we can, but usually name is unique enough. 
      // foundedAt is a string like '1889', so year might be a partial match if we need it. 
      // For now, finding by name is robust enough, but let's just use name since year was just a prefix
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

      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden mb-8 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0 w-full space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-vault-surface-light border border-vault-border flex items-center justify-center shrink-0 overflow-hidden p-2">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={48} className="text-text-muted opacity-50" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-black text-text-primary mb-3">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-amber/20 border border-amber/30 text-amber rounded-full text-xs font-bold">
                    {company.type}
                  </span>
                  {company.country && (
                    <span className="px-3 py-1 bg-vault-bg border border-vault-border text-text-secondary rounded-full text-xs font-bold">
                      {company.country}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">소개</h3>
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap max-w-3xl">
                {company.description || '상세 정보가 없습니다.'}
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-80 shrink-0 space-y-4">
            <div className="bg-vault-bg border border-vault-border rounded-xl p-5 space-y-4 text-sm">
              <h3 className="font-bold text-text-primary border-b border-vault-border/50 pb-2 mb-4">회사 정보</h3>
              
              <div className="flex justify-between items-start gap-4">
                <span className="text-text-muted shrink-0">회사명</span>
                <span className="text-text-primary font-bold text-right">{company.name}</span>
              </div>
              
              <div className="flex justify-between items-start gap-4">
                <span className="text-text-muted shrink-0">구분</span>
                <span className="text-text-primary font-bold text-right">{company.type}</span>
              </div>
              
              <div className="flex justify-between items-start gap-4">
                <span className="text-text-muted shrink-0">소재지</span>
                <span className="text-text-primary font-bold text-right">{company.country || '불명'}</span>
              </div>
              
              <div className="flex justify-between items-start gap-4">
                <span className="text-text-muted shrink-0">설립일</span>
                <span className="text-text-primary font-bold text-right">{company.foundedAt || '불명'}</span>
              </div>
              
              <div className="flex justify-between items-start gap-4">
                <span className="text-text-muted shrink-0">주요 인물</span>
                <span className="text-text-primary font-bold text-right break-words max-w-[150px]">{company.keyFigures || '불명'}</span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <span className="text-text-muted shrink-0">대표작</span>
                <span className="text-text-primary font-bold text-right break-words max-w-[150px]">{company.flagshipFranchises || '불명'}</span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <span className="text-text-muted shrink-0">현재 상태</span>
                <span className="text-text-primary font-bold text-right">{company.companyStatus === 'ACTIVE' ? '운영중' : company.companyStatus === 'DEFUNCT' ? '폐업' : company.companyStatus === 'ACQUIRED' ? '인수합병' : (company.companyStatus || '불명')}</span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <span className="text-text-muted shrink-0">산하 스튜디오</span>
                <span className="text-text-primary font-bold text-right break-words max-w-[150px]">{company.subsidiaries || '불명'}</span>
              </div>

              {company.websiteUrl && (
                <div className="flex justify-between items-center gap-4 pt-3 border-t border-vault-border/50">
                  <span className="text-text-muted shrink-0">웹사이트</span>
                  <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-neon-blue font-bold text-right break-all hover:underline flex items-center gap-1">
                    <LinkIcon size={12} /> 공식 홈페이지
                  </a>
                </div>
              )}
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
            <GameGrid games={devGames} />
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
            <GameGrid games={pubGames} />
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

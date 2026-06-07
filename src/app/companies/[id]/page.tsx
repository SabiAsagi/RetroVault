import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building2, ArrowLeft, Link as LinkIcon, Gamepad2, Users } from "lucide-react";
import Link from "next/link";
import GameCard from "@/components/GameCard";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const company = await prisma.company.findUnique({
    where: { id },
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

  if (!company) {
    notFound();
  }

  // To prevent duplicates if a company is both developer and publisher for the same game
  const allGamesMap = new Map();
  company.developedGames.forEach((g: any) => allGamesMap.set(g.id, g));
  company.publishedGames.forEach((g: any) => allGamesMap.set(g.id, g));
  const uniqueGames = Array.from(allGamesMap.values()).sort((a, b) => b.releaseYear - a.releaseYear);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <Link href="/companies" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors mb-6">
        <ArrowLeft size={16} /> 제작사 목록으로 돌아가기
      </Link>

      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden mb-8 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-vault-surface-light border border-vault-border flex items-center justify-center shrink-0 overflow-hidden p-4">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
            ) : (
              <Building2 size={64} className="text-text-muted opacity-50" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 w-full space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-amber/20 border border-amber/30 text-amber rounded text-xs font-bold">
                  {company.type}
                </span>
                {company.country && (
                  <span className="px-2 py-1 bg-vault-bg border border-vault-border text-text-secondary rounded text-xs font-bold flex items-center gap-1">
                    {company.country}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-black text-text-primary mb-2">{company.name}</h1>
              {company.websiteUrl && (
                <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-neon-blue hover:text-neon-blue/80 transition-colors">
                  <LinkIcon size={14} /> 공식 웹사이트
                </a>
              )}
            </div>
            
            <p className="text-text-primary leading-relaxed whitespace-pre-wrap max-w-3xl">
              {company.description || '상세 정보가 없습니다.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-vault-border/50">
              {company.keyFigures && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted mb-1 flex items-center gap-1"><Users size={12}/> 주요 인물</h4>
                  <p className="text-sm text-text-primary">{company.keyFigures}</p>
                </div>
              )}
              {company.flagshipFranchises && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted mb-1 flex items-center gap-1"><Gamepad2 size={12}/> 대표작</h4>
                  <p className="text-sm text-text-primary">{company.flagshipFranchises}</p>
                </div>
              )}
              {company.companyStatus && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted mb-1">현재 상태</h4>
                  <p className="text-sm text-text-primary">{company.companyStatus}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-vault-border pb-4">
          <Gamepad2 className="text-amber" size={24} />
          <h2 className="text-2xl font-black text-text-primary">관련 게임</h2>
          <span className="ml-2 px-2 py-1 bg-vault-surface border border-vault-border rounded-md text-xs font-bold text-text-muted">
            {uniqueGames.length}
          </span>
        </div>

        {uniqueGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {uniqueGames.map((game: any) => (
              <GameCard 
                key={game.id} 
                game={game} 
                isOwned={false} 
                onAddToCollection={() => {}} 
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-vault-surface border border-vault-border rounded-xl">
            <p className="text-text-muted">등록된 게임이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

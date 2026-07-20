import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Database, Calendar, Monitor, Link as LinkIcon, Gamepad2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import GameGrid from "@/components/GameGrid";

import { parsePlatformSlug } from "@/lib/slug";

export default async function PlatformDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { year, name } = parsePlatformSlug(slug);
  
  const platform = await prisma.platform.findFirst({
    where: { 
      name,
      ...(year !== null ? { releaseYear: year } : {})
    },
    include: {
      games: {
        orderBy: { releaseYear: 'asc' },
        include: { platform: true }
      }
    }
  });

  if (platform) {
    await prisma.platform.update({
      where: { id: platform.id },
      data: { views: { increment: 1 } }
    });
  }

  if (!platform) {
    notFound();
  }

  const mappedGames = platform.games.map((g: any) => ({
    ...g,
    platform: g.platform?.name || 'Unknown',
    imageUrl: g.coverImageUrl || ''
  }));

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <Link href="/platforms" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors mb-6">
        <ArrowLeft size={16} /> 콘솔/플랫폼 목록으로 돌아가기
      </Link>

      <div className="bg-vault-surface border border-vault-border rounded-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          {/* Left Column: Image */}
          <div className="w-full md:w-80 shrink-0">
            <div className="aspect-[4/3] border border-vault-border rounded-xl overflow-hidden flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #e8ecf0 0%, #d5dbe3 100%)' }}>
              {platform.imageUrl ? (
                <img 
                  src={platform.imageUrl} 
                  alt={platform.name} 
                  className="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <Monitor size={64} className="text-text-muted" />
              )}
            </div>
          </div>

          {/* Right Column: Title and Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {platform.manufacturer && (
                <span className="px-3 py-1 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple rounded-lg text-xs font-bold">
                  {platform.manufacturer}
                </span>
              )}
              {platform.generation && (
                <span className="px-3 py-1 bg-vault-bg border border-vault-border text-text-secondary rounded-lg text-xs font-bold">
                  {platform.generation}
                </span>
              )}
              {platform.discontinued !== null && (
                <span className={`px-3 py-1 border rounded-lg text-xs font-bold flex items-center gap-1 ${platform.discontinued ? 'bg-coral/10 border-coral/30 text-coral' : 'bg-mint/10 border-mint/30 text-mint'}`}>
                  <span className={`w-2 h-2 rounded-full ${platform.discontinued ? 'bg-coral animate-pulse' : 'bg-mint animate-pulse'}`}></span>
                  {platform.discontinued ? '단종 (Discontinued)' : '생산 중 (In Production)'}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-6">{platform.name}</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50">
                <span className="text-text-muted text-sm font-bold">출시일</span>
                <span className="text-text-primary text-sm font-bold">{platform.releaseDate ? platform.releaseDate : (platform.releaseYear === 0 ? '불명' : `${platform.releaseYear}년`)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50">
                <span className="text-text-muted text-sm font-bold">미디어 매체</span>
                <span className="text-text-primary text-sm font-bold">{platform.mediaFormat || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50">
                <span className="text-text-muted text-sm font-bold">제조 국가</span>
                <span className="text-text-primary text-sm font-bold">{platform.country || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50">
                <span className="text-text-muted text-sm font-bold">출시가격</span>
                <span className="text-text-primary text-sm font-bold">{platform.launchPrice || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50">
                <span className="text-text-muted text-sm font-bold">총 판매량</span>
                <span className="text-text-primary text-sm font-bold">{platform.totalSales || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50 col-span-1 sm:col-span-2">
                <span className="text-text-muted text-sm font-bold w-24 shrink-0">CPU</span>
                <span className="text-text-primary text-sm font-bold text-right truncate" title={platform.specs_cpu || ''}>{platform.specs_cpu || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50 col-span-1 sm:col-span-2">
                <span className="text-text-muted text-sm font-bold w-24 shrink-0">GPU</span>
                <span className="text-text-primary text-sm font-bold text-right truncate" title={platform.specs_gpu || ''}>{platform.specs_gpu || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50 col-span-1 sm:col-span-2">
                <span className="text-text-muted text-sm font-bold w-24 shrink-0">Memory</span>
                <span className="text-text-primary text-sm font-bold text-right truncate" title={platform.specs_memory || ''}>{platform.specs_memory || '불명'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-vault-border/50 col-span-1 sm:col-span-2">
                <span className="text-text-muted text-sm font-bold w-24 shrink-0">주변기기</span>
                <span className="text-text-primary text-sm font-bold text-right truncate" title={platform.peripherals || ''}>{platform.peripherals || '없음'}</span>
              </div>
              {platform.specs && (
                <div className="flex justify-between items-center py-2 border-b border-vault-border/50 col-span-1 sm:col-span-2">
                  <span className="text-text-muted text-sm font-bold w-24 shrink-0">기타 사양</span>
                  <span className="text-text-primary text-sm font-bold text-right truncate" title={platform.specs}>{platform.specs}</span>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <h3 className="text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">소개</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">
                {platform.description || '상세 정보가 없습니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {platform.variants && JSON.parse(platform.variants).length > 0 && (
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 border-b border-vault-border pb-4">
            <Monitor className="text-mint" size={24} />
            <h2 className="text-2xl font-black text-text-primary">파생 모델 및 다른 버전</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {JSON.parse(platform.variants).map((variant: string, index: number) => (
              <div 
                key={index} 
                className="px-4 py-2 bg-vault-surface border border-vault-border rounded-lg text-text-primary font-bold shadow-sm flex items-center gap-2 hover:border-mint transition-colors cursor-default"
              >
                <Monitor size={16} className="text-text-muted" />
                {variant}
              </div>
            ))}
          </div>
        </div>
      )}

      {platform.generation !== 1 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-vault-border pb-4">
            <Gamepad2 className="text-neon-purple" size={24} />
            <h2 className="text-2xl font-black text-text-primary">발매된 게임</h2>
            <span className="ml-2 px-2 py-1 bg-vault-surface border border-vault-border rounded-md text-xs font-bold text-text-muted">
              {mappedGames.length}
            </span>
          </div>

          {mappedGames.length > 0 ? (
            <GameGrid games={mappedGames} />
          ) : (
            <div className="py-20 text-center bg-vault-surface border border-vault-border rounded-xl">
              <p className="text-text-muted">등록된 게임이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

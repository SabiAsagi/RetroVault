import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Database, Calendar, Monitor, Link as LinkIcon, Gamepad2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import GameCard from "@/components/GameCard";

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
        <ArrowLeft size={16} /> 콘솔 목록으로 돌아가기
      </Link>

      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden mb-8">
        <div className="h-64 bg-vault-surface-light relative">
          {platform.imageUrl ? (
            <img src={platform.imageUrl} alt={platform.name} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <Monitor size={64} className="opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-vault-surface to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-neon-purple/20 border border-neon-purple/30 text-neon-purple rounded text-xs font-bold">
                  {platform.manufacturer}
                </span>
                <span className="px-2 py-1 bg-vault-bg border border-vault-border text-text-secondary rounded text-xs font-bold">
                  {platform.generation}
                </span>
              </div>
              <h1 className="text-4xl font-black text-text-primary">{platform.name}</h1>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">소개</h3>
                <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{platform.description || '상세 정보가 없습니다.'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-vault-bg border border-vault-border rounded-xl p-4 space-y-3 text-sm">
                <h3 className="font-bold text-text-primary border-b border-vault-border/50 pb-2 mb-3">콘솔 정보</h3>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">출시년도</span>
                  <span className="text-text-primary font-bold">{platform.releaseYear}년</span>
                </div>
                
                {platform.launchPrice && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">출시가격</span>
                    <span className="text-text-primary font-bold">{platform.launchPrice}</span>
                  </div>
                )}
                
                {platform.totalSales && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">총 판매량</span>
                    <span className="text-text-primary font-bold">{platform.totalSales}</span>
                  </div>
                )}

                {platform.discontinued !== null && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">상태</span>
                    <span className={`font-bold ${platform.discontinued ? 'text-coral' : 'text-mint'}`}>
                      {platform.discontinued ? '단종됨' : '생산중'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-vault-border pb-4">
          <Gamepad2 className="text-neon-purple" size={24} />
          <h2 className="text-2xl font-black text-text-primary">발매된 게임</h2>
          <span className="ml-2 px-2 py-1 bg-vault-surface border border-vault-border rounded-md text-xs font-bold text-text-muted">
            {mappedGames.length}
          </span>
        </div>

        {mappedGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mappedGames.map((game: any) => (
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

import { prisma } from "@/lib/prisma";
import { Database, Calendar, Monitor, Link as LinkIcon, Building2 } from "lucide-react";
import Link from "next/link";
import { getPlatformSlug } from "@/lib/slug";

export default async function PlatformsPage({ searchParams }: { searchParams: Promise<{ manufacturer?: string }> }) {
  const { manufacturer } = await searchParams;
  
  const platforms = await prisma.platform.findMany({
    where: manufacturer && manufacturer !== 'all' ? { manufacturer } : undefined,
    orderBy: { releaseYear: 'asc' },
    include: { _count: { select: { games: true } } }
  });

  // Get unique manufacturers for the filter
  const allPlatforms = await prisma.platform.findMany({ select: { manufacturer: true }});
  const manufacturers = Array.from(new Set(allPlatforms.map(p => p.manufacturer))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/30">
          <Database className="text-neon-purple" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-primary">콘솔 아카이브</h1>
          <p className="text-sm text-text-muted">역대 레트로 비디오 게임 플랫폼 목록입니다.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-vault-surface border border-vault-border rounded-xl p-4">
        <div className="flex flex-wrap gap-2 flex-1">
          <Link href="/platforms" className={`px-3 py-1 rounded-lg text-sm font-bold border transition-colors ${!manufacturer || manufacturer === 'all' ? 'bg-neon-purple text-vault-bg border-neon-purple' : 'bg-vault-bg border-vault-border text-text-secondary hover:text-text-primary'}`}>전체</Link>
          {manufacturers.map(m => (
            <Link key={m} href={`/platforms?manufacturer=${encodeURIComponent(m)}`} className={`px-3 py-1 rounded-lg text-sm font-bold border transition-colors ${manufacturer === m ? 'bg-neon-purple text-vault-bg border-neon-purple' : 'bg-vault-bg border-vault-border text-text-secondary hover:text-text-primary'}`}>
              {m}
            </Link>
          ))}
        </div>
        <a href="/request" className="px-4 py-2 text-sm text-vault-bg bg-neon-purple rounded-lg hover:bg-neon-purple/80 transition-colors flex items-center gap-2 font-bold whitespace-nowrap shrink-0">
          콘솔 추가 요청하기
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map(p => (
          <Link href={`/platforms/${getPlatformSlug(p)}`} key={p.id} className="block group">
            <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden hover:border-neon-purple/50 transition-colors">
              <div className="h-40 bg-vault-surface-light relative overflow-hidden">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <Monitor size={48} className="opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-vault-bg/90 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-neon-purple transition-colors truncate">{p.name}</h3>
                <p className="text-xs text-text-secondary">{p.manufacturer}</p>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-text-muted border-b border-vault-border/50 pb-3">
                <div className="flex items-center gap-1.5"><Calendar size={14} /> {p.releaseYear}년</div>
                <div className="font-medium bg-vault-bg px-2 py-1 rounded">{p.generation}</div>
              </div>
              
              <p className="text-sm text-text-primary line-clamp-2">{p.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] text-text-muted mt-2 border-b border-vault-border/50 pb-3">
                {p.launchPrice && <div>출시가: <span className="text-text-primary font-bold">{p.launchPrice}</span></div>}
                {p.totalSales && <div>판매량: <span className="text-text-primary font-bold">{p.totalSales}</span></div>}
                {p.discontinued !== null && <div>상태: <span className={p.discontinued ? 'text-coral' : 'text-mint'}>{p.discontinued ? '단종' : '현역'}</span></div>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-text-secondary bg-vault-bg border border-vault-border px-2 py-1 rounded">
                  등록 게임: {p._count.games}개
                </span>
                <Link href={`/games?platform=${encodeURIComponent(p.name)}`} className="text-xs font-bold text-neon-purple hover:text-text-primary transition-colors">
                  게임 보기 →
                </Link>
              </div>
            </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

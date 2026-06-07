import { prisma } from "@/lib/prisma";
import { Building2, Link as LinkIcon, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { getCompanySlug } from "@/lib/slug";

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;

  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { developedGames: true, publishedGames: true } }
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center border border-amber/30">
          <Building2 className="text-amber" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-primary">게임 제작사 아카이브</h1>
          <p className="text-sm text-text-muted">게임 개발사 및 퍼블리셔 정보입니다.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-vault-surface border border-vault-border rounded-xl p-4">
        <div className="flex flex-wrap gap-2 flex-1">
          <span className="px-3 py-1 rounded-lg text-sm font-bold bg-amber text-vault-bg border border-amber">전체</span>
        </div>
        <a href="/request" className="px-4 py-2 text-sm text-vault-bg bg-amber rounded-lg hover:bg-amber/80 transition-colors flex items-center gap-2 font-bold whitespace-nowrap shrink-0">
          제작사 추가 요청하기
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(c => (
          <Link href={`/companies/${getCompanySlug(c)}`} key={c.id} className="block group">
            <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden hover:border-amber/50 transition-colors p-5 h-full flex flex-col">
              <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg bg-vault-surface-light border border-vault-border flex items-center justify-center shrink-0 overflow-hidden p-2">
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.name} className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={24} className="text-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-text-primary truncate">{c.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-vault-bg border border-vault-border text-text-secondary">
                    {c.type}
                  </span>
                  <span className="text-[10px] text-text-muted">{c.country}</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-text-primary line-clamp-3 mb-2 min-h-[40px]">
              {c.description || '상세 정보가 없습니다.'}
            </p>

            <div className="text-[10px] text-text-muted space-y-1 mb-4">
              {c.keyFigures && <div>주요 인물: <span className="text-text-primary font-medium">{c.keyFigures}</span></div>}
              {c.flagshipFranchises && <div>대표작: <span className="text-text-primary font-medium">{c.flagshipFranchises}</span></div>}
              {c.companyStatus && <div>상태: <span className="text-text-primary font-medium">{c.companyStatus}</span></div>}
            </div>
            
            <div className="flex items-center justify-between text-xs pt-4 border-t border-vault-border/50">
              <div className="flex gap-3 text-text-muted">
                <Link href={`/games?developer=${encodeURIComponent(c.name)}`} className="flex items-center gap-1 hover:text-amber transition-colors" title="개발한 게임 수">
                  <Gamepad2 size={14} className="text-amber" /> 
                  개발: <span className="font-bold text-text-primary">{c._count.developedGames}</span>
                </Link>
                <Link href={`/games?publisher=${encodeURIComponent(c.name)}`} className="flex items-center gap-1 hover:text-amber/70 transition-colors" title="퍼블리싱한 게임 수">
                  <Building2 size={14} className="text-amber/70" /> 
                  퍼블: <span className="font-bold text-text-primary">{c._count.publishedGames}</span>
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

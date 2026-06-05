import { prisma } from "@/lib/prisma";
import { Building2, Link as LinkIcon, Gamepad2 } from "lucide-react";
import Link from "next/link";

export default async function CompaniesPage() {
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
          <h1 className="text-2xl font-black text-text-primary">회사 아카이브</h1>
          <p className="text-sm text-text-muted">게임 개발사 및 퍼블리셔 정보입니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(c => (
          <div key={c.id} className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden hover:border-vault-border-light transition-colors p-5">
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
            
            <p className="text-sm text-text-primary line-clamp-3 mb-4 min-h-[60px]">
              {c.description || '상세 정보가 없습니다.'}
            </p>
            
            <div className="flex items-center justify-between text-xs pt-4 border-t border-vault-border/50">
              <div className="flex gap-3 text-text-muted">
                <span className="flex items-center gap-1" title="개발한 게임 수">
                  <Gamepad2 size={14} className="text-amber" /> 
                  개발: <span className="font-bold text-text-primary">{c._count.developedGames}</span>
                </span>
                <span className="flex items-center gap-1" title="퍼블리싱한 게임 수">
                  <Building2 size={14} className="text-amber/70" /> 
                  퍼블: <span className="font-bold text-text-primary">{c._count.publishedGames}</span>
                </span>
              </div>
              
              {c.websiteUrl && (
                <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors">
                  <LinkIcon size={12} />
                  웹사이트
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

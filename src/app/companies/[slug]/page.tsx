import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EntityDocument } from "@/components/EntityDocument";
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

  const facts = [
    { label: '설립일', value: company.foundedAt },
    { label: '역할', value: typeLabels[company.type] || company.type },
    { label: '국가', value: countryLabels[company.country || ''] || company.country },
    { label: '운영 상태', value: statusLabels[company.companyStatus || ''] || company.companyStatus },
    { label: '주요 인물', value: company.keyFigures },
    { label: '대표작', value: company.flagshipFranchises },
    { label: '산하 스튜디오', value: company.subsidiaries },
  ];
  return <EntityDocument kind="company" name={company.name} image={company.logoUrl} website={company.websiteUrl} description={company.description} facts={facts} badges={[typeLabels[company.type] || company.type, countryLabels[company.country || ''] || company.country || '', statusLabels[company.companyStatus || ''] || company.companyStatus || '']}>
    <section><div className="entity-games-heading"><h2>개발한 게임</h2><span>{devGames.length.toLocaleString('ko-KR')}개 기록</span></div>
      {devGames.length ? <><GameGrid games={devGames.slice(0,12)} />{devGames.length > 12 && <ViewAllGamesButton developer={company.name} count={devGames.length} />}</> : <div className="directory-empty"><p>아직 연결된 개발 게임이 없어요.</p></div>}
    </section>
    <section><div className="entity-games-heading"><h2>유통한 게임</h2><span>{pubGames.length.toLocaleString('ko-KR')}개 기록</span></div>
      {pubGames.length ? <><GameGrid games={pubGames.slice(0,12)} />{pubGames.length > 12 && <ViewAllGamesButton publisher={company.name} count={pubGames.length} />}</> : <div className="directory-empty"><p>아직 연결된 유통 게임이 없어요.</p></div>}
    </section>
  </EntityDocument>;
}

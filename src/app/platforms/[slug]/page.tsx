import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EntityDocument } from "@/components/EntityDocument";
import { manufacturerLabel, isKnownManufacturer } from "@/lib/archive-labels";
import Link from "next/link";
import GameGrid from "@/components/GameGrid";
import ViewAllGamesButton from "@/components/ViewAllGamesButton";

import PlatformHardware from '@/components/PlatformHardware';
import { hardwareForPlatform, getPlatformFamily } from '@/lib/hardware';
import { getPlatformSlug, parsePlatformSlug } from "@/lib/slug";

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

  let variants: string[] = [];
  try { const value = JSON.parse(platform.variants || '[]'); if (Array.isArray(value)) variants = value.filter((v): v is string => typeof v === 'string'); } catch { /* Older documents may have plain-text variants. */ }
  const types: Record<string, string> = { HOME: '가정용', HANDHELD: '휴대용', HYBRID: '하이브리드', ARCADE: '아케이드', PC: 'PC', OTHER: '기타' };
  const facts = [
    { label: '제조사', value: manufacturerLabel(platform.manufacturer) },
    { label: '기종', value: types[platform.type] || platform.type },
    { label: '출시일', value: platform.releaseDate || (platform.releaseYear ? `${platform.releaseYear}년` : null) },
    { label: '미디어 매체', value: platform.mediaFormat },
    { label: '제조 국가', value: platform.country },
    { label: '출시 가격', value: platform.launchPrice },
    { label: '총 판매량', value: platform.totalSales },
    { label: 'CPU', value: platform.specs_cpu },
    { label: 'GPU', value: platform.specs_gpu },
    { label: '메모리', value: platform.specs_memory },

    ...(platform.specs ? [{ label: '기타 사양', value: platform.specs }] : []),
  ];
  const familyNames = getPlatformFamily(platform.name);
  const series = await prisma.platform.findMany({ where: { name: { in: familyNames } }, select: { id: true, name: true, releaseYear: true } });
  series.sort((a,b)=>familyNames.indexOf(a.name)-familyNames.indexOf(b.name));
  return <EntityDocument kind="platform" name={platform.name} image={platform.imageUrl} description={platform.description} facts={facts} badges={[isKnownManufacturer(platform.manufacturer) ? platform.manufacturer : '', types[platform.type] || platform.type, platform.generation ? `${platform.generation}세대` : '', platform.discontinued === true ? '단종' : platform.discontinued === false ? '생산 중' : '']}>
    {series.length > 1 && <section className="platform-series"><h2>같은 시리즈의 기기</h2><p>세대가 다른 기기를 이어서 살펴보세요. Slim·Pro·색상은 아래 모델·에디션에서 구분합니다.</p><div>{series.map(p=><Link aria-current={p.id===platform.id?'page':undefined} key={p.id} href={`/platforms/${getPlatformSlug(p)}`}>{p.name}<small>{p.releaseYear || '연도 확인 중'}</small></Link>)}</div></section>}
    <PlatformHardware entries={hardwareForPlatform(platform.name)} legacyNames={variants} />
    {platform.peripherals && <details className="hardware-legacy"><summary>기존 문서의 주변기기 기록</summary><p>{platform.peripherals}</p><p>호환 기기와 상세 사양은 원문 자료 확인이 필요합니다.</p></details>}
    <section id="entity-games"><div className="entity-games-heading"><h2>이 플랫폼에서 만나는 게임</h2><span>등록된 게임 {mappedGames.length.toLocaleString('ko-KR')}개</span></div>
      {mappedGames.length ? <><GameGrid games={mappedGames.slice(0,12)} />{mappedGames.length > 12 && <ViewAllGamesButton platform={platform.name} count={mappedGames.length} />}</> : <div className="directory-empty"><p>아직 연결된 게임이 없어요.</p><Link href="/request?tab=game">게임 정보 제안하기 →</Link></div>}
    </section>
  </EntityDocument>;
}

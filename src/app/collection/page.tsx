import Link from 'next/link';
import HardwareCollection from '@/components/HardwareCollection';
import { getHardwareCollection } from '@/app/actions/hardware';
import CollectionWrapper from "@/components/wrappers/CollectionWrapper";
import { getCollectionGames } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";

export default async function CollectionPage({searchParams}:{searchParams:Promise<{tab?:string}>}) {
  const tab=(await searchParams).tab==='hardware'?'hardware':'games';
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <LoginRequired />;
  }

  const tabs=<nav className="vault-kind-tabs" aria-label="내 다락 기록 종류"><Link href="/collection" aria-current={tab==='games'?'page':undefined}>게임</Link><Link href="/collection?tab=hardware" aria-current={tab==='hardware'?'page':undefined}>기기</Link></nav>;
  if(tab==='hardware') return <div className="directory-shell">{tabs}<HardwareCollection records={await getHardwareCollection()}/></div>;
  const [games, collection] = await Promise.all([
    getCollectionGames(), getUserCollection(),
  ]);

  return <>{tabs}<CollectionWrapper initialGames={games} initialCollection={collection} /></>;
}

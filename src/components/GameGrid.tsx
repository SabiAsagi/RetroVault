import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BoxArtPlaceholder } from './GameCard';
import { getGameSlug } from '@/lib/slug';
import type { Game } from '@/types';

/** Related games lead directly to their wiki documents. */
export default function GameGrid({ games }: { games: Game[] }) {
  return <div className="entity-game-grid">{games.map(game => <Link className="entity-game-card" href={`/games/${getGameSlug(game)}`} key={game.id}>
    <div className="entity-game-cover">{game.imageUrl ? <img src={game.imageUrl} alt={game.title} loading="lazy" /> : <BoxArtPlaceholder game={game} />}</div>
    <h3 title={game.title}>{game.title}</h3><p>{game.platform} · {game.releaseYear || '연도 확인 중'}</p><span>게임 문서 읽기 <ArrowRight size={15} /></span>
  </Link>)}</div>;
}

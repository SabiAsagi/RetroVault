import { Game } from '../types';

interface ShelfViewProps {
  collectionGames: Game[];
  onSelectGame: (game: Game) => void;
}

const platformColors: Record<string, { bg: string; spine: string; text: string }> = {
  'Atari 2600': { bg: '#8B4513', spine: '#6B3410', text: '#FFD89B' },
  'NES': { bg: '#C41E3A', spine: '#8B1528', text: '#FFB5C0' },
  'Game Boy': { bg: '#7B8D6E', spine: '#5A6B4E', text: '#D4E0C8' },
  'Super Famicom': { bg: '#6B6B9E', spine: '#4A4A7E', text: '#C8C8E8' },
  'PlayStation': { bg: '#003087', spine: '#002060', text: '#80A8E0' },
  'Nintendo 64': { bg: '#2D2D2D', spine: '#1A1A1A', text: '#B0B0B0' },
  'Dreamcast': { bg: '#FF6B00', spine: '#CC5500', text: '#FFD4AA' },
  'PlayStation 2': { bg: '#00439C', spine: '#003070', text: '#80B0E0' },
  'Nintendo DS': { bg: '#A8A8A8', spine: '#808080', text: '#E0E0E0' },
  'Nintendo Switch': { bg: '#E60012', spine: '#B0000E', text: '#FFB0B5' },
};

export default function ShelfView({ collectionGames, onSelectGame }: ShelfViewProps) {
  // Group by platform
  const byPlatform = collectionGames.reduce<Record<string, Game[]>>((acc, game) => {
    if (!acc[game.platform]) acc[game.platform] = [];
    acc[game.platform].push(game);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(byPlatform).map(([platform, platformGames]) => {
        const colors = platformColors[platform] || { bg: '#3A4E66', spine: '#2A3A50', text: '#8899AA' };
        return (
          <div key={platform}>
            <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.bg }} />
              {platform}
              <span className="text-text-muted text-xs font-normal">{platformGames.length}개</span>
            </h3>
            {/* Shelf */}
            <div className="relative">
              {/* Games on shelf */}
              <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-2 min-h-[160px] items-end">
                {platformGames.map(game => (
                  <button
                    key={game.id}
                    onClick={() => onSelectGame(game)}
                    className="game-spine shrink-0 cursor-pointer group"
                    title={game.title}
                  >
                    <div
                      className="relative w-10 sm:w-12 h-32 sm:h-40 rounded-sm flex flex-col items-center justify-center shadow-md"
                      style={{
                        background: `linear-gradient(90deg, ${colors.spine}, ${colors.bg}, ${colors.spine})`,
                        borderLeft: `2px solid ${colors.spine}`,
                        borderRight: `1px solid ${colors.spine}`,
                      }}
                    >
                      {/* Spine text */}
                      <div
                        className="absolute inset-x-1 inset-y-2 flex items-center justify-center overflow-hidden whitespace-nowrap"
                        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                      >
                        <span
                          className="font-pixel text-[5px] sm:text-[6px] leading-tight text-center"
                          style={{ color: colors.text }}
                        >
                          {game.title.length > 20 ? game.title.slice(0, 20) + '…' : game.title}
                        </span>
                      </div>
                      {/* Hover shine */}
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-sm" />
                    </div>
                  </button>
                ))}
              </div>
              {/* Shelf board */}
              <div className="shelf-wood h-3 rounded-b-md" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

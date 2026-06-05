"use client";
import { useMemo } from 'react';
import { CollectionItem, Game } from '../types';
import { 
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  BarChart3, Clock, Star, History, Disc, Package, DollarSign, 
  Gamepad2, CalendarPlus, Flame
} from 'lucide-react';

interface StatsProps {
  games: Game[];
  collection: CollectionItem[];
}

const CHART_COLORS = ['#4AEDC4', '#FFB547', '#FF6B6B', '#4EA8FF', '#A78BFA', '#FF9F7F', '#67E8F9', '#FCD34D'];

export default function Stats({ games, collection }: StatsProps) {
  if (collection.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-12 text-center bg-vault-surface border border-vault-border border-dashed rounded-xl max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-vault-surface-light flex items-center justify-center mb-4">
            <BarChart3 className="text-text-muted" size={32} />
          </div>
          <h3 className="text-text-primary font-bold text-xl mb-2">데이터 수집 중</h3>
          <p className="text-text-secondary text-sm">컬렉션에 게임을 추가하면 당신만의 특별한 분석 리포트가 생성됩니다.</p>
        </div>
      </div>
    );
  }

  const collectionGames = useMemo(() => {
    return collection
      .map(c => ({ item: c, game: games.find(g => g.id === c.gameId) }))
      .filter((cg): cg is { item: CollectionItem; game: NonNullable<typeof cg.game> } => !!cg.game);
  }, [collection, games]);

  // ── Aggregations ──
  const stats = useMemo(() => {
    let totalPurchase = 0;
    let totalPlayTime = 0;
    let totalRating = 0;
    let ratingCount = 0;

    const platformCounts: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    const eraCounts: Record<string, number> = {};
    const purchaseByYear: Record<string, number> = {};
    const playTimeByGenre: Record<string, number> = {};

    let oldestGame = collectionGames[0]?.game;
    let newestAcquired = collectionGames[0]; // Based on purchaseDate or fallback
    
    collectionGames.forEach(cg => {
      const { item, game } = cg;
      
      // Totals
      totalPurchase += item.purchasePrice || 0;
      totalPlayTime += item.playTime || 0;
      if (item.rating > 0) {
        totalRating += item.rating;
        ratingCount++;
      }

      // Groupings
      platformCounts[game.platform] = (platformCounts[game.platform] || 0) + 1;
      genreCounts[game.genre] = (genreCounts[game.genre] || 0) + 1;
      
      const era = game.era.split(' ')[0] + ' ' + (game.era.split(' ')[1] || ''); // e.g. "4th Gen" or "1990s"
      eraCounts[era] = (eraCounts[era] || 0) + 1;

      // Purchase trend (Group by Year)
      if (item.purchaseDate) {
        const year = item.purchaseDate.substring(0, 4);
        purchaseByYear[year] = (purchaseByYear[year] || 0) + (item.purchasePrice || 0);
      }

      // Playtime by genre
      if (item.playTime) {
        playTimeByGenre[game.genre] = (playTimeByGenre[game.genre] || 0) + item.playTime;
      }

      // Extremes
      if (game.releaseYear < oldestGame.releaseYear) oldestGame = game;
      if (item.purchaseDate && (!newestAcquired.item.purchaseDate || item.purchaseDate > newestAcquired.item.purchaseDate)) {
        newestAcquired = cg;
      }
    });

    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';

    const sortObject = (obj: Record<string, number>) => 
      Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const platformData = sortObject(platformCounts);
    const genreData = sortObject(genreCounts);
    const eraData = sortObject(eraCounts);
    
    const purchaseTrend = Object.entries(purchaseByYear)
      .map(([year, amount]) => ({ year, amount }))
      .sort((a, b) => a.year.localeCompare(b.year));

    const playTimeTrend = sortObject(playTimeByGenre).slice(0, 5); // top 5 genres by playtime

    return {
      totalGames: collectionGames.length,
      totalPurchase,
      totalPlayTime,
      avgRating,
      topPlatform: platformData[0],
      topGenre: genreData[0],
      topEra: eraData[0],
      oldestGame,
      newestAcquired,
      platformData,
      genreData,
      eraData,
      purchaseTrend,
      playTimeTrend
    };
  }, [collectionGames]);

  // ── Smart Summary Generation ──
  const generateSummary = () => {
    const { topEra, topGenre, topPlatform, platformData } = stats;
    if (!topEra || !topGenre || !topPlatform) return '다양한 게임을 수집 중인 컬렉터입니다.';

    // Check for portable dominance
    const portables = ['Game Boy', 'Nintendo DS', 'Nintendo Switch', 'PSP', 'PS Vita'];
    const portableCount = platformData.filter(p => portables.includes(p.name)).reduce((sum, p) => sum + p.value, 0);
    const isPortableLover = (portableCount / stats.totalGames) > 0.4;

    const eraName = topEra.name.replace('Gen', '세대').replace('th', '').replace('rd', '').replace('nd', '').replace('st', '');
    
    let summary = `당신은 "${eraName} ${topGenre.name} 매니아" 입니다. `;
    
    if (isPortableLover) {
      summary += `특히 휴대용 콘솔 중심의 컬렉션을 선호하며, `;
    }
    
    summary += `전체 컬렉션은 ${topPlatform.name} 플랫폼에 강하게 집중되어 있습니다.`;

    return summary;
  };

  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-vault-surface border border-vault-border rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-text-primary font-medium mb-1">{label || payload[0].name}</p>
          <p className="text-sm font-bold" style={{ color: payload[0].color || payload[0].fill || '#4AEDC4' }}>
            {formatter ? formatter(payload[0].value) : `${payload[0].value}개`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Report Header & Smart Summary */}
      <div className="bg-gradient-to-br from-vault-surface to-vault-surface-light border border-vault-border rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute -top-10 -right-10 p-8 opacity-5 text-neon-blue transform rotate-12">
          <BarChart3 size={200} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-text-primary mb-4 relative z-10">컬렉터 리포트</h2>
        
        <div className="inline-block bg-mint/10 border border-mint/20 rounded-xl px-5 py-3 relative z-10 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Flame className="text-mint shrink-0 mt-0.5" size={20} />
            <p className="text-sm md:text-base text-mint font-medium leading-relaxed">
              {generateSummary()}
            </p>
          </div>
        </div>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 flex flex-col justify-between hover:border-neon-blue/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted">총 보유 게임</span>
            <Package size={16} className="text-neon-blue" />
          </div>
          <span className="text-2xl font-black text-text-primary">{stats.totalGames}<span className="text-sm text-text-muted font-normal ml-1">개</span></span>
        </div>
        
        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 flex flex-col justify-between hover:border-mint/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted">총 구매 금액</span>
            <DollarSign size={16} className="text-mint" />
          </div>
          <span className="text-2xl font-black text-text-primary">{stats.totalPurchase.toLocaleString()}<span className="text-sm text-text-muted font-normal ml-1">원</span></span>
        </div>

        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 flex flex-col justify-between hover:border-amber/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted">평균 평점</span>
            <Star size={16} className="text-amber" />
          </div>
          <span className="text-2xl font-black text-text-primary">{stats.avgRating}<span className="text-sm text-text-muted font-normal ml-1">/ 5.0</span></span>
        </div>

        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 flex flex-col justify-between hover:border-neon-purple/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted">총 플레이 시간</span>
            <Clock size={16} className="text-neon-purple" />
          </div>
          <span className="text-2xl font-black text-text-primary">{stats.totalPlayTime}<span className="text-sm text-text-muted font-normal ml-1">시간</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Extremes */}
        <div className="bg-vault-bg border border-vault-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-vault-surface flex items-center justify-center border border-vault-border shrink-0">
            <History size={20} className="text-text-muted" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">가장 오래된 게임</p>
            <p className="text-sm font-bold text-text-primary">{stats.oldestGame?.title}</p>
            <p className="text-xs text-text-secondary">{stats.oldestGame?.platform} ({stats.oldestGame?.releaseYear})</p>
          </div>
        </div>

        <div className="bg-vault-bg border border-vault-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-vault-surface flex items-center justify-center border border-vault-border shrink-0">
            <CalendarPlus size={20} className="text-neon-blue" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">가장 최근 등록</p>
            <p className="text-sm font-bold text-text-primary">{stats.newestAcquired?.game.title}</p>
            <p className="text-xs text-text-secondary">{stats.newestAcquired?.item.purchaseDate || '날짜 미상'}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Era Distribution */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <History size={16} className="text-text-muted" /> 시대 분포
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.eraData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3A50" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#8899AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8899AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="value" fill="#A78BFA" radius={[4, 4, 0, 0]}>
                  {stats.eraData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Purchase Trend */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-mint" /> 연도별 구매 금액
          </h3>
          <div className="h-64">
            {stats.purchaseTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.purchaseTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4AEDC4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4AEDC4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3A50" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#8899AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tick={{ fill: '#8899AA', fontSize: 10 }} 
                    axisLine={false} tickLine={false} 
                    tickFormatter={(value) => `${value / 10000}만`}
                  />
                  <Tooltip content={<CustomTooltip formatter={(val: number) => `${val.toLocaleString()}원`} />} />
                  <Area type="monotone" dataKey="amount" stroke="#4AEDC4" fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-text-muted text-sm">구매 내역이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Platform Ratio */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Gamepad2 size={16} className="text-neon-blue" /> 기종 비율
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.platformData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.platformData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {stats.topPlatform && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-text-primary">{stats.topPlatform.value}</span>
                <span className="text-[10px] text-text-muted">{stats.topPlatform.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Genre Play Time */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Clock size={16} className="text-neon-purple" /> 장르별 플레이 시간
          </h3>
          <div className="h-64">
            {stats.playTimeTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.playTimeTrend} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3A50" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#8899AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#8899AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip formatter={(val: number) => `${val} 시간`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="value" fill="#FFB547" radius={[0, 4, 4, 0]} barSize={20}>
                    {stats.playTimeTrend.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">플레이 기록이 없습니다.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

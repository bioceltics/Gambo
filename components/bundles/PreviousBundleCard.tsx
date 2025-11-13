'use client';

interface PreviousBundleCardProps {
  bundle: {
    id: string;
    name: string;
    type: string;
    confidence: number;
    expectedReturn: number;
    publishedAt: string;
    gamesCount: number;
    games: {
      id: string;
      homeTeam: string;
      awayTeam: string;
      pick: string;
      odds: number;
    }[];
  };
}

export function PreviousBundleCard({ bundle }: PreviousBundleCardProps) {
  const getTierColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'FREE': return 'from-green-600 to-emerald-600';
      case 'BASIC': return 'from-blue-600 to-cyan-600';
      case 'PRO': return 'from-purple-600 to-pink-600';
      case 'ULTIMATE': return 'from-orange-600 to-red-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getTierBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'FREE': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'BASIC': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'PRO': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'ULTIMATE': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const totalOdds = bundle.games.reduce((acc, game) => acc * game.odds, 1);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#2a2d42] bg-gradient-to-br from-[#0a0b14] via-[#13152a] to-[#0a0b14] hover:border-purple-500/30 transition-all duration-300">
      {/* Premium animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-indigo-600/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${getTierColor(bundle.type)} opacity-60`}></div>

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Bundle Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getTierBadgeColor(bundle.type)} shadow-sm`}>
                {bundle.type}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span className="font-medium">{formatDate(bundle.publishedAt)}</span>
                <span>•</span>
                <span>{new Date(bundle.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>

            <h3 className="text-lg font-black text-gray-100 mb-4 group-hover:text-white transition-colors">{bundle.name}</h3>

            {/* Games Summary */}
            <div className="space-y-2">
              {bundle.games.slice(0, 3).map((game, idx) => (
                <div key={game.id} className="flex items-center gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getTierColor(bundle.type)} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-gray-300 font-medium truncate">
                    {game.homeTeam} vs {game.awayTeam}
                  </span>
                  <span className="text-purple-400 font-semibold text-xs px-2 py-1 bg-purple-500/10 rounded">
                    @{game.odds.toFixed(2)}
                  </span>
                </div>
              ))}
              {bundle.games.length > 3 && (
                <div className="flex items-center gap-3 text-sm pl-9">
                  <p className="text-xs text-gray-500 font-medium">
                    +{bundle.games.length - 3} more picks
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Stats */}
          <div className="text-right">
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20">
              <p className="text-xs text-purple-300 font-semibold mb-2 uppercase tracking-wider">Total Odds</p>
              <p className="text-3xl font-black bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {totalOdds.toFixed(2)}x
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-lg p-2">
                <p className="text-sm text-green-400 font-black">{bundle.confidence}%</p>
                <p className="text-xs text-gray-600 font-medium">Confidence</p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-lg p-2">
                <p className="text-sm text-blue-400 font-black">{bundle.gamesCount}</p>
                <p className="text-xs text-gray-600 font-medium">Picks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Medal } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  profilePicture?: string;
  rank: number;
  acceptedSubmissions: number;
  battlesWon: number;
  totalBattles: number;
  winRate: number;
  favoriteLanguage: string;
  level: string;
  points: number;
}

interface LeaderboardPodiumProps {
  warriors: LeaderboardEntry[];
  getRankIcon: (rank: number) => JSX.Element;
  getLevelBadge: (level: string) => string;
}

const LeaderboardPodium = ({ warriors, getRankIcon, getLevelBadge }: LeaderboardPodiumProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {warriors.map((warrior, index) => (
      <Card 
        key={warrior.id} 
        className={`bg-black/40 backdrop-blur-lg border transition-all duration-300 hover:scale-105 ${
          index === 0 ? 'border-yellow-400/50 shadow-lg shadow-yellow-400/20' :
          index === 1 ? 'border-gray-400/50 shadow-lg shadow-gray-400/20' :
          'border-orange-400/50 shadow-lg shadow-orange-400/20'
        }`}
      >
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getRankIcon(warrior.rank)}
          </div>
          <div className="flex justify-center mb-4">
            <Avatar className="h-16 w-16 border-2 border-cyan-400/30">
              <AvatarImage src={warrior.profilePicture} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-cyan-400 text-lg">
                {warrior.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-cyan-400">{warrior.username}</CardTitle>
          <Badge className={`${getLevelBadge(warrior.level)} animate-pulse`}>
            {warrior.level}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center">
              <div className="text-white font-bold">{warrior.points}</div>
              <div className="text-slate-400">Points</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold">{warrior.acceptedSubmissions}</div>
              <div className="text-slate-400">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold">{warrior.battlesWon}</div>
              <div className="text-slate-400">Battles Won</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold">{warrior.winRate}%</div>
              <div className="text-slate-400">Win Rate</div>
            </div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              {warrior.favoriteLanguage}
            </Badge>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default LeaderboardPodium; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Code, Trophy, Zap } from 'lucide-react';

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

interface LeaderboardTableProps {
  warriors: LeaderboardEntry[];
  getRankIcon: (rank: number) => JSX.Element;
  getLevelBadge: (level: string) => string;
}

const LeaderboardTable = ({ warriors, getRankIcon, getLevelBadge }: LeaderboardTableProps) => (
  <Card className="bg-black/40 backdrop-blur-lg border border-purple-500/30">
    <CardHeader>
      <CardTitle className="text-purple-400 flex items-center gap-2">
        <Zap className="h-5 w-5" />
        Complete Rankings
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {warriors.map((warrior) => (
          <div 
            key={warrior.id}
            className="flex items-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-400/30 transition-all duration-200"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center justify-center w-12">
                {getRankIcon(warrior.rank)}
              </div>
              <Avatar className="h-12 w-12 border-2 border-cyan-400/30">
                <AvatarImage src={warrior.profilePicture} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-cyan-400">
                  {warrior.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{warrior.username}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${getLevelBadge(warrior.level)} text-xs`}>
                    {warrior.level}
                  </Badge>
                  <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs">
                    {warrior.favoriteLanguage}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-white font-bold flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  {warrior.points}
                </div>
                <div className="text-slate-400 text-xs">Points</div>
              </div>
              <div>
                <div className="text-white font-bold flex items-center gap-1">
                  <Code className="h-4 w-4 text-green-400" />
                  {warrior.acceptedSubmissions}
                </div>
                <div className="text-slate-400 text-xs">Accepted</div>
              </div>
              <div>
                <div className="text-white font-bold flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-cyan-400" />
                  {warrior.battlesWon}/{warrior.totalBattles}
                </div>
                <div className="text-slate-400 text-xs">W/L</div>
              </div>
              <div>
                <div className="text-white font-bold flex items-center gap-1">
                  <Zap className="h-4 w-4 text-purple-400" />
                  {warrior.winRate}%
                </div>
                <div className="text-slate-400 text-xs">Win Rate</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default LeaderboardTable; 
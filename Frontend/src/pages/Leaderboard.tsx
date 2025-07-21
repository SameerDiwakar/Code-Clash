import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Zap, Target, ArrowLeft, Crown, Star, Code, Flame, User } from 'lucide-react';

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

const mockLeaderboardData: LeaderboardEntry[] = [
  {
    id: '1',
    username: 'CodeMaster2024',
    profilePicture: '',
    rank: 1,
    acceptedSubmissions: 1247,
    battlesWon: 89,
    totalBattles: 95,
    winRate: 93.7,
    favoriteLanguage: 'Python',
    level: 'Grandmaster',
    points: 2850
  },
  {
    id: '2',
    username: 'AlgoNinja',
    profilePicture: '',
    rank: 2,
    acceptedSubmissions: 1156,
    battlesWon: 78,
    totalBattles: 87,
    winRate: 89.7,
    favoriteLanguage: 'C++',
    level: 'Master',
    points: 2720
  },
  {
    id: '3',
    username: 'ByteWarrior',
    profilePicture: '',
    rank: 3,
    acceptedSubmissions: 1089,
    battlesWon: 71,
    totalBattles: 82,
    winRate: 86.6,
    favoriteLanguage: 'JavaScript',
    level: 'Master',
    points: 2580
  },
  {
    id: '4',
    username: 'StackOverflow',
    profilePicture: '',
    rank: 4,
    acceptedSubmissions: 967,
    battlesWon: 64,
    totalBattles: 76,
    winRate: 84.2,
    favoriteLanguage: 'Java',
    level: 'Expert',
    points: 2420
  },
  {
    id: '5',
    username: 'DeepCode',
    profilePicture: '',
    rank: 5,
    acceptedSubmissions: 892,
    battlesWon: 58,
    totalBattles: 71,
    winRate: 81.7,
    favoriteLanguage: 'Rust',
    level: 'Expert',
    points: 2280
  },
  {
    id: '6',
    username: 'CyberPython',
    profilePicture: '',
    rank: 6,
    acceptedSubmissions: 834,
    battlesWon: 52,
    totalBattles: 67,
    winRate: 77.6,
    favoriteLanguage: 'Python',
    level: 'Expert',
    points: 2150
  },
  {
    id: '7',
    username: 'ReactLord',
    profilePicture: '',
    rank: 7,
    acceptedSubmissions: 789,
    battlesWon: 47,
    totalBattles: 62,
    winRate: 75.8,
    favoriteLanguage: 'TypeScript',
    level: 'Advanced',
    points: 2020
  },
  {
    id: '8',
    username: 'DataStructGod',
    profilePicture: '',
    rank: 8,
    acceptedSubmissions: 723,
    battlesWon: 42,
    totalBattles: 58,
    winRate: 72.4,
    favoriteLanguage: 'C++',
    level: 'Advanced',
    points: 1890
  },
  {
    id: '9',
    username: 'MLEngineer',
    profilePicture: '',
    rank: 9,
    acceptedSubmissions: 687,
    battlesWon: 38,
    totalBattles: 54,
    winRate: 70.4,
    favoriteLanguage: 'Python',
    level: 'Advanced',
    points: 1760
  },
  {
    id: '10',
    username: 'FullStackNinja',
    profilePicture: '',
    rank: 10,
    acceptedSubmissions: 642,
    battlesWon: 34,
    totalBattles: 51,
    winRate: 66.7,
    favoriteLanguage: 'JavaScript',
    level: 'Advanced',
    points: 1630
  }
];

const Leaderboard = () => {
  const [sortBy, setSortBy] = useState<'acceptedSubmissions' | 'battlesWon' | 'winRate' | 'points'>('points');
  const [leaderboardData, setLeaderboardData] = useState(mockLeaderboardData);

  const handleSortChange = (value: string) => {
    const sortType = value as 'acceptedSubmissions' | 'battlesWon' | 'winRate' | 'points';
    setSortBy(sortType);
    
    const sortedData = [...mockLeaderboardData].sort((a, b) => {
      return b[sortType] - a[sortType];
    });
    
    // Update ranks based on new sorting
    const updatedData = sortedData.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
    
    setLeaderboardData(updatedData);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-400" />;
    return <span className="text-2xl font-bold text-slate-400">#{rank}</span>;
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      'Grandmaster': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      'Master': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      'Expert': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      'Advanced': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
    };
    return badges[level as keyof typeof badges] || 'bg-slate-500 text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/20">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/20">
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-yellow-400 animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Hall of Champions
              </h1>
              <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-slate-400 text-lg">The greatest code warriors in the arena</p>
          </div>
        </div>

        {/* Sort Controls */}
        <Card className="bg-black/40 backdrop-blur-lg border border-purple-500/30 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Leaderboard Rankings
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">Sort by:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48 bg-slate-800/50 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    <SelectItem value="points">Total Points</SelectItem>
                    <SelectItem value="acceptedSubmissions">Accepted Submissions</SelectItem>
                    <SelectItem value="battlesWon">Battles Won</SelectItem>
                    <SelectItem value="winRate">Win Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {leaderboardData.slice(0, 3).map((warrior, index) => (
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

        {/* Full Leaderboard Table */}
        <Card className="bg-black/40 backdrop-blur-lg border border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Complete Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardData.map((warrior) => (
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
      </div>
    </div>
  );
};

export default Leaderboard;
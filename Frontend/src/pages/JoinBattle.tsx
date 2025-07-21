import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Code, Clock, Trophy, Zap, Target } from 'lucide-react';

interface Battle {
  id: string;
  title: string;
  problemsCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  participants: number;
  maxParticipants: number;
  duration: string;
  creator: string;
  startTime: string;
  prizePool?: string;
}

const mockBattles: Battle[] = [
  {
    id: '1',
    title: 'Array Masters Challenge',
    problemsCount: 3,
    difficulty: 'Medium',
    participants: 45,
    maxParticipants: 100,
    duration: '2 hours',
    creator: 'CodeWarrior',
    startTime: '2024-01-20 15:00',
    prizePool: '$500'
  },
  {
    id: '2',
    title: 'Dynamic Programming Duel',
    problemsCount: 4,
    difficulty: 'Hard',
    participants: 23,
    maxParticipants: 50,
    duration: '3 hours',
    creator: 'AlgoMaster',
    startTime: '2024-01-20 18:00',
    prizePool: '$1000'
  },
  {
    id: '3',
    title: 'Binary Search Blitz',
    problemsCount: 5,
    difficulty: 'Easy',
    participants: 78,
    maxParticipants: 150,
    duration: '1.5 hours',
    creator: 'SearchGuru',
    startTime: '2024-01-21 10:00'
  },
  {
    id: '4',
    title: 'Graph Theory Gauntlet',
    problemsCount: 3,
    difficulty: 'Hard',
    participants: 12,
    maxParticipants: 30,
    duration: '4 hours',
    creator: 'GraphNinja',
    startTime: '2024-01-21 14:00',
    prizePool: '$750'
  },
  {
    id: '5',
    title: 'String Manipulation Mayhem',
    problemsCount: 6,
    difficulty: 'Medium',
    participants: 56,
    maxParticipants: 120,
    duration: '2.5 hours',
    creator: 'StringSage',
    startTime: '2024-01-22 16:00'
  },
  {
    id: '6',
    title: 'Beginner Bootcamp',
    problemsCount: 4,
    difficulty: 'Easy',
    participants: 134,
    maxParticipants: 200,
    duration: '2 hours',
    creator: 'CodeCoach',
    startTime: '2024-01-22 12:00'
  }
];

const JoinBattle = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  
  const filteredBattles = mockBattles.filter(battle => {
    const matchesSearch = battle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         battle.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || battle.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const handleJoinBattle = (battleId: string) => {
    navigate(`/battle/${battleId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'border-green-500/30 text-green-400';
      case 'Medium': return 'border-yellow-500/30 text-yellow-400';
      case 'Hard': return 'border-red-500/30 text-red-400';
      default: return 'border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-cyan-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Join Battle Arena
              </h1>
              <Badge variant="outline" className="border-cyan-400 text-cyan-400 animate-pulse">
                LIVE BATTLES
              </Badge>
            </div>
            <Button asChild variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Choose Your Battle
            </h2>
            <p className="text-slate-300 text-lg">Join epic coding battles and prove your skills</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search battles or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-600">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Battles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBattles.map((battle) => (
            <Card key={battle.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-cyan-400 text-lg leading-tight">{battle.title}</CardTitle>
                  <Badge className={`${getDifficultyColor(battle.difficulty)} bg-transparent border`}>
                    {battle.difficulty}
                  </Badge>
                </div>
                <div className="text-slate-400 text-sm">by {battle.creator}</div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-purple-400" />
                    <span className="text-slate-300">{battle.problemsCount} problems</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-slate-300">{battle.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-400" />
                    <span className="text-slate-300">{battle.participants}/{battle.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-400" />
                    <span className="text-slate-300">{battle.startTime}</span>
                  </div>
                </div>

                {battle.prizePool && (
                  <div className="flex items-center gap-2 justify-center py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded border border-yellow-500/30">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">Prize: {battle.prizePool}</span>
                  </div>
                )}

                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(battle.participants / battle.maxParticipants) * 100}%` }}
                  />
                </div>

                <Button 
                  onClick={() => handleJoinBattle(battle.id)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold"
                >
                  Join Battle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBattles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">No battles found matching your criteria</div>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default JoinBattle;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Clock, Users, Zap, Trophy } from 'lucide-react';
import { Battle } from './types';

interface BattleCardProps {
  battle: Battle;
  onJoinBattle: (battleId: string) => void;
}

const BattleCard = ({ battle, onJoinBattle }: BattleCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'border-green-500/30 text-green-400';
      case 'Medium': return 'border-yellow-500/30 text-yellow-400';
      case 'Hard': return 'border-red-500/30 text-red-400';
      default: return 'border-gray-500/30 text-gray-400';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
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
          onClick={() => onJoinBattle(battle.id)}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold"
        >
          Join Battle
        </Button>
      </CardContent>
    </Card>
  );
};

export default BattleCard;

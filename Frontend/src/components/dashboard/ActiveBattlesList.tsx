import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActiveBattle {
  id: string;
  title: string;
  participants: number;
  maxParticipants: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRemaining: string;
}

interface ActiveBattlesListProps {
  battles: ActiveBattle[];
}

const ActiveBattlesList = ({ battles }: ActiveBattlesListProps) => (
  <div className="mb-12">
    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
      Active Battles
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {battles.map((battle) => (
        <Card key={battle.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <CardTitle className="text-cyan-400 text-lg leading-tight">{battle.title}</CardTitle>
              <Badge 
                variant={battle.difficulty === 'Easy' ? 'default' : 
                        battle.difficulty === 'Medium' ? 'secondary' : 'destructive'}
              >
                {battle.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-400" />
                <span className="text-slate-300">{battle.participants}/{battle.maxParticipants}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-slate-300">{battle.timeRemaining}</span>
              </div>
            </div>
            <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold">
              <Link to={`/battle/${battle.id}`}>Continue Battle</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default ActiveBattlesList; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export interface ActiveBattle {
  id: string;
  title: string;
  participants: number;
  maxParticipants: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRemaining: string;
  status: string;
}

interface ActiveBattlesListProps {
  battles: ActiveBattle[];
  loading: boolean;
}

const ActiveBattlesList = ({ battles, loading }: ActiveBattlesListProps) => (
  <div className="mb-12">
    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
      Active Battles
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        // Show skeleton loaders when loading
        Array(3).fill(0).map((_, index) => (
          <Card key={`skeleton-${index}`} className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))
      ) : battles.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <p className="text-slate-400">No active battles found. Create one to get started!</p>
        </div>
      ) : (
        battles.map((battle) => (
          <Card key={battle.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-cyan-400 text-lg leading-tight">{battle.title}</CardTitle>
                  <Badge 
                    variant={battle.status === 'Active' ? 'default' : 'outline'}
                    className="mt-1 text-xs"
                  >
                    {battle.status}
                  </Badge>
                </div>
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
                  <span className="text-slate-300">
                    {battle.participants}/{battle.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <span className="text-slate-300">{battle.timeRemaining}</span>
                </div>
              </div>
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold"
                disabled={battle.status !== 'Active'}
              >
                <Link to={`/battle/${battle.id}`}>
                  {battle.status === 'Active' ? 'Join Battle' : battle.status}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  </div>
);

export default ActiveBattlesList;
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Clock, Users, User, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { Battle } from './types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface BattleCardProps {
  battle: Battle;
  onJoinBattle: (battleId: string) => void;
}

const BattleCard = ({ battle, onJoinBattle }: BattleCardProps) => {
  const [isJoining, setIsJoining] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-900/30 border-green-500/30 text-green-400';
      case 'Medium': return 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400';
      case 'Hard': return 'bg-red-900/30 border-red-500/30 text-red-400';
      default: return 'bg-gray-900/30 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-900/30 border-green-500/30 text-green-400';
      case 'Scheduled': return 'bg-blue-900/30 border-blue-500/30 text-blue-400';
      case 'Completed': return 'bg-purple-900/30 border-purple-500/30 text-purple-400';
      case 'Cancelled': return 'bg-gray-900/30 border-gray-500/30 text-gray-400';
      default: return 'bg-gray-900/30 border-gray-500/30 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'N/A';
    }
  };

  const handleJoinClick = async () => {
    try {
      setIsJoining(true);
      await onJoinBattle(battle._id);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-cyan-400 text-lg leading-tight line-clamp-2" title={battle.title}>
            {battle.title}
          </CardTitle>
          <Badge className={`${getDifficultyColor(battle.difficulty)} border`}>
            {battle.difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <User className="h-4 w-4" />
            <span className="truncate max-w-[180px]" title={battle.creator?.username || 'Unknown'}>
              {battle.creator?.username || 'Unknown'}
            </span>
          </div>
          <Badge variant="outline" className={getStatusColor(battle.status)}>
            {battle.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {battle.description && (
            <CardDescription className="text-slate-400 text-sm line-clamp-3">
              {battle.description}
            </CardDescription>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <span className="text-slate-300 truncate" title={`${battle.problems?.length || 0} problems`}>
                      {battle.problems?.length || 0} problems
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of problems in this battle</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-slate-300 truncate" title={`${battle.duration} minutes`}>
                      {battle.duration} min
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Battle duration</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">
                      {battle.participants?.length || 0}/{battle.maxParticipants}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Participants (joined/max)</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <span className="text-slate-300 truncate" title={new Date(battle.startTime).toLocaleString()}>
                      {formatDate(battle.startTime)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Starts {formatDate(battle.startTime)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {battle.status === 'Active' && battle.endTime && (
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-900/20 border border-amber-500/30 rounded px-3 py-1.5">
              <AlertCircle className="h-4 w-4" />
              <span>Ends {formatDate(battle.endTime)}</span>
            </div>
          )}
          
          {battle.tags && battle.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {battle.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-slate-800/50 border-slate-700 text-slate-300">
                  {tag}
                </Badge>
              ))}
              {battle.tags.length > 3 && (
                <Badge variant="outline" className="text-xs bg-slate-800/50 border-slate-700 text-slate-400">
                  +{battle.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-6 space-y-3">
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, ((battle.participants?.length || 0) / battle.maxParticipants) * 100)}%` 
              }}
            />
          </div>
          
          <Button 
            onClick={handleJoinClick}
            disabled={isJoining || battle.status !== 'Active'}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold disabled:opacity-50 disabled:pointer-events-none"
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : battle.status === 'Active' ? (
              'Join Battle'
            ) : (
              battle.status
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattleCard;

import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Users, Clock, Badge as LucideBadge } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputSample: string;
  outputSample: string;
  constraints: string[];
}

interface Participant {
  id: string;
  username: string;
  avatar: string;
  code: string;
  language: string;
  submissionTime: string;
  verdict: string;
  executionTime?: string;
  memoryUsed?: string;
  testsPassed?: number;
  totalTests?: number;
}

interface BattleData {
  id: string;
  problem: Problem;
  participants: Participant[];
  status: 'ongoing' | 'completed';
  startTime: string;
  duration: number;
}

interface SpectateBattleHeaderProps {
  battleData: BattleData;
}

const SpectateBattleHeader = ({ battleData }: SpectateBattleHeaderProps) => (
  <div className="mb-6">
    <Button asChild variant="outline" className="mb-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400/20">
      <Link to="/">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
    </Button>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Eye className="h-8 w-8 text-cyan-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Spectate Battle</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {battleData.participants.length} participants
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Started {battleData.startTime}
            </span>
            <Badge variant={battleData.status === 'completed' ? 'default' : 'secondary'}>
              {battleData.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SpectateBattleHeader; 
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Crown, User } from 'lucide-react';

const LeaderboardHeader = () => (
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
);

export default LeaderboardHeader; 
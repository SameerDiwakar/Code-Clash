import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, User } from 'lucide-react';

const ProfileHeader = () => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-6">
      <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/20">
        <Link to="/dashboard">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </Button>
      <Button asChild variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/20">
        <Link to="/leaderboard">
          <Trophy className="h-4 w-4 mr-2" />
          Leaderboard
        </Link>
      </Button>
    </div>
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <User className="h-8 w-8 text-cyan-400" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Warrior Profile
        </h1>
        <Trophy className="h-8 w-8 text-purple-400" />
      </div>
      <p className="text-slate-400 text-lg">Customize your coding warrior profile</p>
    </div>
  </div>
);

export default ProfileHeader; 
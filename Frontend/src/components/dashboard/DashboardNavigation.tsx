import { Button } from '@/components/ui/button';
import { User, Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardNavigation = () => (
  <div className="flex items-center justify-between mb-8">
    <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/20">
      <Link to="/">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
    </Button>
    <div className="flex gap-2">
      <Button asChild variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/20">
        <Link to="/profile">
          <User className="h-4 w-4 mr-2" />
          Profile
        </Link>
      </Button>
      <Button asChild variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/20">
        <Link to="/leaderboard">
          <Trophy className="h-4 w-4 mr-2" />
          Leaderboard
        </Link>
      </Button>
    </div>
  </div>
);

export default DashboardNavigation; 
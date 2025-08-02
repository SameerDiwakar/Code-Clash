import { Button } from '@/components/ui/button';
import { Zap, Crown, User, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardQuickActions = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
    <Button asChild size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold p-6 h-auto flex-col">
      <Link to="/join-battle" className="space-y-2">
        <Zap className="h-8 w-8" />
        <span>Join Battle</span>
      </Link>
    </Button>
    <Button asChild size="lg" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/20 p-6 h-auto flex-col">
      <Link to="/leaderboard" className="space-y-2">
        <Crown className="h-8 w-8" />
        <span>Leaderboard</span>
      </Link>
    </Button>
    <Button asChild size="lg" variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/20 p-6 h-auto flex-col">
      <Link to="/profile" className="space-y-2">
        <User className="h-8 w-8" />
        <span>Profile</span>
      </Link>
    </Button>
    <Button asChild size="lg" variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/20 p-6 h-auto flex-col">
      <Link to="/create-battle" className="space-y-2">
        <Target className="h-8 w-8" />
        <span>Create Battle</span>
      </Link>
    </Button>
  </div>
);

export default DashboardQuickActions; 
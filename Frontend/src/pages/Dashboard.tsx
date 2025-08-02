import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/index/LoadingScreen';
import { 
  Trophy, Clock, Target, Zap, Play, CheckCircle, XCircle, 
  AlertCircle, Code, Calendar, User, BarChart3, Crown, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardStatsOverview from '@/components/dashboard/DashboardStatsOverview';
import ActiveBattlesList from '@/components/dashboard/ActiveBattlesList';
import RecentSubmissionsTable from '@/components/dashboard/RecentSubmissionsTable';

interface Submission {
  id: string;
  challenge: string;
  status: 'Success' | 'Failed' | 'Pending';
  language: string;
  time: string;
}

interface ActiveBattle {
  id: string;
  title: string;
  participants: number;
  maxParticipants: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRemaining: string;
}

const mockSubmissions: Submission[] = [
  {
    id: '1',
    challenge: 'Array Max Result',
    status: 'Success',
    language: 'JavaScript',
    time: '2 minutes ago'
  },
  {
    id: '2',
    challenge: 'Binary Tree Traversal',
    status: 'Failed',
    language: 'Python',
    time: '5 minutes ago'
  },
  {
    id: '3',
    challenge: 'Graph Shortest Path',
    status: 'Pending',
    language: 'Java',
    time: '10 minutes ago'
  },
  {
    id: '4',
    challenge: 'String Compression',
    status: 'Success',
    language: 'C++',
    time: '15 minutes ago'
  }
];

const mockActiveBattles: ActiveBattle[] = [
  {
    id: '101',
    title: 'Quick Code Clash',
    participants: 45,
    maxParticipants: 50,
    difficulty: 'Medium',
    timeRemaining: '25:30'
  },
  {
    id: '102',
    title: 'Algorithm Arena',
    participants: 20,
    maxParticipants: 30,
    difficulty: 'Hard',
    timeRemaining: '1:12:45'
  },
  {
    id: '103',
    title: 'Beginner Bootcamp',
    participants: 15,
    maxParticipants: 20,
    difficulty: 'Easy',
    timeRemaining: '45:00'
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  setTimeout(() => setIsLoading(false), 1000);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>

      <main className="relative z-10 container mx-auto px-6 py-12">
        {/* Navigation */}
        <DashboardNavigation />
        {/* Welcome Header */}
        <DashboardWelcomeHeader username={user?.username} />

        {/* Quick Actions */}
        <DashboardQuickActions />
        {/* Stats Overview */}
        <DashboardStatsOverview />

        {/* Active Battles */}
        <ActiveBattlesList battles={mockActiveBattles} />

        {/* Recent Submissions */}
        <RecentSubmissionsTable submissions={mockSubmissions} />
      </main>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import axios from 'axios';
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

interface BattleProblem {
  title: string;
  description: string;
  difficulty: string;
}

export interface Battle {
  _id: string;
  title: string;
  description: string;
  creator: {
    _id: string;
    username: string;
  };
  participants: string[];
  maxParticipants: number;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Completed' | 'Cancelled';
  startTime: string;
  endTime?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problems: BattleProblem[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ActiveBattle {
  id: string;
  title: string;
  participants: number;
  maxParticipants: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRemaining: string;
  status: string;
}

const mockSubmissions = [
  {
    id: '1',
    challenge: 'Array Max Result',
    status: 'Success' as const,
    language: 'JavaScript',
    time: '2 minutes ago'
  },
  {
    id: '2',
    challenge: 'Binary Tree Traversal',
    status: 'Failed' as const,
    language: 'Python',
    time: '5 minutes ago'
  },
  {
    id: '3',
    challenge: 'Graph Shortest Path',
    status: 'Pending' as const,
    language: 'Java',
    time: '10 minutes ago'
  },
  {
    id: '4',
    challenge: 'String Compression',
    status: 'Success' as const,
    language: 'C++',
    time: '15 minutes ago'
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeBattles, setActiveBattles] = useState<ActiveBattle[]>([]);
  const [isLoadingBattles, setIsLoadingBattles] = useState(true);
  const [battlesError, setBattlesError] = useState<string | null>(null);

  // Fetch active battles
  useEffect(() => {
    const fetchActiveBattles = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/battles', {
          params: { status: 'Active' },
          withCredentials: true
        });
        
        // Keep only time-window active battles on the client to avoid server/client TZ mismatch
        const now = new Date();
        const activeNow = (b: Battle) => {
          const start = new Date(b.startTime);
          const end = b.endTime ? new Date(b.endTime) : undefined;
          if (!end) return false; // require endTime to compute window
          return start <= now && end > now;
        };

        const filtered = (response.data.battles as Battle[]).filter(activeNow);

        // Transform to ActiveBattle interface
        const formattedBattles = filtered.map((battle: Battle) => ({
          id: battle._id,
          title: battle.title,
          participants: battle.participants?.length || 0,
          maxParticipants: battle.maxParticipants,
          difficulty: battle.difficulty as 'Easy' | 'Medium' | 'Hard',
          timeRemaining: calculateTimeRemaining(battle.endTime),
          status: 'Active'
        }));
        
        setActiveBattles(formattedBattles);
      } catch (error) {
        console.error('Error fetching battles:', error);
        setBattlesError('Failed to load active battles');
      } finally {
        setIsLoadingBattles(false);
      }
    };

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      fetchActiveBattles();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Helper function to calculate time remaining
  const calculateTimeRemaining = (endTime?: string): string => {
    if (!endTime) return '--:--';
    
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, end - now);
    
    if (diff <= 0) return '00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:00`
      : `${minutes}:00`;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
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

        {/* Recent Submissions */}
        <RecentSubmissionsTable submissions={mockSubmissions} />
      </main>
    </div>
  );
};

export default Dashboard;

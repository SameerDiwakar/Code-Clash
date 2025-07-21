import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/LoadingScreen';
import { 
  Trophy, Clock, Target, Zap, Play, CheckCircle, XCircle, 
  AlertCircle, Code, Calendar, User, BarChart3, Crown, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-slate-400 text-lg">Ready for your next coding battle?</p>
        </div>

        {/* Quick Actions */}
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Total Battles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">127</div>
              <p className="text-slate-400 text-sm">Battles participated in</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Challenges Won
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">95</div>
              <p className="text-slate-400 text-sm">Challenges conquered</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Challenges Lost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">32</div>
              <p className="text-slate-400 text-sm">Areas for improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Battles */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Active Battles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockActiveBattles.map((battle) => (
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

        {/* Recent Submissions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Recent Submissions
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Challenge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {mockSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{submission.challenge}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.status === 'Success' && (
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Success
                        </div>
                      )}
                      {submission.status === 'Failed' && (
                        <div className="flex items-center text-red-400">
                          <XCircle className="h-4 w-4 mr-1" />
                          Failed
                        </div>
                      )}
                      {submission.status === 'Pending' && (
                        <div className="flex items-center text-yellow-400">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Pending
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{submission.language}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{submission.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

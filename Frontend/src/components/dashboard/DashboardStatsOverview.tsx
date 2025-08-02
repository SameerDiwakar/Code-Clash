import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CheckCircle, XCircle } from 'lucide-react';

const DashboardStatsOverview = () => (
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
);

export default DashboardStatsOverview; 
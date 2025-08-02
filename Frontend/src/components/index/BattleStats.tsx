import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Code, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BattleStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-cyan-400 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Active Battles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">1,247</div>
        <p className="text-slate-400 text-sm">Warriors fighting now</p>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-purple-400 flex items-center">
          <Code className="h-5 w-5 mr-2" />
          Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">8,521</div>
        <p className="text-slate-400 text-sm">Problems solved today</p>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-yellow-400 flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          Champions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">156</div>
        <p className="text-slate-400 text-sm">Elite rank holders</p>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-green-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-400 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Warriors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">45,892</div>
        <p className="text-slate-400 text-sm">Registered fighters</p>
      </CardContent>
    </Card>
  </div>
);

export default BattleStats; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type BattleModesProps = {
  user: any;
};

const BattleModes = ({ user }: BattleModesProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
    <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/50 backdrop-blur-sm hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-red-400 text-2xl flex items-center">
          <Flame className="h-6 w-6 mr-3" />
          Quick Battle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-300">
          Jump into instant battles with random opponents. Test your skills in fast-paced coding duels.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Instant Match</Badge>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">5-30 min</Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">All Levels</Badge>
        </div>
        {user ? (
          <Button asChild className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold">
            <Link to="/join-battle">Enter Quick Battle</Link>
          </Button>
        ) : (
          <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold">
            <Link to="/login">Login to Join</Link>
          </Button>
        )}
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/50 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-purple-400 text-2xl flex items-center">
          <Target className="h-6 w-6 mr-3" />
          Challenge Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-300">
          Create custom battles or challenge specific opponents. Set your own rules and problem sets.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Custom Rules</Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Private Rooms</Badge>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Pro Level</Badge>
        </div>
        {user ? (
          <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold">
            <Link to="/create-battle">Create Challenge</Link>
          </Button>
        ) : (
          <Button asChild className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-semibold">
            <Link to="/register">Join to Create</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
);

export default BattleModes; 
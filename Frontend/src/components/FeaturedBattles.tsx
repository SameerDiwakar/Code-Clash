import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FeaturedBattles = () => (
  <div className="text-center">
    <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
      Live Battle Arena
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((battle) => (
        <Card key={battle} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                LIVE
              </Badge>
              <div className="text-cyan-400 font-mono text-sm">15:42</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-white font-semibold">CodeWarrior{battle}</div>
              <div className="text-purple-400">VS</div>
              <div className="text-white font-semibold">DevNinja{battle}</div>
            </div>
            <div className="text-slate-400 text-sm">Dynamic Programming Challenge</div>
            <Button variant="outline" size="sm" className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/20">
              Spectate Battle
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default FeaturedBattles; 
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Code } from 'lucide-react';

const BattleHeader = () => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-6">
      <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/20">
        <Link to="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </Button>
    </div>
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Trophy className="h-8 w-8 text-primary animate-pulse" />
        <h1 className="text-4xl font-bold neon-text">Battle Arena</h1>
        <Code className="h-8 w-8 text-accent animate-pulse" />
      </div>
      <p className="text-muted-foreground text-lg">Choose your weapon and conquer the challenges!</p>
    </div>
  </div>
);

export default BattleHeader; 
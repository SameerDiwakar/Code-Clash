import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateBattleHeader = () => {
  return (
    <header className="relative z-10 border-b border-purple-500/30 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Swords className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Battle
            </h1>
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              FORGE MODE
            </Badge>
          </div>
          <Button asChild variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-500/20">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CreateBattleHeader;

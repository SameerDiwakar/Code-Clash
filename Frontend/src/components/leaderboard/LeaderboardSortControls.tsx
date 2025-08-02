import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target } from 'lucide-react';

interface LeaderboardSortControlsProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

const LeaderboardSortControls = ({ sortBy, onSortChange }: LeaderboardSortControlsProps) => (
  <Card className="bg-black/40 backdrop-blur-lg border border-purple-500/30 mb-8">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Leaderboard Rankings
        </CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48 bg-slate-800/50 border-purple-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-purple-500/30">
              <SelectItem value="points">Total Points</SelectItem>
              <SelectItem value="acceptedSubmissions">Accepted Submissions</SelectItem>
              <SelectItem value="battlesWon">Battles Won</SelectItem>
              <SelectItem value="winRate">Win Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
  </Card>
);

export default LeaderboardSortControls; 
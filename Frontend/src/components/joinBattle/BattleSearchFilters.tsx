import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface BattleSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (value: string) => void;
}

const BattleSearchFilters = ({
  searchTerm,
  setSearchTerm,
  difficultyFilter,
  setDifficultyFilter,
}: BattleSearchFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search battles or creators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>
      <div className="w-full md:w-48">
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="bg-slate-800/50 border-slate-600">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BattleSearchFilters;

import BattleCard from './BattleCard';
import { Battle } from './types';

interface BattlesGridProps {
  battles: Battle[];
  onJoinBattle: (battleId: string) => void;
}

const BattlesGrid = ({ battles, onJoinBattle }: BattlesGridProps) => {
  if (battles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">No battles found matching your criteria</div>
        <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {battles.map((battle) => (
        <BattleCard 
          key={battle.id} 
          battle={battle} 
          onJoinBattle={onJoinBattle}
        />
      ))}
    </div>
  );
};

export default BattlesGrid;

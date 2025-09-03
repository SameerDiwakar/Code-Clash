import { useState } from 'react';
import BattleCard from './BattleCard';
import { Battle } from './types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BattlesGridProps {
  battles: Battle[];
  onJoinBattle: (battleId: string, accessCode?: string) => Promise<void>;
  onDeleteBattle?: (battleId: string) => void;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const BattlesGrid = ({ 
  battles, 
  onJoinBattle, 
  onDeleteBattle,
  isLoadingMore = false, 
  onLoadMore,
  hasMore = false 
}: BattlesGridProps) => {
  if (battles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">No battles found matching your criteria</div>
        <p className="text-slate-500 mt-2">Try adjusting your search or create a new battle</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {battles.map((battle) => (
          <BattleCard 
            key={battle._id} 
            battle={battle} 
            onJoinBattle={onJoinBattle}
            onDeleteBattle={onDeleteBattle}
          />
        ))}
      </div>
      
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Battles'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BattlesGrid;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BattleSearchFilters from './BattleSearchFilters';
import BattlesGrid from './BattlesGrid';
import { mockBattles } from './mockData';

const JoinBattleContent = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  
  const filteredBattles = mockBattles.filter(battle => {
    const matchesSearch = battle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         battle.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || battle.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const handleJoinBattle = (battleId: string) => {
    navigate(`/battle/${battleId}`);
  };

  return (
    <main className="container mx-auto px-6 py-12">
      <BattleSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
      />
      
      <BattlesGrid 
        battles={filteredBattles}
        onJoinBattle={handleJoinBattle}
      />
    </main>
  );
};

export default JoinBattleContent;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BattleSearchFilters from './BattleSearchFilters';
import BattlesGrid from './BattlesGrid';
import { Battle } from './types';
import { Skeleton } from '@/components/ui/skeleton';

const JoinBattleContent = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [battles, setBattles] = useState<Battle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 9; // Number of battles per page

  // Fetch battles from the backend
  const fetchBattles = async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await axios.get('http://localhost:4000/api/battles', {
        withCredentials: true,
        params: {
          page: pageNum,
          limit,
          status: 'Active,Scheduled' // Only show active and scheduled battles
        }
      });

      if (isLoadMore) {
        setBattles(prev => [...prev, ...response.data.battles]);
      } else {
        setBattles(response.data.battles);
      }

      setHasMore(response.data.battles.length === limit);
      setError(null);
    } catch (err) {
      console.error('Error fetching battles:', err);
      setError('Failed to load battles. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBattles(1, false);
  }, []);

  // Handle loading more battles
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBattles(nextPage, true);
  };

  // Handle joining a battle
  const handleJoinBattle = async (battleId: string) => {
    try {
      await axios.post(
        `http://localhost:4000/api/battles/${battleId}/join`,
        {},
        { withCredentials: true }
      );
      
      // Refresh the battles list to show updated participant count
      fetchBattles(1, false);
      
      // Navigate to the battle page
      navigate(`/battle/${battleId}`);
    } catch (err) {
      console.error('Error joining battle:', err);
      setError('Failed to join battle. Please try again.');
    }
  };

  // Filter battles based on search and filters
  const filteredBattles = battles.filter(battle => {
    const matchesSearch = battle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         battle.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || 
                            battle.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  // Loading state
  if (isLoading) {
    return (
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="container mx-auto px-6 py-12">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">Error loading battles</div>
          <p className="text-slate-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-12">
      <BattleSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
      />
      
      {filteredBattles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg">No battles found matching your criteria</div>
          <p className="text-slate-500 mt-2">Try adjusting your search or create a new battle</p>
        </div>
      ) : (
        <BattlesGrid 
          battles={filteredBattles}
          onJoinBattle={handleJoinBattle}
          isLoadingMore={isLoadingMore}
          onLoadMore={hasMore ? handleLoadMore : undefined}
          hasMore={hasMore}
        />
      )}
    </main>
  );
};

export default JoinBattleContent;

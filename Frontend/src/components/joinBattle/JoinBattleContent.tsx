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
  // Separate errors for loading the list vs. joining a battle
  const [loadError, setLoadError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
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
          // Show battles that users can join. Backend uses lowercase enums and new battles default to 'waiting'.
          // Include 'waiting', 'active', and 'scheduled' so newly created/upcoming battles appear.
          status: 'waiting,active,scheduled',
          includeRecentCompleted: true,
          recentHours: 24
        }
      });

      let fetched = response.data?.battles || [];

      // Fallback: if nothing returned and no local filters applied, try again without status filter
      if (!isLoadMore && fetched.length === 0 && !searchTerm && difficultyFilter === 'all') {
        const fallback = await axios.get('http://localhost:4000/api/battles', {
          withCredentials: true,
          params: { page: pageNum, limit }
        });
        fetched = fallback.data?.battles || [];
      }

      if (isLoadMore) {
        setBattles(prev => [...prev, ...fetched]);
      } else {
        setBattles(fetched);
      }

      setHasMore(fetched.length === limit);
      setLoadError(null);
    } catch (err) {
      console.error('Error fetching battles:', err);
      setLoadError('Failed to load battles. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Handle deleting a battle (creator only)
  const handleDeleteBattle = async (battleId: string) => {
    try {
      const ok = window.confirm('Are you sure you want to delete this battle? This action cannot be undone.');
      if (!ok) return;

      await axios.delete(`http://localhost:4000/api/battles/${battleId}` , { withCredentials: true });

      // Refresh list after delete
      await fetchBattles(1, false);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to delete battle';
      console.error('Delete battle error:', err);
      alert(msg);
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
  const handleJoinBattle = async (battleId: string, accessCode?: string) => {
    try {
      // Pre-check: if already a participant, skip POST join to avoid 400
      try {
        const dbg = await axios.get(`http://localhost:4000/api/battles/${battleId}/debug`, { withCredentials: true });
        const participants = Array.isArray(dbg.data?.participants) ? dbg.data.participants : [];
        const imIn = participants.some((p: any) => p?.isCurrentUser === true);
        if (imIn) {
          navigate(`/battle/${battleId}`);
          return;
        }
      } catch (_) {
        // If debug fails, continue with join attempt
      }

      const response = await axios.post(
        `http://localhost:4000/api/battles/${battleId}/join`,
        { accessCode },
        { withCredentials: true }
      );
      
      // Clear any previous join error
      setJoinError(null);
      
      // Refresh the battles list to show updated participant count
      await fetchBattles(1, false);
      
      // Navigate to the battle page
      navigate(`/battle/${battleId}`);
    } catch (err: any) {
      // Extract error message from backend response first
      const errorMessage = err.response?.data?.error || 'Failed to join battle. Please try again.';

          // If user already joined, navigate to the battle instead of showing an error
      if (
        err?.response?.status === 400 &&
        typeof errorMessage === 'string' &&
        (errorMessage.toLowerCase().includes('already joined') ||
         errorMessage.toLowerCase().includes('already a participant'))
      ) {
        navigate(`/battle/${battleId}`);
        return;
      }
      
      // If access code is required or invalid, re-throw to be handled by BattleCard
      if (err?.response?.status === 400 && 
          typeof errorMessage === 'string' && 
          (errorMessage.toLowerCase().includes('access code') ||
           errorMessage.toLowerCase().includes('invalid code'))) {
        throw new Error(errorMessage);
      }
      
      // Log other errors (avoid noisy logs for known 'already joined' case)
      console.error('Error joining battle:', err);
      
      // Set join error message for display (do not replace the list)
      setJoinError(errorMessage);
      
      // Don't refresh battles list on error to avoid confusion
      // The user can manually refresh if needed
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

  // List loading error state
  if (loadError) {
    return (
      <main className="container mx-auto px-6 py-12">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">Error loading battles</div>
          <p className="text-slate-400">{loadError}</p>
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
      {joinError && (
        <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <div className="flex items-center justify-between">
            <span>{joinError}</span>
            <button
              onClick={() => setJoinError(null)}
              className="text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
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
          onDeleteBattle={handleDeleteBattle}
          isLoadingMore={isLoadingMore}
          onLoadMore={hasMore ? handleLoadMore : undefined}
          hasMore={hasMore}
        />
      )}
    </main>
  );
};

export default JoinBattleContent;

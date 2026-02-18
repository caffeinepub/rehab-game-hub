import { useGetAllGames } from '@/hooks/useQueries';
import { useActor } from '@/hooks/useActor';
import GameCard from '@/components/GameCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { mergeGamesWithPredefined } from '@/lib/gameConstants';

export default function HomePage() {
  const { isFetching: isActorFetching } = useActor();
  const { data: backendGames, isLoading, error } = useGetAllGames();

  // Show loading state while actor is initializing OR while games are loading
  if (isActorFetching || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive font-medium">Failed to load games</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  // Merge backend games with predefined games to ensure all playable games appear
  const games = mergeGamesWithPredefined(backendGames || []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Rehabilitation Games</h2>
        <p className="text-muted-foreground">
          Select a game to begin your therapy session
        </p>
      </div>

      {games.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-muted/30 rounded-lg border-2 border-dashed border-border p-12">
          <div className="text-center max-w-md">
            <h3 className="text-xl font-semibold text-foreground mb-2">No games available yet</h3>
            <p className="text-muted-foreground mb-4">
              Games are being prepared for you. Please check back soon or contact your administrator.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

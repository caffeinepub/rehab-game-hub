import { useParams, Link } from '@tanstack/react-router';
import { useGetGameById, useGetAllQuestions } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { MATCH_WORD_TO_IMAGE_GAME_ID } from '@/lib/gameConstants';
import MatchWordToImageGame from '@/components/MatchWordToImageGame';

export default function GameLaunchPage() {
  const { gameId } = useParams({ from: '/games/$gameId' });
  const { data: game, isLoading: gameLoading, error: gameError } = useGetGameById(gameId);
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useGetAllQuestions(gameId);

  const isLoading = gameLoading || questionsLoading;
  const error = gameError || questionsError;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive font-medium">Game not found</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'The requested game could not be loaded'}
          </p>
          <Link to="/">
            <Button variant="outline" className="gap-2 mt-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if this is the Match Word to Image game
  const isMatchWordToImageGame = gameId === MATCH_WORD_TO_IMAGE_GAME_ID;

  if (isMatchWordToImageGame && questions && questions.length > 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
        </Link>
        <MatchWordToImageGame questions={questions} gameName={game.name} />
      </div>
    );
  }

  // Show empty state if no questions
  if (isMatchWordToImageGame && (!questions || questions.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
        </Link>
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{game.name}</h2>
            <p className="text-muted-foreground mb-6">
              No questions have been added to this game yet. Please contact your administrator to add questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // For other games, show coming soon message
  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/">
        <Button variant="ghost" className="gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Button>
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-lg">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{game.name}</h1>
            <p className="text-lg text-muted-foreground mb-6">{game.description}</p>

            {game.tags && game.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {game.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-6 border border-border mb-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                This game is coming soon. Check back later for updates.
              </p>
            </div>

            <Button size="lg" disabled className="w-full">
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

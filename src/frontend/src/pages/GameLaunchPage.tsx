import ChooseCorrectImageGame from "@/components/ChooseCorrectImageGame";
import MatchWordToImageGame from "@/components/MatchWordToImageGame";
import { Button } from "@/components/ui/button";
import {
  useGetAllChooseCorrectImageQuestions,
  useGetAllQuestions,
  useGetGameById,
} from "@/hooks/useQueries";
import {
  CHOOSE_CORRECT_IMAGE_GAME_ID,
  MATCH_WORD_TO_IMAGE_GAME_ID,
  getGameMetadata,
} from "@/lib/gameConstants";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function GameLaunchPage() {
  const { gameId } = useParams({ from: "/games/$gameId" });
  const { data: backendGame, isLoading: gameLoading } = useGetGameById(gameId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Load questions based on game type
  const {
    data: matchWordQuestions,
    isLoading: matchWordLoading,
    error: matchWordError,
  } = useGetAllQuestions(gameId === MATCH_WORD_TO_IMAGE_GAME_ID ? gameId : "");
  const {
    data: chooseImageQuestions,
    isLoading: chooseImageLoading,
    error: chooseImageError,
  } = useGetAllChooseCorrectImageQuestions(
    gameId === CHOOSE_CORRECT_IMAGE_GAME_ID ? gameId : "",
  );

  const isMatchWordToImageGame = gameId === MATCH_WORD_TO_IMAGE_GAME_ID;
  const isChooseCorrectImageGame = gameId === CHOOSE_CORRECT_IMAGE_GAME_ID;

  const isLoading =
    gameLoading ||
    (isMatchWordToImageGame && matchWordLoading) ||
    (isChooseCorrectImageGame && chooseImageLoading);
  const error =
    (isMatchWordToImageGame && matchWordError) ||
    (isChooseCorrectImageGame && chooseImageError);

  // Get game metadata - fall back to predefined if backend doesn't have it
  const game = getGameMetadata(gameId, backendGame);

  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

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

  // Only show error if we don't have predefined metadata for this game
  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive font-medium">Game not found</p>
          <p className="text-sm text-muted-foreground">
            {error && "message" in error
              ? error.message
              : "The requested game could not be loaded"}
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

  // Fullscreen button — sits to the right of the game area
  const FullscreenButton = () => (
    <button
      type="button"
      onClick={handleFullscreenToggle}
      data-ocid="game.fullscreen.button"
      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      className="shrink-0 mt-1 p-2 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
    >
      {isFullscreen ? (
        <Minimize2 className="h-5 w-5" />
      ) : (
        <Maximize2 className="h-5 w-5" />
      )}
    </button>
  );

  // Back button — hidden in fullscreen
  const BackButton = () =>
    isFullscreen ? null : (
      <Link to="/">
        <Button
          variant="ghost"
          className="gap-2 shrink-0 mt-1"
          data-ocid="game.back.button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Button>
      </Link>
    );

  // Render Match Word to Image game
  if (
    isMatchWordToImageGame &&
    matchWordQuestions &&
    matchWordQuestions.length > 0
  ) {
    return (
      <div
        ref={gameContainerRef}
        className={`flex items-start gap-4 px-4 py-8 min-h-screen ${isFullscreen ? "bg-background" : ""}`}
      >
        <BackButton />
        <div className="flex-1 min-w-0">
          <MatchWordToImageGame
            questions={matchWordQuestions}
            gameName={game.name}
          />
        </div>
        <FullscreenButton />
      </div>
    );
  }

  // Render Choose Correct Image game
  if (
    isChooseCorrectImageGame &&
    chooseImageQuestions &&
    chooseImageQuestions.length > 0
  ) {
    return (
      <div
        ref={gameContainerRef}
        className={`flex items-start gap-4 px-4 py-8 min-h-screen ${isFullscreen ? "bg-background" : ""}`}
      >
        <BackButton />
        <div className="flex-1 min-w-0">
          <ChooseCorrectImageGame
            questions={chooseImageQuestions}
            gameName={game.name}
          />
        </div>
        <FullscreenButton />
      </div>
    );
  }

  // Show empty state if no questions for known games
  if (
    (isMatchWordToImageGame &&
      (!matchWordQuestions || matchWordQuestions.length === 0)) ||
    (isChooseCorrectImageGame &&
      (!chooseImageQuestions || chooseImageQuestions.length === 0))
  ) {
    return (
      <div className="flex items-start gap-4 px-4 py-8 min-h-screen">
        <BackButton />
        <div className="flex-1 min-w-0 max-w-2xl">
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {game.name}
            </h2>
            <p className="text-muted-foreground mb-6">
              No questions have been added to this game yet. Please contact your
              administrator to add questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // For other games, show coming soon message
  return (
    <div className="flex items-start gap-4 px-4 py-8 min-h-screen">
      <BackButton />

      <div className="flex-1 min-w-0 max-w-4xl">
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-lg">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {game.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {game.description}
            </p>

            {game.tags && game.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
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

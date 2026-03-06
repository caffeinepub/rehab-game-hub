import type { Game } from "@/backend";
import { ASSETS } from "@/lib/assets";
import { Link } from "@tanstack/react-router";

interface GameCardProps {
  game: Game;
  isManager?: boolean;
}

export default function GameCard({ game, isManager = false }: GameCardProps) {
  const thumbnailUrl = game.icon || ASSETS.placeholder;

  const cardContent = (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
      <div className="aspect-video w-full bg-muted relative overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={game.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = ASSETS.placeholder;
          }}
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
          {game.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
          {game.description}
        </p>
        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {game.tags.length > 3 && (
              <span className="px-2 py-0.5 text-muted-foreground text-xs">
                +{game.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isManager) {
    return cardContent;
  }

  return (
    <Link
      to="/games/$gameId"
      params={{ gameId: game.id }}
      className="block h-full"
    >
      {cardContent}
    </Link>
  );
}

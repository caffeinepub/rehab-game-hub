import type { Game } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateGame, useUpdateGame } from "@/hooks/useQueries";
import { ASSETS } from "@/lib/assets";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface GameEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game | null;
}

export default function GameEditorDialog({
  open,
  onOpenChange,
  game,
}: GameEditorDialogProps) {
  const createMutation = useCreateGame();
  const updateMutation = useUpdateGame();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    tags: "",
    primaryColor: "#6B7280",
    secondaryColor: "#9CA3AF",
  });

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name,
        description: game.description,
        icon: game.icon,
        tags: game.tags.join(", "),
        primaryColor: game.primaryColor,
        secondaryColor: game.secondaryColor,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        icon: "",
        tags: "",
        primaryColor: "#6B7280",
        secondaryColor: "#9CA3AF",
      });
    }
  }, [game]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const gameData = {
      id: game?.id || `game-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      icon: formData.icon || ASSETS.placeholder,
      badges: game?.badges || [],
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      tags,
    };

    if (game) {
      await updateMutation.mutateAsync(gameData);
    } else {
      await createMutation.mutateAsync(gameData);
    }

    onOpenChange(false);
  };

  const handleUsePlaceholder = () => {
    setFormData((prev) => ({ ...prev, icon: ASSETS.placeholder }));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // This dialog should not be used for creating games anymore
  // Only allow editing existing games (though this is also disabled in GameManagerPage)
  if (!game) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
          <DialogDescription>Update the game details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Game Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter game name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the game and its therapeutic purpose"
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Thumbnail URL</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder="Enter image URL or use default"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUsePlaceholder}
                className="mt-1"
              >
                Use Default Placeholder
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="e.g., memory, cognitive, motor skills"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      primaryColor: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryColor: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Game
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

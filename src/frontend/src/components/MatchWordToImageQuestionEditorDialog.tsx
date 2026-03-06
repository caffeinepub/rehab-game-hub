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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateQuestion } from "@/hooks/useQueries";
import { fileToExternalBlob } from "@/lib/externalBlob";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";

interface MatchWordToImageQuestionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
}

export default function MatchWordToImageQuestionEditorDialog({
  open,
  onOpenChange,
  gameId,
}: MatchWordToImageQuestionEditorDialogProps) {
  const createMutation = useCreateQuestion();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [correctOption, setCorrectOption] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!imageFile) {
      setError("Please select an image");
      return;
    }

    const options = [option1.trim(), option2.trim(), option3.trim()].filter(
      (o) => o.length > 0,
    );

    if (options.length !== 3) {
      setError("Please provide exactly 3 options");
      return;
    }

    if (!correctOption || !options.includes(correctOption)) {
      setError("Please select the correct option");
      return;
    }

    try {
      const imageBlob = await fileToExternalBlob(imageFile);

      await createMutation.mutateAsync({
        gameId,
        image: imageBlob,
        options,
        correctOption,
      });

      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setOption1("");
      setOption2("");
      setOption3("");
      setCorrectOption("");
      setError(null);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create question",
      );
    }
  };

  const handleCancel = () => {
    setImageFile(null);
    setImagePreview(null);
    setOption1("");
    setOption2("");
    setOption3("");
    setCorrectOption("");
    setError(null);
    onOpenChange(false);
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Upload an image and provide three word options. Select which option
            is correct.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Question Image *</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <Label
                    htmlFor="image"
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    Click to upload an image
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label>Word Options (exactly 3) *</Label>
              <div className="space-y-3">
                <Input
                  placeholder="Option 1"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  required
                />
                <Input
                  placeholder="Option 2"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  required
                />
                <Input
                  placeholder="Option 3"
                  value={option3}
                  onChange={(e) => setOption3(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Correct Option Selection */}
            <div className="space-y-2">
              <Label>Correct Option *</Label>
              <RadioGroup
                value={correctOption}
                onValueChange={setCorrectOption}
              >
                <div className="space-y-2">
                  {(["option-1", "option-2", "option-3"] as const).map(
                    (key, index) => {
                      const opt = [option1, option2, option3][index];
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={opt ?? ""}
                            id={`option-${index}`}
                            disabled={!opt?.trim()}
                          />
                          <Label
                            htmlFor={`option-${index}`}
                            className={`flex-1 ${!opt?.trim() ? "text-muted-foreground" : ""}`}
                          >
                            {opt?.trim() ||
                              `Option ${index + 1} (enter text above)`}
                          </Label>
                        </div>
                      );
                    },
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { useCreateChooseCorrectImageQuestion } from "@/hooks/useQueries";
import { fileToExternalBlob } from "@/lib/externalBlob";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";

interface ChooseCorrectImageQuestionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
}

interface ImageUpload {
  file: File;
  preview: string;
}

export default function ChooseCorrectImageQuestionEditorDialog({
  open,
  onOpenChange,
  gameId,
}: ChooseCorrectImageQuestionEditorDialogProps) {
  const createMutation = useCreateChooseCorrectImageQuestion();
  const [word, setWord] = useState("");
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [correctImageIndex, setCorrectImageIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => {
          // Limit to 3 images total
          if (prev.length >= 3) {
            setError("Maximum 3 images allowed");
            return prev;
          }
          return [...prev, { file, preview: reader.result as string }];
        });
      };
      reader.readAsDataURL(file);
    }

    setError(null);
    // Reset the input so the same file can be selected again if needed
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    // Adjust correct image index if needed
    if (correctImageIndex === index) {
      setCorrectImageIndex(-1);
    } else if (correctImageIndex > index) {
      setCorrectImageIndex(correctImageIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!word.trim()) {
      setError("Please enter a word");
      return;
    }

    if (images.length !== 3) {
      setError("Exactly 3 images are required");
      return;
    }

    if (correctImageIndex < 0 || correctImageIndex >= images.length) {
      setError("Please select the correct image");
      return;
    }

    try {
      const imageBlobs = await Promise.all(
        images.map((img) => fileToExternalBlob(img.file)),
      );

      await createMutation.mutateAsync({
        gameId,
        word: word.trim(),
        images: imageBlobs,
        correctImageIndex,
      });

      // Reset form
      setWord("");
      setImages([]);
      setCorrectImageIndex(-1);
      setError(null);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create question",
      );
    }
  };

  const handleCancel = () => {
    setWord("");
    setImages([]);
    setCorrectImageIndex(-1);
    setError(null);
    onOpenChange(false);
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Enter a word and upload exactly 3 images. Select which image
            correctly matches the word.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Word Input */}
            <div className="space-y-2">
              <Label htmlFor="word">Word *</Label>
              <Input
                id="word"
                placeholder="Enter a word (e.g., Apple, Dog, Car)"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                required
              />
            </div>

            {/* Image Uploads */}
            <div className="space-y-2">
              <Label>Images (exactly 3) *</Label>

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {images.map((img, index) => (
                    <div key={img.preview} className="relative group">
                      <img
                        src={img.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button - only show if less than 3 images */}
              {images.length < 3 && (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <Label
                    htmlFor="images"
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    Click to upload images ({images.length}/3)
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageAdd}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    You need exactly 3 images
                  </p>
                </div>
              )}
            </div>

            {/* Correct Image Selection */}
            {images.length === 3 && (
              <div className="space-y-2">
                <Label>Correct Image *</Label>
                <RadioGroup
                  value={correctImageIndex.toString()}
                  onValueChange={(value) =>
                    setCorrectImageIndex(Number.parseInt(value))
                  }
                >
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, index) => (
                      <div key={img.preview} className="relative">
                        <RadioGroupItem
                          value={index.toString()}
                          id={`image-${index}`}
                          className="absolute top-2 left-2 z-10"
                        />
                        <Label
                          htmlFor={`image-${index}`}
                          className={`block cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                            correctImageIndex === index
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={img.preview}
                            alt={`Option ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

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

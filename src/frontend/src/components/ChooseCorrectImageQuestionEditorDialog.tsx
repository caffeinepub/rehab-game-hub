import type { ChooseCorrectImageQuestion, ExternalBlob } from "@/backend";
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
import {
  useCreateChooseCorrectImageQuestion,
  useUpdateChooseCorrectImageQuestion,
} from "@/hooks/useQueries";
import { fileToExternalBlob } from "@/lib/externalBlob";
import { Loader2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ChooseCorrectImageQuestionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  initialQuestion?: ChooseCorrectImageQuestion;
}

// An image slot: either an existing blob (from backend) or a newly uploaded file
type ExistingImage = { kind: "existing"; url: string; blob: ExternalBlob };
type NewImage = { kind: "new"; file: File; preview: string };
type ImageSlot = ExistingImage | NewImage;

export default function ChooseCorrectImageQuestionEditorDialog({
  open,
  onOpenChange,
  gameId,
  initialQuestion,
}: ChooseCorrectImageQuestionEditorDialogProps) {
  const isEditMode = !!initialQuestion;
  const createMutation = useCreateChooseCorrectImageQuestion();
  const updateMutation = useUpdateChooseCorrectImageQuestion();

  const [word, setWord] = useState("");
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([]);
  const [correctImageIndex, setCorrectImageIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes or initialQuestion changes
  useEffect(() => {
    if (open) {
      if (initialQuestion) {
        setWord(initialQuestion.word);
        const existingSlots: ImageSlot[] = initialQuestion.images.map(
          (img) => ({
            kind: "existing",
            url: img.getDirectURL(),
            blob: img,
          }),
        );
        setImageSlots(existingSlots);
        setCorrectImageIndex(Number(initialQuestion.correctImageIndex));
      } else {
        setWord("");
        setImageSlots([]);
        setCorrectImageIndex(-1);
      }
      setError(null);
    }
  }, [open, initialQuestion]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      // In create mode, enforce 3-image limit
      if (!isEditMode) {
        setImageSlots((prev) => {
          if (prev.length >= 3) {
            setError("Maximum 3 images allowed");
            return prev;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageSlots((current) => {
              if (current.length >= 3) return current;
              return [
                ...current,
                { kind: "new", file, preview: reader.result as string },
              ];
            });
          };
          reader.readAsDataURL(file);
          return prev;
        });
      } else {
        // In edit mode, no limit
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageSlots((current) => [
            ...current,
            { kind: "new", file, preview: reader.result as string },
          ]);
        };
        reader.readAsDataURL(file);
      }
    }

    setError(null);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImageSlots((prev) => prev.filter((_, i) => i !== index));
    if (correctImageIndex === index) {
      setCorrectImageIndex(-1);
    } else if (correctImageIndex > index) {
      setCorrectImageIndex(correctImageIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!word.trim()) {
      setError("Please enter a word");
      return;
    }

    if (!isEditMode && imageSlots.length !== 3) {
      setError("Exactly 3 images are required");
      return;
    }

    if (isEditMode && imageSlots.length < 1) {
      setError("At least 1 image is required");
      return;
    }

    if (correctImageIndex < 0 || correctImageIndex >= imageSlots.length) {
      setError("Please select the correct image");
      return;
    }

    try {
      // Build the final blobs array from all slots
      const imageBlobs = await Promise.all(
        imageSlots.map(async (slot) => {
          if (slot.kind === "existing") {
            return slot.blob;
          }
          return fileToExternalBlob(slot.file);
        }),
      );

      if (isEditMode && initialQuestion) {
        await updateMutation.mutateAsync({
          gameId,
          questionId: initialQuestion.id,
          word: word.trim(),
          images: imageBlobs,
          correctImageIndex,
        });
      } else {
        await createMutation.mutateAsync({
          gameId,
          word: word.trim(),
          images: imageBlobs,
          correctImageIndex,
        });
      }

      resetAndClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? "Failed to update question"
            : "Failed to create question",
      );
    }
  };

  const resetAndClose = () => {
    setWord("");
    setImageSlots([]);
    setCorrectImageIndex(-1);
    setError(null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetAndClose();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Whether we show the upload zone
  const canAddMore = isEditMode || imageSlots.length < 3;
  const previewForSlot = (slot: ImageSlot) =>
    slot.kind === "existing" ? slot.url : slot.preview;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Question" : "Create New Question"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the word and images. Select which image correctly matches the word."
              : "Enter a word and upload exactly 3 images. Select which image correctly matches the word."}
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
                data-ocid="choose_image_question.input"
                required
              />
            </div>

            {/* Image Slots */}
            <div className="space-y-2">
              <Label>
                Images {isEditMode ? "(any number)" : "(exactly 3)"} *
              </Label>

              {imageSlots.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {imageSlots.map((slot, index) => (
                    <div
                      key={`slot-${index}-${slot.kind === "existing" ? slot.url : slot.preview}`}
                      className="relative group"
                    >
                      <img
                        src={previewForSlot(slot)}
                        alt={`Option ${index + 1}`}
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

              {canAddMore && (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <Label
                    htmlFor="images"
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    Click to upload images
                    {!isEditMode && ` (${imageSlots.length}/3)`}
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageAdd}
                    data-ocid="choose_image_question.upload_button"
                  />
                  {!isEditMode && (
                    <p className="text-xs text-muted-foreground mt-2">
                      You need exactly 3 images
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Correct Image Selection — show whenever we have images */}
            {imageSlots.length > 0 && (
              <div className="space-y-2">
                <Label>Correct Image *</Label>
                <RadioGroup
                  value={correctImageIndex.toString()}
                  onValueChange={(value) =>
                    setCorrectImageIndex(Number.parseInt(value))
                  }
                >
                  <div className="grid grid-cols-3 gap-3">
                    {imageSlots.map((slot, index) => (
                      <div
                        key={`radio-${index}-${slot.kind === "existing" ? slot.url : slot.preview}`}
                        className="relative"
                      >
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
                            src={previewForSlot(slot)}
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
              <div
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg"
                data-ocid="choose_image_question.error_state"
              >
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
              data-ocid="choose_image_question.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-ocid="choose_image_question.submit_button"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "Save Changes" : "Create Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

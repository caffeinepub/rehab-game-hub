import type { ExternalBlob, MatchWordToImageQuestion } from "@/backend";
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
import { useCreateQuestion, useUpdateQuestion } from "@/hooks/useQueries";
import { fileToExternalBlob } from "@/lib/externalBlob";
import { Loader2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MatchWordToImageQuestionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  initialQuestion?: MatchWordToImageQuestion;
}

export default function MatchWordToImageQuestionEditorDialog({
  open,
  onOpenChange,
  gameId,
  initialQuestion,
}: MatchWordToImageQuestionEditorDialogProps) {
  const isEditMode = !!initialQuestion;
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // When editing and no new file is selected, we keep the existing blob
  const [existingBlob, setExistingBlob] = useState<ExternalBlob | null>(null);
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [correctOption, setCorrectOption] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes or initialQuestion changes
  useEffect(() => {
    if (open) {
      if (initialQuestion) {
        // Pre-fill for edit mode
        const opts = initialQuestion.options;
        setOption1(opts[0] ?? "");
        setOption2(opts[1] ?? "");
        setOption3(opts[2] ?? "");
        setCorrectOption(initialQuestion.correctOption);
        setExistingBlob(initialQuestion.image);
        setImagePreview(initialQuestion.image.getDirectURL());
        setImageFile(null);
      } else {
        // Fresh state for create mode
        setOption1("");
        setOption2("");
        setOption3("");
        setCorrectOption("");
        setExistingBlob(null);
        setImageFile(null);
        setImagePreview(null);
      }
      setError(null);
    }
  }, [open, initialQuestion]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setExistingBlob(null);
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
    setExistingBlob(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const hasImage = imageFile !== null || existingBlob !== null;
    if (!hasImage) {
      setError("Please select an image");
      return;
    }

    const options = [option1.trim(), option2.trim(), option3.trim()].filter(
      (o) => o.length > 0,
    );

    if (options.length < 2) {
      setError("Please provide at least 2 options");
      return;
    }

    if (!correctOption || !options.includes(correctOption)) {
      setError("Please select the correct option");
      return;
    }

    try {
      // Determine the image blob to use
      let imageBlob: ExternalBlob;
      if (imageFile) {
        imageBlob = await fileToExternalBlob(imageFile);
      } else if (existingBlob) {
        imageBlob = existingBlob;
      } else {
        setError("Please select an image");
        return;
      }

      if (isEditMode && initialQuestion) {
        await updateMutation.mutateAsync({
          gameId,
          questionId: initialQuestion.id,
          image: imageBlob,
          options,
          correctOption,
        });
      } else {
        await createMutation.mutateAsync({
          gameId,
          image: imageBlob,
          options,
          correctOption,
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
    setImageFile(null);
    setExistingBlob(null);
    setImagePreview(null);
    setOption1("");
    setOption2("");
    setOption3("");
    setCorrectOption("");
    setError(null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetAndClose();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Question" : "Create New Question"}
          </DialogTitle>
          <DialogDescription>
            Upload an image and provide two or three word options. Select which
            option is correct.
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
              <Label>Word Options (2–3) *</Label>
              <div className="space-y-3">
                <Input
                  placeholder="Option 1"
                  value={option1}
                  onChange={(e) => {
                    setOption1(e.target.value);
                    // If the correct option was pointing to this option's old value, update it
                    if (correctOption === option1)
                      setCorrectOption(e.target.value);
                  }}
                  data-ocid="match_word_question.input"
                  required
                />
                <Input
                  placeholder="Option 2"
                  value={option2}
                  onChange={(e) => {
                    setOption2(e.target.value);
                    if (correctOption === option2)
                      setCorrectOption(e.target.value);
                  }}
                  required
                />
                <Input
                  placeholder="Option 3 (optional)"
                  value={option3}
                  onChange={(e) => {
                    setOption3(e.target.value);
                    if (correctOption === option3)
                      setCorrectOption(e.target.value);
                  }}
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
                  {[
                    { opt: option1, pos: 1 },
                    { opt: option2, pos: 2 },
                    { opt: option3, pos: 3 },
                  ].map(({ opt, pos }) => {
                    if (!opt?.trim()) return null;
                    return (
                      <div
                        key={`option-pos-${pos}`}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt} id={`option-${pos}`} />
                        <Label htmlFor={`option-${pos}`} className="flex-1">
                          {opt}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg"
                data-ocid="match_word_question.error_state"
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
              data-ocid="match_word_question.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-ocid="match_word_question.submit_button"
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

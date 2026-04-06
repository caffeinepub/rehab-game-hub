import type { ExternalBlob, FindTheItemQuestion } from "@/backend";
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
import {
  useCreateFindTheItemQuestion,
  useUpdateFindTheItemQuestion,
} from "@/hooks/useQueries";
import { fileToExternalBlob } from "@/lib/externalBlob";
import { Loader2, Move, Plus, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

let draftIdCounter = 0;
const newDraftId = () => {
  draftIdCounter += 1;
  return `draft-${draftIdCounter}`;
};

interface ItemDraft {
  draftId: string;
  imageFile: File | null;
  imagePreview: string | null;
  existingBlob: ExternalBlob | null;
  itemLabel: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const makeDefaultItem = (): ItemDraft => ({
  draftId: newDraftId(),
  imageFile: null,
  imagePreview: null,
  existingBlob: null,
  itemLabel: "",
  x: 10,
  y: 10,
  width: 15,
  height: 15,
});

type DragType =
  | {
      kind: "move";
      startX: number;
      startY: number;
      origX: number;
      origY: number;
    }
  | {
      kind: "resize";
      corner: "tl" | "tr" | "bl" | "br";
      startX: number;
      startY: number;
      origX: number;
      origY: number;
      origW: number;
      origH: number;
    };

interface FindTheItemQuestionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  initialQuestion?: FindTheItemQuestion;
}

export default function FindTheItemQuestionEditorDialog({
  open,
  onOpenChange,
  gameId,
  initialQuestion,
}: FindTheItemQuestionEditorDialogProps) {
  const isEditMode = !!initialQuestion;
  const createMutation = useCreateFindTheItemQuestion();
  const updateMutation = useUpdateFindTheItemQuestion();

  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [existingBgBlob, setExistingBgBlob] = useState<ExternalBlob | null>(
    null,
  );
  const [items, setItems] = useState<ItemDraft[]>(() => [
    makeDefaultItem(),
    makeDefaultItem(),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    draftId: string;
    drag: DragType;
  } | null>(null);

  useEffect(() => {
    if (open) {
      if (initialQuestion) {
        setExistingBgBlob(initialQuestion.backgroundImage);
        setBgPreview(initialQuestion.backgroundImage.getDirectURL());
        setBgFile(null);
        const draftItems: ItemDraft[] = initialQuestion.items.map((item) => ({
          draftId: newDraftId(),
          imageFile: null,
          imagePreview: item.image.getDirectURL(),
          existingBlob: item.image,
          itemLabel: item.itemLabel,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
        }));
        setItems(
          draftItems.length >= 2
            ? draftItems
            : [...draftItems, makeDefaultItem()],
        );
      } else {
        setBgFile(null);
        setBgPreview(null);
        setExistingBgBlob(null);
        setItems([makeDefaultItem(), makeDefaultItem()]);
      }
      setSelectedDraftId(null);
      setError(null);
    }
  }, [open, initialQuestion]);

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgFile(file);
      setExistingBgBlob(null);
      const reader = new FileReader();
      reader.onloadend = () => setBgPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleItemImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          imageFile: file,
          imagePreview: reader.result as string,
          existingBlob: null,
        };
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const updateItem = (index: number, patch: Partial<ItemDraft>) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...patch };
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, makeDefaultItem()]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Drag logic ──────────────────────────────────────────────────────────────

  const getCanvasPercent = useCallback(
    (clientX: number, clientY: number): { px: number; py: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { px: 0, py: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        px: ((clientX - rect.left) / rect.width) * 100,
        py: ((clientY - rect.top) / rect.height) * 100,
      };
    },
    [],
  );

  const startMove = useCallback(
    (e: React.MouseEvent, draftId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedDraftId(draftId);
      const item = items.find((it) => it.draftId === draftId);
      if (!item) return;
      const { px, py } = getCanvasPercent(e.clientX, e.clientY);
      dragStateRef.current = {
        draftId,
        drag: {
          kind: "move",
          startX: px,
          startY: py,
          origX: item.x,
          origY: item.y,
        },
      };
    },
    [items, getCanvasPercent],
  );

  const startResize = useCallback(
    (
      e: React.MouseEvent,
      draftId: string,
      corner: "tl" | "tr" | "bl" | "br",
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedDraftId(draftId);
      const item = items.find((it) => it.draftId === draftId);
      if (!item) return;
      const { px, py } = getCanvasPercent(e.clientX, e.clientY);
      dragStateRef.current = {
        draftId,
        drag: {
          kind: "resize",
          corner,
          startX: px,
          startY: py,
          origX: item.x,
          origY: item.y,
          origW: item.width,
          origH: item.height,
        },
      };
    },
    [items, getCanvasPercent],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const state = dragStateRef.current;
      if (!state) return;
      const { px, py } = getCanvasPercent(e.clientX, e.clientY);
      const { draftId, drag } = state;

      setItems((prev) => {
        const idx = prev.findIndex((it) => it.draftId === draftId);
        if (idx === -1) return prev;
        const item = prev[idx];
        const updated = [...prev];
        const MIN = 5;

        if (drag.kind === "move") {
          const dx = px - drag.startX;
          const dy = py - drag.startY;
          const newX = Math.max(0, Math.min(100 - item.width, drag.origX + dx));
          const newY = Math.max(
            0,
            Math.min(100 - item.height, drag.origY + dy),
          );
          updated[idx] = { ...item, x: newX, y: newY };
        } else {
          const dx = px - drag.startX;
          const dy = py - drag.startY;
          let { origX: x, origY: y, origW: w, origH: h } = drag;

          if (drag.corner === "br") {
            w = Math.max(MIN, Math.min(100 - x, drag.origW + dx));
            h = Math.max(MIN, Math.min(100 - y, drag.origH + dy));
          } else if (drag.corner === "bl") {
            const newW = Math.max(MIN, drag.origW - dx);
            x = Math.max(0, drag.origX + drag.origW - newW);
            w = drag.origX + drag.origW - x;
            h = Math.max(MIN, Math.min(100 - y, drag.origH + dy));
          } else if (drag.corner === "tr") {
            w = Math.max(MIN, Math.min(100 - x, drag.origW + dx));
            const newH = Math.max(MIN, drag.origH - dy);
            y = Math.max(0, drag.origY + drag.origH - newH);
            h = drag.origY + drag.origH - y;
          } else {
            // tl
            const newW = Math.max(MIN, drag.origW - dx);
            x = Math.max(0, drag.origX + drag.origW - newW);
            w = drag.origX + drag.origW - x;
            const newH = Math.max(MIN, drag.origH - dy);
            y = Math.max(0, drag.origY + drag.origH - newH);
            h = drag.origY + drag.origH - y;
          }

          updated[idx] = { ...item, x, y, width: w, height: h };
        }

        return updated;
      });
    },
    [getCanvasPercent],
  );

  const handleMouseUp = useCallback(() => {
    dragStateRef.current = null;
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const hasBg = bgFile !== null || existingBgBlob !== null;
    if (!hasBg) {
      setError("Please upload a background/scene image");
      return;
    }

    if (items.length < 2) {
      setError("At least 2 items are required");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemLabel.trim()) {
        setError(`Item ${i + 1} needs a label`);
        return;
      }
      if (item.imageFile === null && item.existingBlob === null) {
        setError(`Item ${i + 1} needs an image`);
        return;
      }
    }

    try {
      let bgBlob: ExternalBlob;
      if (bgFile) {
        bgBlob = await fileToExternalBlob(bgFile);
      } else if (existingBgBlob) {
        bgBlob = existingBgBlob;
      } else {
        setError("Please upload a background image");
        return;
      }

      const resolvedItems = await Promise.all(
        items.map(async (item) => {
          let imageBlob: ExternalBlob;
          if (item.imageFile) {
            imageBlob = await fileToExternalBlob(item.imageFile);
          } else if (item.existingBlob) {
            imageBlob = item.existingBlob;
          } else {
            throw new Error("Missing item image");
          }
          return {
            image: imageBlob,
            itemLabel: item.itemLabel.trim(),
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
          };
        }),
      );

      if (isEditMode && initialQuestion) {
        await updateMutation.mutateAsync({
          gameId,
          questionId: initialQuestion.id,
          backgroundImage: bgBlob,
          items: resolvedItems,
        });
      } else {
        await createMutation.mutateAsync({
          gameId,
          backgroundImage: bgBlob,
          items: resolvedItems,
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
    setBgFile(null);
    setBgPreview(null);
    setExistingBgBlob(null);
    setItems([makeDefaultItem(), makeDefaultItem()]);
    setSelectedDraftId(null);
    setError(null);
    onOpenChange(false);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const canvasItems = items.filter((it) => it.imagePreview);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Scene Question" : "Create Scene Question"}
          </DialogTitle>
          <DialogDescription>
            Upload a background scene image and place items on it. Drag items to
            position them; drag a corner handle to resize.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Background Image */}
            <div className="space-y-2">
              <Label>Scene / Background Image *</Label>
              {bgPreview ? (
                <div className="relative">
                  <img
                    src={bgPreview}
                    alt="Background preview"
                    className="w-full h-40 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => {
                      setBgFile(null);
                      setBgPreview(null);
                      setExistingBgBlob(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <Label
                    htmlFor="bg-image"
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    Click to upload background image
                  </Label>
                  <Input
                    id="bg-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBgChange}
                    data-ocid="find_item_question.upload_button"
                  />
                </div>
              )}
            </div>

            {/* Interactive canvas */}
            {bgPreview && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {canvasItems.length > 0
                      ? "Drag items to position them · drag corners to resize · click to select"
                      : "Upload item images below — they will appear here for placement"}
                  </span>
                </div>
                <div
                  ref={canvasRef}
                  className="relative w-full rounded-lg overflow-hidden border-2 border-border select-none"
                  style={{ aspectRatio: "4/3", cursor: "default" }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  role="presentation"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSelectedDraftId(null);
                  }}
                  onClick={() => setSelectedDraftId(null)}
                  data-ocid="find_item_question.canvas_target"
                >
                  {/* Background */}
                  <img
                    src={bgPreview}
                    alt="Scene background"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* Overlay items */}
                  {items.map((item) => {
                    if (!item.imagePreview) return null;
                    const isSelected = selectedDraftId === item.draftId;
                    return (
                      <div
                        key={item.draftId}
                        className="absolute"
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          width: `${item.width}%`,
                          height: `${item.height}%`,
                          outline: isSelected
                            ? "2px solid oklch(0.7 0.2 250)"
                            : "1.5px dashed oklch(0.7 0.1 250 / 0.5)",
                          boxSizing: "border-box",
                          cursor: "move",
                        }}
                        onMouseDown={(e) => startMove(e, item.draftId)}
                        role="presentation"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            setSelectedDraftId(item.draftId);
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDraftId(item.draftId);
                        }}
                      >
                        <img
                          src={item.imagePreview}
                          alt={item.itemLabel || "item"}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />

                        {/* Label badge */}
                        {isSelected && item.itemLabel && (
                          <span
                            className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap shadow"
                            style={{ pointerEvents: "none" }}
                          >
                            {item.itemLabel}
                          </span>
                        )}

                        {/* Corner resize handles */}
                        {isSelected && (
                          <>
                            {/* Top-left */}
                            <div
                              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-nw-resize z-10"
                              onMouseDown={(e) =>
                                startResize(e, item.draftId, "tl")
                              }
                            />
                            {/* Top-right */}
                            <div
                              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-ne-resize z-10"
                              onMouseDown={(e) =>
                                startResize(e, item.draftId, "tr")
                              }
                            />
                            {/* Bottom-left */}
                            <div
                              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-sw-resize z-10"
                              onMouseDown={(e) =>
                                startResize(e, item.draftId, "bl")
                              }
                            />
                            {/* Bottom-right */}
                            <div
                              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-se-resize z-10"
                              onMouseDown={(e) =>
                                startResize(e, item.draftId, "br")
                              }
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Items (minimum 2) *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="gap-2"
                  data-ocid="find_item_question.secondary_button"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div
                  key={item.draftId}
                  className="border border-border rounded-lg p-4 space-y-4"
                  data-ocid={`find_item_question.item.${index + 1}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Item {index + 1}
                      {item.imagePreview && (
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (drag to reposition on the canvas above)
                        </span>
                      )}
                    </span>
                    {items.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        data-ocid={`find_item_question.delete_button.${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Item image upload */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Item Image (transparent PNG recommended)
                    </Label>
                    {item.imagePreview ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imagePreview}
                          alt={`Item ${index + 1}`}
                          className="h-20 w-20 object-contain rounded border border-border bg-muted"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateItem(index, {
                              imageFile: null,
                              imagePreview: null,
                              existingBlob: null,
                            })
                          }
                        >
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <Label
                          htmlFor={`item-image-${item.draftId}`}
                          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Upload className="h-6 w-6 mx-auto mb-1" />
                          Upload item image
                        </Label>
                        <Input
                          id={`item-image-${item.draftId}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleItemImageChange(index, e)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Item label */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`item-label-${item.draftId}`}
                      className="text-xs text-muted-foreground"
                    >
                      Item Label / Word *
                    </Label>
                    <Input
                      id={`item-label-${item.draftId}`}
                      placeholder="e.g. Knife, Apple, Book"
                      value={item.itemLabel}
                      onChange={(e) =>
                        updateItem(index, { itemLabel: e.target.value })
                      }
                      data-ocid="find_item_question.input"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg"
                data-ocid="find_item_question.error_state"
              >
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              disabled={isSubmitting}
              data-ocid="find_item_question.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-ocid="find_item_question.submit_button"
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

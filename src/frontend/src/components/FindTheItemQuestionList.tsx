import type { FindTheItemQuestion } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { blobToObjectURL } from "@/lib/externalBlob";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FindTheItemQuestionListProps {
  questions: FindTheItemQuestion[];
  onEdit: (question: FindTheItemQuestion) => void;
  onDelete: (questionId: string) => void;
}

interface ResolvedQuestion {
  id: string;
  backgroundUrl: string | null;
  itemCount: number;
  itemLabels: string[];
  original: FindTheItemQuestion;
}

export default function FindTheItemQuestionList({
  questions,
  onEdit,
  onDelete,
}: FindTheItemQuestionListProps) {
  const [resolved, setResolved] = useState<ResolvedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedRef = useRef<ResolvedQuestion[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await Promise.all(
        questions.map(async (q) => {
          try {
            const backgroundUrl = await blobToObjectURL(q.backgroundImage);
            return {
              id: q.id,
              backgroundUrl,
              itemCount: q.items.length,
              itemLabels: q.items.map((it) => it.itemLabel),
              original: q,
            };
          } catch {
            return {
              id: q.id,
              backgroundUrl: null,
              itemCount: q.items.length,
              itemLabels: q.items.map((it) => it.itemLabel),
              original: q,
            };
          }
        }),
      );
      resolvedRef.current = data;
      setResolved(data);
      setLoading(false);
    };

    load();

    return () => {
      for (const q of resolvedRef.current) {
        if (q.backgroundUrl) URL.revokeObjectURL(q.backgroundUrl);
      }
    };
  }, [questions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resolved.map((q, idx) => (
        <Card
          key={q.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
          data-ocid={`find_item_question.item.${idx + 1}`}
        >
          <div className="aspect-video w-full bg-muted relative overflow-hidden">
            {q.backgroundUrl ? (
              <img
                src={q.backgroundUrl}
                alt={`Scene ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Failed to load image
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 shadow-md"
                onClick={() => onEdit(q.original)}
                data-ocid={`find_item_question.edit_button.${idx + 1}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 shadow-md"
                onClick={() => onDelete(q.id)}
                data-ocid={`find_item_question.delete_button.${idx + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">
                {q.itemCount} item{q.itemCount !== 1 ? "s" : ""}
              </div>
              <ul className="space-y-1">
                {q.itemLabels.map((label) => (
                  <li
                    key={label}
                    className="text-sm px-2 py-1 rounded text-muted-foreground"
                  >
                    • {label}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

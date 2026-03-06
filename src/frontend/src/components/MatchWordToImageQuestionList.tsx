import type { MatchWordToImageQuestion } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { blobToObjectURL } from "@/lib/externalBlob";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MatchWordToImageQuestionListProps {
  questions: MatchWordToImageQuestion[];
  onEdit: (question: MatchWordToImageQuestion) => void;
}

interface QuestionWithURL extends MatchWordToImageQuestion {
  imageUrl: string | null;
}

export default function MatchWordToImageQuestionList({
  questions,
  onEdit,
}: MatchWordToImageQuestionListProps) {
  const [questionsWithUrls, setQuestionsWithUrls] = useState<QuestionWithURL[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const questionsWithUrlsRef = useRef<QuestionWithURL[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      const questionsWithImages = await Promise.all(
        questions.map(async (question) => {
          try {
            const imageUrl = await blobToObjectURL(question.image);
            return { ...question, imageUrl };
          } catch (error) {
            console.error(
              "Failed to load image for question:",
              question.id,
              error,
            );
            return { ...question, imageUrl: null };
          }
        }),
      );
      questionsWithUrlsRef.current = questionsWithImages;
      setQuestionsWithUrls(questionsWithImages);
      setLoading(false);
    };

    loadImages();

    // Cleanup URLs on unmount
    return () => {
      for (const q of questionsWithUrlsRef.current) {
        if (q.imageUrl) {
          URL.revokeObjectURL(q.imageUrl);
        }
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
      {questionsWithUrls.map((question, idx) => (
        <Card
          key={question.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
          data-ocid={`match_word_question.item.${idx + 1}`}
        >
          <div className="aspect-video w-full bg-muted relative overflow-hidden">
            {question.imageUrl ? (
              <img
                src={question.imageUrl}
                alt={`Question ${question.id}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Failed to load image
              </div>
            )}
            {/* Edit button — top-right corner of the image */}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 shadow-md"
              onClick={() => onEdit(question)}
              data-ocid={`match_word_question.edit_button.${idx + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">
                Options:
              </div>
              <ul className="space-y-1">
                {question.options.map((option) => (
                  <li
                    key={option}
                    className={`text-sm px-2 py-1 rounded ${
                      option === question.correctOption
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {option} {option === question.correctOption && "✓"}
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

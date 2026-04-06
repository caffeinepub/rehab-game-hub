import type { ChooseCorrectImageQuestion } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";

interface ChooseCorrectImageQuestionListProps {
  questions: ChooseCorrectImageQuestion[];
  onEdit: (question: ChooseCorrectImageQuestion) => void;
  onDelete: (questionId: string) => void;
}

export default function ChooseCorrectImageQuestionList({
  questions,
  onEdit,
  onDelete,
}: ChooseCorrectImageQuestionListProps) {
  return (
    <div className="space-y-6">
      {questions.map((question, idx) => {
        // Convert bigint to number for UI usage
        const correctIdx = Number(question.correctImageIndex);

        return (
          <Card
            key={question.id}
            className="p-6"
            data-ocid={`choose_image_question.item.${idx + 1}`}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Word: {question.word}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Question ID: {question.id} • {question.images.length} images
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onEdit(question)}
                  data-ocid={`choose_image_question.edit_button.${idx + 1}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onDelete(question.id)}
                  data-ocid={`choose_image_question.delete_button.${idx + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {question.images.map((image, index) => {
                const isCorrect = index === correctIdx;
                const imageUrl = image.getDirectURL();

                return (
                  <div key={imageUrl} className="relative">
                    <div
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        isCorrect
                          ? "border-green-600 ring-2 ring-green-600/20"
                          : "border-border"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${question.word} option ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isCorrect && (
                      <div className="absolute -top-2 -right-2 bg-green-600 rounded-full p-1">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      {isCorrect ? "Correct" : `Option ${index + 1}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

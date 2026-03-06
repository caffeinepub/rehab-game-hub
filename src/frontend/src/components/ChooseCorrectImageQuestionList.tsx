import type { ChooseCorrectImageQuestion } from "@/backend";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ChooseCorrectImageQuestionListProps {
  questions: ChooseCorrectImageQuestion[];
}

export default function ChooseCorrectImageQuestionList({
  questions,
}: ChooseCorrectImageQuestionListProps) {
  return (
    <div className="space-y-6">
      {questions.map((question) => {
        // Convert bigint to number for UI usage
        const correctIdx = Number(question.correctImageIndex);

        return (
          <Card key={question.id} className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Word: {question.word}
              </h3>
              <p className="text-sm text-muted-foreground">
                Question ID: {question.id} • {question.images.length} images
              </p>
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

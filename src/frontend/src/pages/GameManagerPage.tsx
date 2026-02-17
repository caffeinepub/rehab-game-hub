import { useGetAllQuestions } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { MATCH_WORD_TO_IMAGE_GAME_ID } from '@/lib/gameConstants';
import MatchWordToImageQuestionList from '@/components/MatchWordToImageQuestionList';
import MatchWordToImageQuestionEditorDialog from '@/components/MatchWordToImageQuestionEditorDialog';
import { useState } from 'react';

export default function GameManagerPage() {
  const { data: questions, isLoading, error } = useGetAllQuestions(MATCH_WORD_TO_IMAGE_GAME_ID);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleAddQuestion = () => {
    setEditorOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive font-medium">Failed to load questions</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Match Word to Image - Question Manager</h2>
          <p className="text-muted-foreground">Create and manage questions for the Match Word to Image game</p>
        </div>
        <Button onClick={handleAddQuestion} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add Question
        </Button>
      </div>

      {!questions || questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-muted/30 rounded-lg border-2 border-dashed border-border p-12">
          <div className="text-center max-w-md">
            <h3 className="text-xl font-semibold text-foreground mb-2">No questions created yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first question. Each question includes an image and three word options.
            </p>
            <Button onClick={handleAddQuestion} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create First Question
            </Button>
          </div>
        </div>
      ) : (
        <MatchWordToImageQuestionList questions={questions} />
      )}

      <MatchWordToImageQuestionEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        gameId={MATCH_WORD_TO_IMAGE_GAME_ID}
      />
    </div>
  );
}

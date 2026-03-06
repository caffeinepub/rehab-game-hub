import ChooseCorrectImageQuestionEditorDialog from "@/components/ChooseCorrectImageQuestionEditorDialog";
import ChooseCorrectImageQuestionList from "@/components/ChooseCorrectImageQuestionList";
import MatchWordToImageQuestionEditorDialog from "@/components/MatchWordToImageQuestionEditorDialog";
import MatchWordToImageQuestionList from "@/components/MatchWordToImageQuestionList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetAllChooseCorrectImageQuestions,
  useGetAllQuestions,
} from "@/hooks/useQueries";
import {
  CHOOSE_CORRECT_IMAGE_GAME_ID,
  MATCH_WORD_TO_IMAGE_GAME_ID,
} from "@/lib/gameConstants";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useState } from "react";

export default function GameManagerPage() {
  const {
    data: matchWordQuestions,
    isLoading: matchWordLoading,
    error: matchWordError,
  } = useGetAllQuestions(MATCH_WORD_TO_IMAGE_GAME_ID);
  const {
    data: chooseImageQuestions,
    isLoading: chooseImageLoading,
    error: chooseImageError,
  } = useGetAllChooseCorrectImageQuestions(CHOOSE_CORRECT_IMAGE_GAME_ID);

  const [matchWordEditorOpen, setMatchWordEditorOpen] = useState(false);
  const [chooseImageEditorOpen, setChooseImageEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("match-word");

  const isLoading = matchWordLoading || chooseImageLoading;
  const error = matchWordError || chooseImageError;

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
          <p className="text-destructive font-medium">
            Failed to load questions
          </p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Game Manager
        </h2>
        <p className="text-muted-foreground">
          Create and manage questions for your games
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="match-word">Match Word to Image</TabsTrigger>
          <TabsTrigger value="choose-image">Choose Correct Image</TabsTrigger>
        </TabsList>

        {/* Match Word to Image Tab */}
        <TabsContent value="match-word">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                Match Word to Image Questions
              </h3>
              <p className="text-sm text-muted-foreground">
                {matchWordQuestions?.length || 0} question
                {matchWordQuestions?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={() => setMatchWordEditorOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Question
            </Button>
          </div>

          {!matchWordQuestions || matchWordQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-muted/30 rounded-lg border-2 border-dashed border-border p-12">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No questions created yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first question. Each question
                  includes an image and three word options.
                </p>
                <Button
                  onClick={() => setMatchWordEditorOpen(true)}
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create First Question
                </Button>
              </div>
            </div>
          ) : (
            <MatchWordToImageQuestionList questions={matchWordQuestions} />
          )}
        </TabsContent>

        {/* Choose Correct Image Tab */}
        <TabsContent value="choose-image">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                Choose Correct Image Questions
              </h3>
              <p className="text-sm text-muted-foreground">
                {chooseImageQuestions?.length || 0} question
                {chooseImageQuestions?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={() => setChooseImageEditorOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Question
            </Button>
          </div>

          {!chooseImageQuestions || chooseImageQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-muted/30 rounded-lg border-2 border-dashed border-border p-12">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No questions created yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first question. Each question
                  includes a word and multiple image options.
                </p>
                <Button
                  onClick={() => setChooseImageEditorOpen(true)}
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create First Question
                </Button>
              </div>
            </div>
          ) : (
            <ChooseCorrectImageQuestionList questions={chooseImageQuestions} />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <MatchWordToImageQuestionEditorDialog
        open={matchWordEditorOpen}
        onOpenChange={setMatchWordEditorOpen}
        gameId={MATCH_WORD_TO_IMAGE_GAME_ID}
      />
      <ChooseCorrectImageQuestionEditorDialog
        open={chooseImageEditorOpen}
        onOpenChange={setChooseImageEditorOpen}
        gameId={CHOOSE_CORRECT_IMAGE_GAME_ID}
      />
    </div>
  );
}

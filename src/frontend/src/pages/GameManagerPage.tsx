import type {
  ChooseCorrectImageQuestion,
  FindTheItemQuestion,
  MatchWordToImageQuestion,
} from "@/backend";
import ChooseCorrectImageQuestionEditorDialog from "@/components/ChooseCorrectImageQuestionEditorDialog";
import ChooseCorrectImageQuestionList from "@/components/ChooseCorrectImageQuestionList";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import FindTheItemQuestionEditorDialog from "@/components/FindTheItemQuestionEditorDialog";
import FindTheItemQuestionList from "@/components/FindTheItemQuestionList";
import MatchWordToImageQuestionEditorDialog from "@/components/MatchWordToImageQuestionEditorDialog";
import MatchWordToImageQuestionList from "@/components/MatchWordToImageQuestionList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteChooseCorrectImageQuestion,
  useDeleteFindTheItemQuestion,
  useDeleteQuestion,
  useGetAllChooseCorrectImageQuestions,
  useGetAllFindTheItemQuestions,
  useGetAllQuestions,
} from "@/hooks/useQueries";
import {
  CHOOSE_CORRECT_IMAGE_GAME_ID,
  FIND_THE_ITEM_GAME_ID,
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
  const {
    data: findItemQuestions,
    isLoading: findItemLoading,
    error: findItemError,
  } = useGetAllFindTheItemQuestions(FIND_THE_ITEM_GAME_ID);

  const deleteMatchWord = useDeleteQuestion();
  const deleteChooseImage = useDeleteChooseCorrectImageQuestion();
  const deleteFindItem = useDeleteFindTheItemQuestion();

  const [matchWordEditorOpen, setMatchWordEditorOpen] = useState(false);
  const [chooseImageEditorOpen, setChooseImageEditorOpen] = useState(false);
  const [findItemEditorOpen, setFindItemEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("match-word");

  // Edit state
  const [editingMatchWordQuestion, setEditingMatchWordQuestion] =
    useState<MatchWordToImageQuestion | null>(null);
  const [editingChooseImageQuestion, setEditingChooseImageQuestion] =
    useState<ChooseCorrectImageQuestion | null>(null);
  const [editingFindItemQuestion, setEditingFindItemQuestion] =
    useState<FindTheItemQuestion | null>(null);

  // Delete confirmation state
  const [deletingQuestionId, setDeletingQuestionId] = useState<{
    type: "matchWord" | "chooseImage" | "findItem";
    id: string;
  } | null>(null);

  const handleEditMatchWord = (question: MatchWordToImageQuestion) => {
    setEditingMatchWordQuestion(question);
    setMatchWordEditorOpen(true);
  };

  const handleEditChooseImage = (question: ChooseCorrectImageQuestion) => {
    setEditingChooseImageQuestion(question);
    setChooseImageEditorOpen(true);
  };

  const handleEditFindItem = (question: FindTheItemQuestion) => {
    setEditingFindItemQuestion(question);
    setFindItemEditorOpen(true);
  };

  const handleMatchWordOpenChange = (open: boolean) => {
    setMatchWordEditorOpen(open);
    if (!open) setEditingMatchWordQuestion(null);
  };

  const handleChooseImageOpenChange = (open: boolean) => {
    setChooseImageEditorOpen(open);
    if (!open) setEditingChooseImageQuestion(null);
  };

  const handleFindItemOpenChange = (open: boolean) => {
    setFindItemEditorOpen(open);
    if (!open) setEditingFindItemQuestion(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuestionId) return;
    const { type, id } = deletingQuestionId;

    if (type === "matchWord") {
      await deleteMatchWord.mutateAsync({
        gameId: MATCH_WORD_TO_IMAGE_GAME_ID,
        questionId: id,
      });
    } else if (type === "chooseImage") {
      await deleteChooseImage.mutateAsync({
        gameId: CHOOSE_CORRECT_IMAGE_GAME_ID,
        questionId: id,
      });
    } else if (type === "findItem") {
      await deleteFindItem.mutateAsync({
        gameId: FIND_THE_ITEM_GAME_ID,
        questionId: id,
      });
    }

    setDeletingQuestionId(null);
  };

  const isDeleting =
    deleteMatchWord.isPending ||
    deleteChooseImage.isPending ||
    deleteFindItem.isPending;

  const isLoading = matchWordLoading || chooseImageLoading || findItemLoading;
  const error = matchWordError || chooseImageError || findItemError;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div
          className="flex flex-col items-center justify-center min-h-[400px] gap-4"
          data-ocid="manager.loading_state"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div
          className="flex flex-col items-center justify-center min-h-[400px] gap-4"
          data-ocid="manager.error_state"
        >
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
          <TabsTrigger value="match-word" data-ocid="manager.match_word.tab">
            Choose The Word
          </TabsTrigger>
          <TabsTrigger
            value="choose-image"
            data-ocid="manager.choose_image.tab"
          >
            Choose The Image
          </TabsTrigger>
          <TabsTrigger value="find-item" data-ocid="manager.find_item.tab">
            Find The Item
          </TabsTrigger>
        </TabsList>

        {/* Choose The Word Tab */}
        <TabsContent value="match-word">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                Choose The Word Questions
              </h3>
              <p className="text-sm text-muted-foreground">
                {matchWordQuestions?.length || 0} question
                {matchWordQuestions?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingMatchWordQuestion(null);
                setMatchWordEditorOpen(true);
              }}
              size="lg"
              className="gap-2"
              data-ocid="manager.match_word.open_modal_button"
            >
              <Plus className="h-5 w-5" />
              Add Question
            </Button>
          </div>

          {!matchWordQuestions || matchWordQuestions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-muted/30 rounded-lg border-2 border-dashed border-border p-12"
              data-ocid="manager.match_word.empty_state"
            >
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No questions created yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first question. Each question
                  includes an image and word options.
                </p>
                <Button
                  onClick={() => {
                    setEditingMatchWordQuestion(null);
                    setMatchWordEditorOpen(true);
                  }}
                  size="lg"
                  className="gap-2"
                  data-ocid="manager.match_word.primary_button"
                >
                  <Plus className="h-5 w-5" />
                  Create First Question
                </Button>
              </div>
            </div>
          ) : (
            <MatchWordToImageQuestionList
              questions={matchWordQuestions}
              onEdit={handleEditMatchWord}
              onDelete={(id) =>
                setDeletingQuestionId({ type: "matchWord", id })
              }
            />
          )}
        </TabsContent>

        {/* Choose The Image Tab */}
        <TabsContent value="choose-image">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                Choose The Image Questions
              </h3>
              <p className="text-sm text-muted-foreground">
                {chooseImageQuestions?.length || 0} question
                {chooseImageQuestions?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingChooseImageQuestion(null);
                setChooseImageEditorOpen(true);
              }}
              size="lg"
              className="gap-2"
              data-ocid="manager.choose_image.open_modal_button"
            >
              <Plus className="h-5 w-5" />
              Add Question
            </Button>
          </div>

          {!chooseImageQuestions || chooseImageQuestions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-muted/30 rounded-lg border-2 border-dashed border-border p-12"
              data-ocid="manager.choose_image.empty_state"
            >
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No questions created yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first question. Each question
                  includes a word and multiple image options.
                </p>
                <Button
                  onClick={() => {
                    setEditingChooseImageQuestion(null);
                    setChooseImageEditorOpen(true);
                  }}
                  size="lg"
                  className="gap-2"
                  data-ocid="manager.choose_image.primary_button"
                >
                  <Plus className="h-5 w-5" />
                  Create First Question
                </Button>
              </div>
            </div>
          ) : (
            <ChooseCorrectImageQuestionList
              questions={chooseImageQuestions}
              onEdit={handleEditChooseImage}
              onDelete={(id) =>
                setDeletingQuestionId({ type: "chooseImage", id })
              }
            />
          )}
        </TabsContent>

        {/* Find The Item Tab */}
        <TabsContent value="find-item">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                Find The Item Questions
              </h3>
              <p className="text-sm text-muted-foreground">
                {findItemQuestions?.length || 0} question
                {findItemQuestions?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingFindItemQuestion(null);
                setFindItemEditorOpen(true);
              }}
              size="lg"
              className="gap-2"
              data-ocid="manager.find_item.open_modal_button"
            >
              <Plus className="h-5 w-5" />
              Add Question
            </Button>
          </div>

          {!findItemQuestions || findItemQuestions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-muted/30 rounded-lg border-2 border-dashed border-border p-12"
              data-ocid="manager.find_item.empty_state"
            >
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No questions created yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first question. Each question
                  includes a scene background and placed item images.
                </p>
                <Button
                  onClick={() => {
                    setEditingFindItemQuestion(null);
                    setFindItemEditorOpen(true);
                  }}
                  size="lg"
                  className="gap-2"
                  data-ocid="manager.find_item.primary_button"
                >
                  <Plus className="h-5 w-5" />
                  Create First Question
                </Button>
              </div>
            </div>
          ) : (
            <FindTheItemQuestionList
              questions={findItemQuestions}
              onEdit={handleEditFindItem}
              onDelete={(id) => setDeletingQuestionId({ type: "findItem", id })}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <MatchWordToImageQuestionEditorDialog
        open={matchWordEditorOpen}
        onOpenChange={handleMatchWordOpenChange}
        gameId={MATCH_WORD_TO_IMAGE_GAME_ID}
        initialQuestion={editingMatchWordQuestion ?? undefined}
      />
      <ChooseCorrectImageQuestionEditorDialog
        open={chooseImageEditorOpen}
        onOpenChange={handleChooseImageOpenChange}
        gameId={CHOOSE_CORRECT_IMAGE_GAME_ID}
        initialQuestion={editingChooseImageQuestion ?? undefined}
      />
      <FindTheItemQuestionEditorDialog
        open={findItemEditorOpen}
        onOpenChange={handleFindItemOpenChange}
        gameId={FIND_THE_ITEM_GAME_ID}
        initialQuestion={editingFindItemQuestion ?? undefined}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDeleteDialog
        open={!!deletingQuestionId}
        onOpenChange={(open) => {
          if (!open) setDeletingQuestionId(null);
        }}
        onConfirm={handleConfirmDelete}
        gameName="this question"
        isDeleting={isDeleting}
      />
    </div>
  );
}

import type { FindTheItemQuestion } from "@/backend";
import { Card } from "@/components/ui/card";
import { useGameSounds } from "@/hooks/useGameSounds";
import { blobToObjectURL } from "@/lib/externalBlob";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  Save,
  Trophy,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FindTheItemGameProps {
  questions: FindTheItemQuestion[];
  gameName: string;
  onGameComplete?: (
    correct: number,
    wrong: number,
    durationSeconds: number,
  ) => void;
  showSavePrompt?: boolean;
  onSignIn?: () => void;
  scoreSaved?: boolean;
  onPlayAgain?: () => void;
}

type ItemState = "idle" | "correct" | "incorrect";

interface ResolvedQuestion {
  id: string;
  backgroundUrl: string;
  items: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    itemLabel: string;
    imageUrl: string;
  }>;
  targetItemIndex: number;
}

export default function FindTheItemGame({
  questions,
  gameName,
  onGameComplete,
  showSavePrompt,
  onSignIn,
  scoreSaved,
  onPlayAgain,
}: FindTheItemGameProps) {
  const [resolvedQuestions, setResolvedQuestions] = useState<
    ResolvedQuestion[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [itemStates, setItemStates] = useState<ItemState[]>([]);
  const [canProceed, setCanProceed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const resetTimeoutRef = useRef<number | null>(null);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);
  const resolvedQuestionsRef = useRef<ResolvedQuestion[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const { playWrong, playCorrect } = useGameSounds();

  useEffect(() => {
    const initializeGame = async () => {
      setLoading(true);
      startTimeRef.current = Date.now();

      // Sort by item count ascending (easiest first)
      const sorted = [...questions].sort(
        (a, b) => a.items.length - b.items.length,
      );

      const resolved = await Promise.all(
        sorted.map(async (question) => {
          const backgroundUrl = await blobToObjectURL(question.backgroundImage);
          const items = await Promise.all(
            question.items.map(async (item) => {
              const imageUrl = await blobToObjectURL(item.image);
              return {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                itemLabel: item.itemLabel,
                imageUrl,
              };
            }),
          );

          // Random target item
          const targetItemIndex = Math.floor(Math.random() * items.length);

          return {
            id: question.id,
            backgroundUrl,
            items,
            targetItemIndex,
          };
        }),
      );

      resolvedQuestionsRef.current = resolved;
      setResolvedQuestions(resolved);
      setLoading(false);
    };

    initializeGame();

    return () => {
      for (const q of resolvedQuestionsRef.current) {
        URL.revokeObjectURL(q.backgroundUrl);
        for (const item of q.items) {
          URL.revokeObjectURL(item.imageUrl);
        }
      }
    };
  }, [questions]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current);
      }
      if (autoAdvanceTimeoutRef.current !== null) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  // Speak target word when question changes
  useEffect(() => {
    if (resolvedQuestions.length === 0 || loading) return;
    const currentQ = resolvedQuestions[currentQuestionIndex];
    if (!currentQ) return;
    const targetLabel = currentQ.items[currentQ.targetItemIndex]?.itemLabel;
    if (targetLabel) {
      speakWord(targetLabel);
    }
    setItemStates(Array(currentQ.items.length).fill("idle"));
    setCanProceed(false);
  }, [currentQuestionIndex, resolvedQuestions, loading]);

  const speakWord = (word: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const currentQuestion = resolvedQuestions[currentQuestionIndex];

  const advanceToNext = (currentScore: number, currentWrong: number) => {
    if (currentQuestionIndex < resolvedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCanProceed(false);
    } else {
      setGameComplete(true);
      const durationSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000,
      );
      onGameComplete?.(currentScore, currentWrong, durationSeconds);
    }
  };

  const handleItemClick = (index: number) => {
    if (canProceed) return;

    const newStates: ItemState[] = [
      ...(itemStates.length > 0
        ? itemStates
        : Array(currentQuestion.items.length).fill("idle")),
    ];

    if (index === currentQuestion.targetItemIndex) {
      newStates[index] = "correct";
      setItemStates(newStates);
      setCanProceed(true);
      const newScore = score + 1;
      setScore(newScore);
      playCorrect();
      autoAdvanceTimeoutRef.current = window.setTimeout(() => {
        advanceToNext(newScore, wrongAttempts);
        autoAdvanceTimeoutRef.current = null;
      }, 2500);
    } else {
      newStates[index] = "incorrect";
      setItemStates(newStates);
      const newWrong = wrongAttempts + 1;
      setWrongAttempts(newWrong);
      playWrong();
      resetTimeoutRef.current = window.setTimeout(() => {
        setItemStates((prev) => {
          const reset = [...prev];
          reset[index] = "idle";
          return reset;
        });
        resetTimeoutRef.current = null;
      }, 800);
    }
  };

  const handleRestart = () => {
    if (onPlayAgain) {
      onPlayAgain();
      return;
    }
    setCurrentQuestionIndex(0);
    setItemStates([]);
    setCanProceed(false);
    setGameComplete(false);
    setScore(0);
    setWrongAttempts(0);
    startTimeRef.current = Date.now();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  const totalQuestions = resolvedQuestions.length;

  if (gameComplete) {
    return (
      <div
        className="max-w-2xl mx-auto space-y-4"
        data-ocid="find-item.results.panel"
      >
        <Card className="p-12 text-center">
          <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Game Complete!
          </h2>
          <p className="text-lg text-muted-foreground mb-6">{gameName}</p>

          <div className="mb-8">
            <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Session Results
            </p>
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <span className="text-5xl font-bold text-green-600">
                    {score}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  Correct
                </span>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <span className="text-5xl font-bold text-red-500">
                    {wrongAttempts}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  Wrong
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {totalQuestions} questions completed
            </p>
          </div>

          {scoreSaved && (
            <div
              className="flex items-center justify-center gap-2 mb-4 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg px-4 py-2"
              data-ocid="find-item.results.success_state"
            >
              <Save className="h-4 w-4" />
              Score saved to your profile!
            </div>
          )}

          <button
            type="button"
            onClick={handleRestart}
            data-ocid="find-item.results.primary_button"
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Play Again
          </button>
        </Card>

        {showSavePrompt && !scoreSaved && (
          <Card className="p-6" data-ocid="find-item.signin.card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground text-sm">
                  Want to track your progress?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sign in to save your score and see improvements over time.
                </p>
              </div>
              <button
                type="button"
                onClick={onSignIn}
                data-ocid="find-item.signin.button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (!currentQuestion) return null;

  const targetLabel =
    currentQuestion.items[currentQuestion.targetItemIndex]?.itemLabel ?? "";

  return (
    <div className="max-w-[1075px] mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{gameName}</h1>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {resolvedQuestions.length}
        </div>
      </div>

      {/* Target word prompt */}
      <div className="mb-4 text-center">
        <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
          Find this item:
        </p>
        <h2 className="text-4xl font-bold text-foreground">{targetLabel}</h2>
      </div>

      <Card className="overflow-hidden">
        {/* Scene with items */}
        <div
          className="relative w-full bg-muted overflow-hidden"
          style={{ aspectRatio: "4/3" }}
        >
          {/* Background */}
          <img
            src={currentQuestion.backgroundUrl}
            alt="Scene"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Placed items */}
          {currentQuestion.items.map((item, index) => {
            const state = itemStates[index] ?? "idle";
            const isCorrect = state === "correct";
            const isIncorrect = state === "incorrect";

            return (
              <button
                key={`${currentQuestion.id}-item-${index}`}
                type="button"
                onClick={() => handleItemClick(index)}
                disabled={canProceed}
                data-ocid={`find-item.item.${index + 1}`}
                className="absolute p-0 border-0 bg-transparent cursor-pointer focus:outline-none"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.width}%`,
                  height: `${item.height}%`,
                }}
              >
                <div
                  className="relative w-full h-full"
                  style={{
                    filter: isCorrect
                      ? "drop-shadow(0 0 8px rgb(34 197 94)) drop-shadow(0 0 16px rgb(34 197 94))"
                      : isIncorrect
                        ? "drop-shadow(0 0 8px rgb(239 68 68))"
                        : undefined,
                    animation: isIncorrect
                      ? "shake 0.4s ease-in-out"
                      : undefined,
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.itemLabel}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                  {isIncorrect && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <XCircle className="text-red-500 w-1/3 h-1/3 drop-shadow-lg" />
                    </div>
                  )}
                  {isCorrect && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 className="text-green-500 w-1/3 h-1/3 drop-shadow-lg" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

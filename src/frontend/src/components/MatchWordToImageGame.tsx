import type { MatchWordToImageQuestion } from "@/backend";
import { Card } from "@/components/ui/card";
import { useGameSounds } from "@/hooks/useGameSounds";
import { blobToObjectURL } from "@/lib/externalBlob";
import { shuffleArray, shuffleOptions } from "@/lib/shuffle";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  Save,
  Trophy,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MatchWordToImageGameProps {
  questions: MatchWordToImageQuestion[];
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

interface ShuffledQuestion {
  id: string;
  imageUrl: string;
  options: string[];
  correctIndex: number;
}

type OptionState = "idle" | "correct" | "incorrect";

export default function MatchWordToImageGame({
  questions,
  gameName,
  onGameComplete,
  showSavePrompt,
  onSignIn,
  scoreSaved,
  onPlayAgain,
}: MatchWordToImageGameProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<
    ShuffledQuestion[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [optionStates, setOptionStates] = useState<OptionState[]>([]);
  const [canProceed, setCanProceed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const resetTimeoutRef = useRef<number | null>(null);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);
  const shuffledQuestionsRef = useRef<ShuffledQuestion[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const { playWrong } = useGameSounds();

  // Initialize and shuffle questions on mount
  useEffect(() => {
    const initializeGame = async () => {
      setLoading(true);
      startTimeRef.current = Date.now();

      const shuffled = shuffleArray(questions);

      const processedQuestions = await Promise.all(
        shuffled.map(async (question) => {
          const imageUrl = await blobToObjectURL(question.image);
          const { shuffledOptions, correctIndex } = shuffleOptions(
            question.options,
            question.correctOption,
          );

          return {
            id: question.id,
            imageUrl,
            options: shuffledOptions,
            correctIndex,
          };
        }),
      );

      shuffledQuestionsRef.current = processedQuestions;
      setShuffledQuestions(processedQuestions);
      setLoading(false);
    };

    initializeGame();

    return () => {
      for (const q of shuffledQuestionsRef.current) {
        if (q.imageUrl) {
          URL.revokeObjectURL(q.imageUrl);
        }
      }
    };
  }, [questions]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
      if (autoAdvanceTimeoutRef.current !== null) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
    };
  }, []);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const speakWord = (word: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const advanceToNext = (currentScore: number, currentWrong: number) => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setOptionStates([]);
      setCanProceed(false);
    } else {
      setGameComplete(true);
      const durationSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000,
      );
      onGameComplete?.(currentScore, currentWrong, durationSeconds);
    }
  };

  const handleOptionClick = (index: number) => {
    if (canProceed || selectedOption !== null) return;

    setSelectedOption(index);
    const newStates: OptionState[] = Array(currentQuestion.options.length).fill(
      "idle",
    );

    if (index === currentQuestion.correctIndex) {
      newStates[index] = "correct";
      setCanProceed(true);
      const newScore = score + 1;
      setScore(newScore);
      speakWord(currentQuestion.options[index]);
      autoAdvanceTimeoutRef.current = window.setTimeout(() => {
        advanceToNext(newScore, wrongAttempts);
        autoAdvanceTimeoutRef.current = null;
      }, 3000);
    } else {
      newStates[index] = "incorrect";
      const newWrong = wrongAttempts + 1;
      setWrongAttempts(newWrong);
      playWrong();
      resetTimeoutRef.current = window.setTimeout(() => {
        setSelectedOption(null);
        setOptionStates(Array(currentQuestion.options.length).fill("idle"));
        resetTimeoutRef.current = null;
      }, 800);
    }

    setOptionStates(newStates);
  };

  const handleRestart = () => {
    if (onPlayAgain) {
      onPlayAgain();
      return;
    }
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setOptionStates([]);
    setCanProceed(false);
    setGameComplete(false);
    setScore(0);
    setWrongAttempts(0);
    startTimeRef.current = Date.now();

    const reshuffled = shuffleArray(shuffledQuestions);
    setShuffledQuestions(reshuffled);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  const totalQuestions = shuffledQuestions.length;

  if (gameComplete) {
    return (
      <div
        className="max-w-2xl mx-auto space-y-4"
        data-ocid="match-word.results.panel"
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
              data-ocid="match-word.results.success_state"
            >
              <Save className="h-4 w-4" />
              Score saved to your profile!
            </div>
          )}

          <button
            type="button"
            onClick={handleRestart}
            data-ocid="match-word.results.primary_button"
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Play Again
          </button>
        </Card>

        {showSavePrompt && !scoreSaved && (
          <Card className="p-6" data-ocid="match-word.signin.card">
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
                data-ocid="match-word.signin.button"
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{gameName}</h1>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="aspect-video w-full bg-muted relative overflow-hidden">
          <img
            src={currentQuestion.imageUrl}
            alt="Question"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-8">
          <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
            Select the correct word for this image:
          </h3>
          <div
            className={`grid grid-cols-1 gap-3 mb-6 ${
              currentQuestion.options.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-3"
            }`}
          >
            {currentQuestion.options.map((option, index) => {
              const state = optionStates[index] ?? "idle";

              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => handleOptionClick(index)}
                  disabled={canProceed || selectedOption !== null}
                  data-ocid={`match-word.option.${index + 1}`}
                  className={`relative text-5xl h-auto py-6 px-8 rounded-md border-2 transition-all font-medium ${
                    state === "correct"
                      ? "border-green-600 bg-green-600 text-white ring-4 ring-green-600/20"
                      : state === "incorrect"
                        ? "border-red-600 ring-4 ring-red-600/20"
                        : "border-border bg-background hover:border-primary hover:bg-accent"
                  } ${canProceed || selectedOption !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {option}
                    {state === "correct" && (
                      <CheckCircle2 className="h-6 w-6" />
                    )}
                  </span>
                  {state === "incorrect" && (
                    <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center rounded-md">
                      <XCircle className="h-16 w-16 text-red-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

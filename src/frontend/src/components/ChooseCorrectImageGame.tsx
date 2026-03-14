import type { ChooseCorrectImageQuestion } from "@/backend";
import { Card } from "@/components/ui/card";
import { useGameSounds } from "@/hooks/useGameSounds";
import { shuffleArray } from "@/lib/shuffle";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  Save,
  Trophy,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChooseCorrectImageGameProps {
  questions: ChooseCorrectImageQuestion[];
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
  word: string;
  imageUrls: string[];
  correctIndex: number;
}

type ImageState = "idle" | "correct" | "incorrect";

export default function ChooseCorrectImageGame({
  questions,
  gameName,
  onGameComplete,
  showSavePrompt,
  onSignIn,
  scoreSaved,
  onPlayAgain,
}: ChooseCorrectImageGameProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<
    ShuffledQuestion[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [imageStates, setImageStates] = useState<ImageState[]>([]);
  const [canProceed, setCanProceed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const { playCorrect, playWrong } = useGameSounds();

  // Initialize and shuffle questions on mount
  useEffect(() => {
    const initializeGame = async () => {
      setLoading(true);
      startTimeRef.current = Date.now();

      const shuffled = shuffleArray(questions);

      const processedQuestions = shuffled.map((question) => {
        const imageUrls = question.images.map((img) => img.getDirectURL());
        const correctIdx = Number(question.correctImageIndex);
        const indices = Array.from({ length: imageUrls.length }, (_, i) => i);
        const shuffledIndices = shuffleArray(indices);
        const shuffledImageUrls = shuffledIndices.map((i) => imageUrls[i]);
        const newCorrectIndex = shuffledIndices.indexOf(correctIdx);

        return {
          id: question.id,
          word: question.word,
          imageUrls: shuffledImageUrls,
          correctIndex: newCorrectIndex,
        };
      });

      setShuffledQuestions(processedQuestions);
      setLoading(false);
    };

    initializeGame();
  }, [questions]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current !== null) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
    };
  }, []);

  const speakWord = useCallback((word: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (
      shuffledQuestions.length > 0 &&
      shuffledQuestions[currentQuestionIndex]
    ) {
      const imageCount =
        shuffledQuestions[currentQuestionIndex].imageUrls.length;
      setImageStates(Array(imageCount).fill("idle"));
      speakWord(shuffledQuestions[currentQuestionIndex].word);
    }
  }, [currentQuestionIndex, shuffledQuestions, speakWord]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const advanceToNext = (currentScore: number, currentWrong: number) => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedImage(null);
      setCanProceed(false);
    } else {
      setGameComplete(true);
      const durationSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000,
      );
      onGameComplete?.(currentScore, currentWrong, durationSeconds);
    }
  };

  const handleImageClick = (index: number) => {
    if (canProceed || selectedImage !== null) return;

    setSelectedImage(index);
    const newStates: ImageState[] = Array(
      currentQuestion.imageUrls.length,
    ).fill("idle");

    if (index === currentQuestion.correctIndex) {
      newStates[index] = "correct";
      setCanProceed(true);
      const newScore = score + 1;
      setScore(newScore);
      playCorrect();
      autoAdvanceTimeoutRef.current = window.setTimeout(() => {
        advanceToNext(newScore, wrongAttempts);
        autoAdvanceTimeoutRef.current = null;
      }, 3000);
    } else {
      newStates[index] = "incorrect";
      const newWrong = wrongAttempts + 1;
      setWrongAttempts(newWrong);
      playWrong();
      setTimeout(() => {
        setSelectedImage(null);
        setImageStates(Array(currentQuestion.imageUrls.length).fill("idle"));
      }, 800);
    }

    setImageStates(newStates);
  };

  const handleRestart = () => {
    if (onPlayAgain) {
      onPlayAgain();
      return;
    }
    const shuffled = shuffleArray(questions);
    const processedQuestions = shuffled.map((question) => {
      const imageUrls = question.images.map((img) => img.getDirectURL());
      const correctIdx = Number(question.correctImageIndex);
      const indices = Array.from({ length: imageUrls.length }, (_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      const shuffledImageUrls = shuffledIndices.map((i) => imageUrls[i]);
      const newCorrectIndex = shuffledIndices.indexOf(correctIdx);

      return {
        id: question.id,
        word: question.word,
        imageUrls: shuffledImageUrls,
        correctIndex: newCorrectIndex,
      };
    });

    setShuffledQuestions(processedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedImage(null);
    setCanProceed(false);
    setGameComplete(false);
    setScore(0);
    setWrongAttempts(0);
    startTimeRef.current = Date.now();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (shuffledQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No questions available for this game.
          </p>
        </Card>
      </div>
    );
  }

  const totalQuestions = shuffledQuestions.length;

  if (gameComplete) {
    return (
      <div
        className="max-w-2xl mx-auto space-y-4"
        data-ocid="choose-image.results.panel"
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
              data-ocid="choose-image.results.success_state"
            >
              <Save className="h-4 w-4" />
              Score saved to your profile!
            </div>
          )}

          <button
            type="button"
            onClick={handleRestart}
            data-ocid="choose-image.results.primary_button"
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Play Again
          </button>
        </Card>

        {showSavePrompt && !scoreSaved && (
          <Card className="p-6" data-ocid="choose-image.signin.card">
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
                data-ocid="choose-image.signin.button"
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
      <Card className="p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(
                (currentQuestionIndex / shuffledQuestions.length) * 100,
              )}
              % Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentQuestionIndex / shuffledQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            {currentQuestion.word}
          </h2>
          <p className="text-muted-foreground">Choose the correct image</p>
        </div>

        <div
          className={`grid gap-4 mb-8 ${
            currentQuestion.imageUrls.length <= 2
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {currentQuestion.imageUrls.map((imageUrl, index) => {
            const state = imageStates[index];
            return (
              <button
                type="button"
                key={imageUrl}
                onClick={() => handleImageClick(index)}
                disabled={canProceed || selectedImage !== null}
                data-ocid={`choose-image.option.${index + 1}`}
                className={`relative aspect-square rounded-lg overflow-hidden border-4 transition-all ${
                  state === "correct"
                    ? "border-green-600 ring-4 ring-green-600/20"
                    : state === "incorrect"
                      ? "border-red-600 ring-4 ring-red-600/20"
                      : "border-border hover:border-primary hover:scale-105"
                } ${canProceed || selectedImage !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <img
                  src={imageUrl}
                  alt={`Option ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {state === "correct" && (
                  <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                )}
                {state === "incorrect" && (
                  <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                    <XCircle className="h-16 w-16 text-red-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

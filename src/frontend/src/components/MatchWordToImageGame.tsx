import { useState, useEffect } from 'react';
import type { MatchWordToImageQuestion } from '@/backend';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { blobToObjectURL } from '@/lib/externalBlob';
import { shuffleArray, shuffleOptions } from '@/lib/shuffle';

interface MatchWordToImageGameProps {
  questions: MatchWordToImageQuestion[];
  gameName: string;
}

interface ShuffledQuestion {
  id: string;
  imageUrl: string;
  options: string[];
  correctIndex: number;
}

type OptionState = 'idle' | 'correct' | 'incorrect';

export default function MatchWordToImageGame({ questions, gameName }: MatchWordToImageGameProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [optionStates, setOptionStates] = useState<OptionState[]>(['idle', 'idle', 'idle']);
  const [canProceed, setCanProceed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize and shuffle questions on mount
  useEffect(() => {
    const initializeGame = async () => {
      setLoading(true);
      
      // Shuffle question order
      const shuffled = shuffleArray(questions);
      
      // Load images and shuffle options for each question
      const processedQuestions = await Promise.all(
        shuffled.map(async (question) => {
          const imageUrl = await blobToObjectURL(question.image);
          const { shuffledOptions, correctIndex } = shuffleOptions(
            question.options,
            question.correctOption
          );
          
          return {
            id: question.id,
            imageUrl,
            options: shuffledOptions,
            correctIndex,
          };
        })
      );
      
      setShuffledQuestions(processedQuestions);
      setLoading(false);
    };

    initializeGame();

    // Cleanup URLs on unmount
    return () => {
      shuffledQuestions.forEach((q) => {
        if (q.imageUrl) {
          URL.revokeObjectURL(q.imageUrl);
        }
      });
    };
  }, [questions]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const handleOptionClick = (index: number) => {
    if (canProceed || selectedOption !== null) return;

    setSelectedOption(index);
    const newStates: OptionState[] = ['idle', 'idle', 'idle'];

    if (index === currentQuestion.correctIndex) {
      newStates[index] = 'correct';
      setCanProceed(true);
    } else {
      newStates[index] = 'incorrect';
    }

    setOptionStates(newStates);
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setOptionStates(['idle', 'idle', 'idle']);
      setCanProceed(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setOptionStates(['idle', 'idle', 'idle']);
    setCanProceed(false);
    setGameComplete(false);
    
    // Re-shuffle questions
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

  if (gameComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-12 text-center">
          <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Congratulations!</h2>
          <p className="text-lg text-muted-foreground mb-8">
            You've completed all {shuffledQuestions.length} questions in {gameName}!
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={handleRestart}>
              Play Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{gameName}</h1>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Image Display */}
        <div className="aspect-video w-full bg-muted relative overflow-hidden">
          <img
            src={currentQuestion.imageUrl}
            alt="Question"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Options */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
            Select the correct word for this image:
          </h3>
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              const state = optionStates[index];
              const isSelected = selectedOption === index;
              
              return (
                <Button
                  key={index}
                  variant={state === 'idle' ? 'outline' : state === 'correct' ? 'default' : 'destructive'}
                  size="lg"
                  className={`w-full text-lg h-auto py-4 justify-between ${
                    state === 'correct' ? 'bg-green-600 hover:bg-green-700' : ''
                  } ${state === 'incorrect' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  onClick={() => handleOptionClick(index)}
                  disabled={canProceed || selectedOption !== null}
                >
                  <span>{option}</span>
                  {state === 'correct' && <CheckCircle2 className="h-6 w-6" />}
                  {state === 'incorrect' && <XCircle className="h-6 w-6" />}
                </Button>
              );
            })}
          </div>

          {/* Next Button */}
          {canProceed && (
            <Button
              size="lg"
              className="w-full"
              onClick={handleNext}
            >
              {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'Finish'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

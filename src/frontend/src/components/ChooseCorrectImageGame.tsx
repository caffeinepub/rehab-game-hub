import { useState, useEffect } from 'react';
import type { ChooseCorrectImageQuestion } from '@/backend';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { shuffleArray } from '@/lib/shuffle';

interface ChooseCorrectImageGameProps {
  questions: ChooseCorrectImageQuestion[];
  gameName: string;
}

interface ShuffledQuestion {
  id: string;
  word: string;
  imageUrls: string[];
  correctIndex: number;
}

type ImageState = 'idle' | 'correct' | 'incorrect';

export default function ChooseCorrectImageGame({ questions, gameName }: ChooseCorrectImageGameProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [imageStates, setImageStates] = useState<ImageState[]>([]);
  const [canProceed, setCanProceed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize and shuffle questions on mount
  useEffect(() => {
    const initializeGame = async () => {
      setLoading(true);
      
      // Shuffle question order
      const shuffled = shuffleArray(questions);
      
      // Process each question: get direct URLs for images and shuffle them
      const processedQuestions = shuffled.map((question) => {
        const imageUrls = question.images.map(img => img.getDirectURL());
        
        // Convert bigint to number for correct index
        const correctIdx = Number(question.correctImageIndex);
        
        // Create array of indices and shuffle them
        const indices = Array.from({ length: imageUrls.length }, (_, i) => i);
        const shuffledIndices = shuffleArray(indices);
        
        // Reorder images according to shuffled indices
        const shuffledImageUrls = shuffledIndices.map(i => imageUrls[i]);
        
        // Find new position of correct image
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

  // Initialize image states when question changes
  useEffect(() => {
    if (shuffledQuestions.length > 0 && shuffledQuestions[currentQuestionIndex]) {
      const imageCount = shuffledQuestions[currentQuestionIndex].imageUrls.length;
      setImageStates(Array(imageCount).fill('idle'));
    }
  }, [currentQuestionIndex, shuffledQuestions]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const handleImageClick = (index: number) => {
    if (canProceed || selectedImage !== null) return;

    setSelectedImage(index);
    const newStates: ImageState[] = Array(currentQuestion.imageUrls.length).fill('idle');

    if (index === currentQuestion.correctIndex) {
      newStates[index] = 'correct';
      setCanProceed(true);
    } else {
      newStates[index] = 'incorrect';
      // Allow unlimited retries - reset after a short delay
      setTimeout(() => {
        setSelectedImage(null);
        setImageStates(Array(currentQuestion.imageUrls.length).fill('idle'));
      }, 800);
    }

    setImageStates(newStates);
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedImage(null);
      setCanProceed(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleRestart = () => {
    // Reshuffle questions from the original list
    const shuffled = shuffleArray(questions);
    const processedQuestions = shuffled.map((question) => {
      const imageUrls = question.images.map(img => img.getDirectURL());
      const correctIdx = Number(question.correctImageIndex);
      const indices = Array.from({ length: imageUrls.length }, (_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      const shuffledImageUrls = shuffledIndices.map(i => imageUrls[i]);
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
          <p className="text-muted-foreground">No questions available for this game.</p>
        </Card>
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
          <Button size="lg" onClick={handleRestart}>
            Play Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(((currentQuestionIndex) / shuffledQuestions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex) / shuffledQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-2">{currentQuestion.word}</h2>
          <p className="text-muted-foreground">Choose the correct image</p>
        </div>

        {/* Image Options */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {currentQuestion.imageUrls.map((imageUrl, index) => {
            const state = imageStates[index];
            return (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                disabled={canProceed || selectedImage !== null}
                className={`relative aspect-square rounded-lg overflow-hidden border-4 transition-all ${
                  state === 'correct'
                    ? 'border-green-600 ring-4 ring-green-600/20'
                    : state === 'incorrect'
                    ? 'border-red-600 ring-4 ring-red-600/20'
                    : 'border-border hover:border-primary hover:scale-105'
                } ${canProceed || selectedImage !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <img
                  src={imageUrl}
                  alt={`Option ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {state === 'correct' && (
                  <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                )}
                {state === 'incorrect' && (
                  <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                    <XCircle className="h-16 w-16 text-red-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!canProceed}
          >
            {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'Finish'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

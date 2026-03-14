import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PlayCircle } from "lucide-react";
import { useState } from "react";

interface GameConfigScreenProps {
  gameName: string;
  totalQuestions: number;
  onStart: (questionCount: number) => void;
}

function computeSteps(n: number): number[] {
  if (n <= 6) {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
  // Produce ~6 steps including 1 and n
  const steps: number[] = [1];
  const count = 5; // intermediate steps between 1 and n
  for (let i = 1; i < count; i++) {
    const raw = Math.round((n / count) * i);
    if (raw > 1 && raw < n) {
      steps.push(raw);
    }
  }
  steps.push(n);
  // Deduplicate and sort
  return [...new Set(steps)].sort((a, b) => a - b);
}

export default function GameConfigScreen({
  gameName,
  totalQuestions,
  onStart,
}: GameConfigScreenProps) {
  const steps = computeSteps(totalQuestions);
  const [stepIndex, setStepIndex] = useState(steps.length - 1);
  const selectedCount = steps[stepIndex];
  const isAll = selectedCount === totalQuestions;

  const handleSliderChange = (value: number[]) => {
    setStepIndex(value[0]);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-foreground mb-1">{gameName}</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} available
        </p>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              How many questions?
            </span>
            <span className="text-lg font-bold text-primary">
              {isAll ? `All ${totalQuestions}` : selectedCount} question
              {selectedCount !== 1 ? "s" : ""}
            </span>
          </div>

          <Slider
            data-ocid="game-config.slider"
            min={0}
            max={steps.length - 1}
            step={1}
            value={[stepIndex]}
            onValueChange={handleSliderChange}
            className="mb-3"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{steps[0]}</span>
            {steps.slice(1, -1).map((s) => (
              <span key={s}>{s}</span>
            ))}
            <span>All</span>
          </div>
        </div>

        <Button
          data-ocid="game-config.start.primary_button"
          size="lg"
          className="w-full gap-2 text-base"
          onClick={() => onStart(selectedCount)}
        >
          <PlayCircle className="h-5 w-5" />
          Start Game
        </Button>
      </div>
    </div>
  );
}

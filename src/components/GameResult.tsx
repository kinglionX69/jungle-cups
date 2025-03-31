
import { Button } from "@/components/ui/button";
import { Star, Trophy, CircleX } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface GameResultProps {
  won: boolean;
  amount: number;
  tokenType: string;
  onPlayAgain: () => void;
}

const GameResult = ({ won, amount, tokenType, onPlayAgain }: GameResultProps) => {
  useEffect(() => {
    if (won) {
      // Launch confetti if the player won
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4CAF50', '#FFC107', '#FF9800'],
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4CAF50', '#FFC107', '#FF9800'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [won]);

  return (
    <div className="stats-card flex flex-col items-center p-6 animate-fade-in">
      {/* Decorative background elements */}
      {won && (
        <>
          <div className="absolute top-0 left-0 w-full h-full bg-jungle-green/5 pointer-events-none rounded-lg"></div>
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-jungle-yellow/20 rounded-full blur-md"></div>
          <div className="absolute -bottom-2 -left-2 w-14 h-14 bg-jungle-green/20 rounded-full blur-md"></div>
        </>
      )}
      
      {won ? (
        <>
          <Trophy className="w-16 h-16 mb-4 text-jungle-yellow animate-bounce fill-yellow-500/30" />
          <h2 className="text-3xl text-jungle-green mb-2 drop-shadow-sm">You Won!</h2>
          <p className="text-xl mb-4">
            <span className="text-jungle-darkGreen font-bold">
              {amount * 2} {tokenType === "EMOJICOIN" ? "🦁♥️" : tokenType}
            </span>{" "}
            has been sent to your wallet
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="text-jungle-yellow fill-jungle-yellow" />
            <Star className="text-jungle-yellow fill-jungle-yellow" />
            <Star className="text-jungle-yellow fill-jungle-yellow" />
          </div>
        </>
      ) : (
        <>
          <CircleX className="w-16 h-16 mb-4 text-destructive" />
          <h2 className="text-3xl text-destructive mb-2 drop-shadow-sm">You Lost</h2>
          <p className="text-xl mb-4">
            Better luck next time!
          </p>
        </>
      )}
      
      <Button 
        className="jungle-btn mt-4" 
        onClick={onPlayAgain}
      >
        Play Again
      </Button>
    </div>
  );
};

export default GameResult;

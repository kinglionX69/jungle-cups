
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CupProps {
  index: number;
  hasBall: boolean;
  onClick: (index: number) => void;
  isShuffling: boolean;
  isRevealed: boolean;
  gameEnded: boolean;
  selected: boolean;
  isLifted: boolean;
}

const Cup = ({
  index,
  hasBall,
  onClick,
  isShuffling,
  isRevealed,
  gameEnded,
  selected,
  isLifted,
}: CupProps) => {
  const [shuffleAnimation, setShuffleAnimation] = useState("");
  
  useEffect(() => {
    if (isShuffling) {
      setShuffleAnimation(`animate-cup-shuffle-${index + 1}`);
    } else {
      setShuffleAnimation("");
    }
  }, [isShuffling, index]);

  // Determine if the cup is clickable - prevent clicks during:
  // 1. Shuffling
  // 2. Game ended
  // 3. When cups are lifted for initial reveal
  // 4. When cups are being revealed after selection
  const isClickable = !isShuffling && !gameEnded && !isLifted && !isRevealed;

  // Handle cup click with additional checks
  const handleCupClick = () => {
    if (isClickable) {
      onClick(index);
    } else if (isShuffling) {
      console.log("Cannot select cup during shuffling");
    } else if (isLifted) {
      console.log("Cannot select cup during initial reveal");
    }
  };

  return (
    <div className="flex flex-col items-center relative">
      <div
        className={cn(
          "cup",
          shuffleAnimation,
          selected && "border-jungle-yellow border-4 ring-2 ring-yellow-400",
          isRevealed && selected && "animate-cup-reveal",
          isLifted && "transform -translate-y-12 transition-transform duration-700",
          isClickable && "animate-bounce",
          isClickable && "cursor-pointer",
          !isClickable && "cursor-default",
          "transform transition-all duration-300"
        )}
        onClick={handleCupClick}
        style={{ zIndex: (isShuffling || isLifted) ? 5 : 10 }} // Lower z-index during shuffling or initial reveal
      >
        <div className="cup-base"></div>
        
        {/* Add subtle wood texture effect */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-yellow-100 to-transparent rounded-t-[100px] pointer-events-none"></div>
      </div>
      
      {/* Ball shown below cup when lifted, or inside cup when revealed */}
      {hasBall && (isLifted || (isRevealed && selected)) && (
        <div className={cn(
          "ball absolute left-1/2 transform -translate-x-1/2 animate-fade-in",
          isLifted ? "bottom-0" : "bottom-12"
        )}>
          {/* Add subtle highlight to the ball */}
          <div className="absolute top-1 left-2 w-2 h-2 bg-white/40 rounded-full"></div>
        </div>
      )}
      
      <p className="mt-2 font-bungee text-lg relative z-20 text-jungle-darkGreen">{index + 1}</p>
    </div>
  );
};

export default Cup;

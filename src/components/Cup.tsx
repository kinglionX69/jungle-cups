
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
  const [showAnticipation, setShowAnticipation] = useState(false);
  
  useEffect(() => {
    if (isShuffling) {
      setShuffleAnimation(`animate-cup-shuffle-${index + 1}`);
    } else {
      setShuffleAnimation("");
    }
  }, [isShuffling, index]);

  // Add anticipation effect when a cup is selected but not yet revealed
  useEffect(() => {
    if (selected && !isRevealed) {
      setShowAnticipation(true);
      // Remove anticipation once the cup is revealed
      if (isRevealed) {
        setShowAnticipation(false);
      }
    } else {
      setShowAnticipation(false);
    }
  }, [selected, isRevealed]);

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
          showAnticipation && "animate-anticipation",
          isLifted && "transform -translate-y-12 transition-transform duration-700",
          isClickable && "animate-bounce",
          isClickable && "cursor-pointer",
          !isClickable && "cursor-default",
          "transform transition-all duration-300"
        )}
        onClick={handleCupClick}
        style={{ zIndex: (isShuffling || isLifted) ? 5 : 10 }} // Lower z-index during shuffling or initial reveal
      >
        {/* Cup number on the cup itself */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-bungee text-2xl text-jungle-darkGreen bg-jungle-yellow rounded-full w-10 h-10 flex items-center justify-center border-2 border-yellow-700">
            {index + 1}
          </span>
        </div>
        <div className="cup-base"></div>
        
        {/* Improved cup design with subtle details */}
        <div className="absolute w-full h-full">
          {/* Add subtle wood texture effect */}
          <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-yellow-100 to-transparent rounded-t-[100px] pointer-events-none"></div>
          
          {/* Add subtle highlight */}
          <div className="absolute top-4 left-4 right-4 h-8 bg-white/10 rounded-full blur-sm"></div>
          
          {/* Add subtle shadow */}
          <div className="absolute bottom-8 left-2 right-2 h-8 bg-black/20 rounded-full blur-md"></div>
        </div>
      </div>
      
      {/* Anticipation effect - glowing aura around selected cup */}
      {showAnticipation && (
        <div className="absolute inset-0 -z-10 animate-pulse">
          <div className="absolute inset-0 bg-jungle-yellow/30 rounded-full blur-xl transform scale-110"></div>
        </div>
      )}
      
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
    </div>
  );
};

export default Cup;

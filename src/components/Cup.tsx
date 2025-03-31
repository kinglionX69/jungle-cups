
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

  // Determine if the cup is clickable
  const isClickable = !isShuffling && !gameEnded && !isLifted;

  return (
    <div className="flex flex-col items-center relative">
      <div
        className={cn(
          "cup",
          shuffleAnimation,
          selected && "border-jungle-yellow border-4",
          isRevealed && selected && "animate-cup-reveal",
          isLifted && "transform -translate-y-12 transition-transform duration-700",
          isClickable && "animate-bounce",
          isClickable && "cursor-pointer",
          !isClickable && "cursor-default",
          "transform transition-all duration-300"
        )}
        onClick={() => isClickable && onClick(index)}
        style={{ zIndex: isLifted || isRevealed ? 1 : 10 }} // Lower z-index when lifted or revealed to prevent text overlap
      >
        <div className="cup-base"></div>
      </div>
      {/* Ball shown below cup when lifted, or inside cup when revealed */}
      {hasBall && (isLifted || (isRevealed && selected)) && (
        <div className={cn(
          "ball absolute left-1/2 transform -translate-x-1/2 animate-fade-in",
          isLifted ? "bottom-0" : "bottom-12"
        )}></div>
      )}
      <p className="mt-2 font-bungee text-lg">{index + 1}</p>
    </div>
  );
};

export default Cup;

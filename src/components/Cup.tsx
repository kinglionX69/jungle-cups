
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
}

const Cup = ({
  index,
  hasBall,
  onClick,
  isShuffling,
  isRevealed,
  gameEnded,
  selected,
}: CupProps) => {
  const [shuffleAnimation, setShuffleAnimation] = useState("");
  
  useEffect(() => {
    if (isShuffling) {
      setShuffleAnimation(`animate-cup-shuffle-${index + 1}`);
    } else {
      setShuffleAnimation("");
    }
  }, [isShuffling, index]);

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "cup",
          shuffleAnimation,
          selected && "border-jungle-yellow border-4",
          isRevealed && selected && "animate-cup-reveal",
          !isShuffling && !gameEnded && "animate-bounce",
          "transform transition-all duration-300"
        )}
        onClick={() => !isShuffling && !gameEnded && onClick(index)}
      >
        <div className="cup-base"></div>
        {hasBall && isRevealed && selected && (
          <div className="ball absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-fade-in"></div>
        )}
      </div>
      <p className="mt-2 font-bungee text-lg">{index + 1}</p>
    </div>
  );
};

export default Cup;

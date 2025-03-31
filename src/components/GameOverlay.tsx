
import { useGame } from "@/contexts/GameContext";
import { useIsMobile } from "@/hooks/use-mobile";

const GameOverlay = () => {
  const { isShuffling, canBet, currentBet } = useGame();
  const isMobile = useIsMobile();

  // Show overlay during shuffling OR when bet can be placed but hasn't been yet
  const showOverlay = isShuffling || (canBet && currentBet.amount === 0);
  
  if (!showOverlay) return null;
  
  // Use different positioning for mobile vs desktop
  const overlayTop = isMobile ? "top-[260px]" : "top-[340px]";
  
  // Different overlay styles based on state
  const overlayStyle = isShuffling 
    ? "absolute inset-0 bg-black/5 z-50 cursor-not-allowed" // Full overlay during shuffling with slight opacity
    : `absolute ${overlayTop} inset-x-0 bottom-0 bg-transparent z-40 cursor-not-allowed`; // Partial overlay during betting
  
  return (
    <div 
      className={overlayStyle}
      aria-label={isShuffling ? "Game is shuffling cups, please wait" : "Please place a bet first"}
    >
      {isShuffling && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-bold text-jungle-darkGreen animate-pulse">
            Shuffling in progress...
          </p>
        </div>
      )}
    </div>
  );
};

export default GameOverlay;

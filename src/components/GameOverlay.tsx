
import { useGame } from "@/contexts/GameContext";
import { useIsMobile } from "@/hooks/use-mobile";

const GameOverlay = () => {
  const { isShuffling, canBet, currentBet, initialReveal, areLifted, gameEnded, readyForNewGame } = useGame();
  const isMobile = useIsMobile();

  // Show overlay during: 
  // 1. Shuffling
  // 2. Initial reveal phase
  // 3. When bet can be placed but hasn't been yet
  // Don't show when game is ended or ready for new game
  const showOverlay = (isShuffling || initialReveal || (canBet && currentBet.amount === 0)) && 
                      !gameEnded && !readyForNewGame;
  
  if (!showOverlay) return null;
  
  // Use different positioning for mobile vs desktop
  const overlayTop = isMobile ? "top-[260px]" : "top-[340px]";
  
  // Different overlay styles based on state
  const overlayStyle = (isShuffling || initialReveal)
    ? "absolute inset-0 bg-black/5 z-50 cursor-not-allowed" // Full overlay during shuffling or initial reveal
    : `absolute ${overlayTop} inset-x-0 bottom-0 bg-transparent z-40 cursor-not-allowed`; // Partial overlay during betting
  
  // Get appropriate message based on state
  const getMessage = () => {
    if (isShuffling) return "Shuffling in progress...";
    if (initialReveal && areLifted) return "Remember where the ball is...";
    if (initialReveal && !areLifted) return "Cups coming down...";
    return "";
  };
  
  return (
    <div 
      className={overlayStyle}
      aria-label={
        isShuffling ? "Game is shuffling cups, please wait" : 
        initialReveal ? "Remember where the ball is placed" :
        "Please place a bet first"
      }
    >
      {(isShuffling || initialReveal) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-bold text-jungle-darkGreen animate-pulse">
            {getMessage()}
          </p>
        </div>
      )}
    </div>
  );
};

export default GameOverlay;

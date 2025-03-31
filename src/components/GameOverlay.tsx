
import { useGame } from "@/contexts/GameContext";

const GameOverlay = () => {
  const { isShuffling, canBet, currentBet } = useGame();

  // Show overlay during shuffling OR when bet can be placed but hasn't been yet
  const showOverlay = isShuffling || (canBet && currentBet.amount === 0);
  
  if (!showOverlay) return null;
  
  return (
    <div 
      className="absolute inset-0 bg-transparent z-40 cursor-not-allowed" 
      aria-label={isShuffling ? "Game is shuffling cups, please wait" : "Please place a bet first"}
    >
      {/* Invisible overlay to prevent clicks during shuffling or before betting */}
    </div>
  );
};

export default GameOverlay;

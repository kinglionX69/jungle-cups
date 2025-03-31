
import { useGame } from "@/contexts/GameContext";

const GameOverlay = () => {
  const { isShuffling, canBet, currentBet } = useGame();

  // Show overlay during shuffling OR when bet can be placed but hasn't been yet
  const showOverlay = isShuffling || (canBet && currentBet.amount === 0);
  
  if (!showOverlay) return null;
  
  // Only cover the cup area during betting phase, not the entire game
  const overlayStyle = isShuffling 
    ? "absolute inset-0 bg-transparent z-40 cursor-not-allowed" // Full overlay during shuffling
    : "absolute top-[400px] inset-x-0 bottom-0 bg-transparent z-40 cursor-not-allowed"; // Adjusted height to be below the entire bet form including button
  
  return (
    <div 
      className={overlayStyle}
      aria-label={isShuffling ? "Game is shuffling cups, please wait" : "Please place a bet first"}
    >
      {/* Invisible overlay to prevent clicks during shuffling or before betting */}
    </div>
  );
};

export default GameOverlay;

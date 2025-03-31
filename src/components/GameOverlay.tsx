
import { useGame } from "@/contexts/GameContext";

const GameOverlay = () => {
  const { isShuffling } = useGame();

  if (!isShuffling) return null;
  
  return (
    <div className="absolute inset-0 bg-transparent z-40 cursor-not-allowed" 
      aria-label="Game is shuffling cups, please wait">
      {/* Invisible overlay to prevent clicks during shuffling */}
    </div>
  );
};

export default GameOverlay;

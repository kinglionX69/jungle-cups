
import { useGame } from "@/contexts/GameContext";
import Cup from "@/components/Cup";

interface CupsDisplayProps {
  onCupSelect: (index: number) => void;
}

const CupsDisplay = ({ onCupSelect }: CupsDisplayProps) => {
  const {
    ballPosition,
    isShuffling,
    isRevealed,
    gameEnded,
    selectedCup,
    areLifted
  } = useGame();

  return (
    <div className="flex justify-center space-x-4 md:space-x-12 mt-8 mb-16">
      {[0, 1, 2].map((index) => (
        <Cup
          key={index}
          index={index}
          hasBall={index === ballPosition}
          onClick={onCupSelect}
          isShuffling={isShuffling}
          isRevealed={isRevealed}
          gameEnded={gameEnded}
          selected={selectedCup === index}
          isLifted={areLifted}
        />
      ))}
    </div>
  );
};

export default CupsDisplay;

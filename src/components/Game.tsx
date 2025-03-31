
import { GameProvider } from "@/contexts/GameContext";
import { useGameLogic } from "@/hooks/useGameLogic";
import GameContainer from "@/components/GameContainer";
import CupsDisplay from "@/components/CupsDisplay";
import GameControls from "@/components/GameControls";

interface GameProps {
  walletAddress: string;
  isEscrowFunded: boolean;
  onStatsUpdated: () => void;
}

const Game = ({ walletAddress, isEscrowFunded, onStatsUpdated }: GameProps) => {
  return (
    <GameProvider>
      <GameContent 
        walletAddress={walletAddress} 
        isEscrowFunded={isEscrowFunded} 
        onStatsUpdated={onStatsUpdated} 
      />
    </GameProvider>
  );
};

// This component is wrapped in the GameProvider and has access to the game context
const GameContent = ({ walletAddress, isEscrowFunded, onStatsUpdated }: GameProps) => {
  const {
    startGameSequence,
    handlePlaceBet,
    handleCupSelect,
    handleNewRound
  } = useGameLogic({ walletAddress, isEscrowFunded, onStatsUpdated });

  return (
    <GameContainer>
      <GameControls
        onStartGame={startGameSequence}
        onPlaceBet={handlePlaceBet}
        onPlayAgain={handleNewRound}
        walletAddress={walletAddress}
        isEscrowFunded={isEscrowFunded}
      />
      
      <CupsDisplay onCupSelect={handleCupSelect} />
    </GameContainer>
  );
};

export default Game;

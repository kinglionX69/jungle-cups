
import { useState, useEffect } from "react";
import { GameProvider } from "@/contexts/GameProvider";
import { useGameLogic } from "@/hooks/useGameLogic";
import GameContainer from "@/components/GameContainer";
import CupsDisplay from "@/components/CupsDisplay";
import GameControls from "@/components/GameControls";
import GameOverlay from "@/components/GameOverlay";
import { checkEscrowFunding } from "@/utils/aptosUtils";

interface GameProps {
  walletAddress: string;
  isEscrowFunded: boolean;
  onStatsUpdated: () => void;
  updatePlayerStats?: (won: boolean, betAmount: number, tokenType: string) => Promise<any>;
}

const Game = ({ walletAddress, isEscrowFunded, onStatsUpdated, updatePlayerStats }: GameProps) => {
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  // Check what tokens are available for betting
  useEffect(() => {
    const getAvailableTokens = async () => {
      if (walletAddress) {
        const { availableTokens } = await checkEscrowFunding();
        setAvailableTokens(availableTokens);
      }
    };

    getAvailableTokens();
    
    // Refresh every 30 seconds
    const interval = setInterval(getAvailableTokens, 30000);
    
    return () => clearInterval(interval);
  }, [walletAddress]);

  return (
    <GameProvider>
      <GameContent 
        walletAddress={walletAddress} 
        isEscrowFunded={isEscrowFunded} 
        onStatsUpdated={onStatsUpdated}
        updatePlayerStats={updatePlayerStats}
        availableTokens={availableTokens}
      />
    </GameProvider>
  );
};

// This component is wrapped in the GameProvider and has access to the game context
const GameContent = ({ 
  walletAddress, 
  isEscrowFunded, 
  onStatsUpdated, 
  updatePlayerStats,
  availableTokens 
}: GameProps & { availableTokens: string[] }) => {
  const {
    startGameSequence,
    handlePlaceBet,
    handleCupSelect,
    handleNewRound
  } = useGameLogic({ 
    walletAddress, 
    isEscrowFunded, 
    onStatsUpdated,
    updatePlayerStats
  });

  return (
    <GameContainer>
      <GameOverlay />
      <GameControls
        onStartGame={startGameSequence}
        onPlaceBet={handlePlaceBet}
        onPlayAgain={handleNewRound}
        walletAddress={walletAddress}
        isEscrowFunded={isEscrowFunded}
        availableTokens={availableTokens}
      />
      
      <CupsDisplay onCupSelect={handleCupSelect} />
    </GameContainer>
  );
};

export default Game;

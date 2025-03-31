
import { playClickSound } from "@/utils/gameUtils";
import { useGameSequence } from "./useGameSequence";
import { useBetHandler } from "./useBetHandler";
import { useCupSelection } from "./useCupSelection";

interface UseGameLogicProps {
  walletAddress: string;
  isEscrowFunded: boolean;
  onStatsUpdated: () => void;
  updatePlayerStats?: (won: boolean, betAmount: number, tokenType: string) => Promise<any>;
}

export const useGameLogic = ({ 
  walletAddress, 
  isEscrowFunded, 
  onStatsUpdated,
  updatePlayerStats
}: UseGameLogicProps) => {
  const { startGameSequence } = useGameSequence();
  const { handlePlaceBet } = useBetHandler(walletAddress);
  const { handleCupSelect } = useCupSelection({ 
    onStatsUpdated,
    updatePlayerStats
  });
  
  // Start a new round
  const handleNewRound = () => {
    playClickSound();
    startGameSequence();
  };
  
  return {
    startGameSequence,
    handlePlaceBet,
    handleCupSelect,
    handleNewRound
  };
};

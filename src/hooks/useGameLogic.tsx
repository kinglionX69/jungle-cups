
import { playClickSound } from "@/utils/gameUtils";
import { useGameSequence } from "./useGameSequence";
import { useBetHandler } from "./useBetHandler";
import { useCupSelection } from "./useCupSelection";

interface UseGameLogicProps {
  walletAddress: string;
  isEscrowFunded: boolean;
  onStatsUpdated: () => void;
}

export const useGameLogic = ({ 
  walletAddress, 
  isEscrowFunded, 
  onStatsUpdated 
}: UseGameLogicProps) => {
  const { startGameSequence } = useGameSequence();
  const { handlePlaceBet } = useBetHandler(walletAddress);
  const { handleCupSelect } = useCupSelection({ onStatsUpdated });
  
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

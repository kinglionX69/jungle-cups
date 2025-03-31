
import { useToast } from "@/components/ui/use-toast";
import { 
  didPlayerWin, 
  playClickSound, 
  playWinSound, 
  playLoseSound 
} from "@/utils/gameUtils";
import { transferWinnings } from "@/utils/aptosUtils";
import { useGameState } from "./useGameState";

interface UseCupSelectionProps {
  onStatsUpdated: () => void;
}

export const useCupSelection = ({ onStatsUpdated }: UseCupSelectionProps) => {
  const { toast } = useToast();
  const {
    setSelectedCup,
    setPlayerWon,
    setIsRevealed,
    setGameEnded,
    setReadyForNewGame,
    ballPosition,
    isShuffling,
    gameEnded,
    selectedCup,
    areLifted,
    currentBet
  } = useGameState();
  
  // Handle cup selection
  const handleCupSelect = (index: number) => {
    if (isShuffling || gameEnded || selectedCup !== -1 || areLifted) return;
    
    playClickSound();
    setSelectedCup(index);
    
    // Determine win/loss and reveal
    const won = didPlayerWin(index, ballPosition);
    setPlayerWon(won);
    
    // Reveal after a short delay
    setTimeout(async () => {
      setIsRevealed(true);
      
      if (won) {
        playWinSound();
        // Process winnings - double the bet amount
        const winAmount = currentBet.amount * 2;
        await transferWinnings(winAmount, currentBet.tokenType);
        
        toast({
          title: "You Won! 🎉",
          description: `${winAmount} ${currentBet.tokenType} has been sent to your wallet`,
          variant: "default",
        });
      } else {
        playLoseSound();
        toast({
          title: "You Lost 😢",
          description: "Better luck next time!",
          variant: "default",
        });
      }
      
      setGameEnded(true);
      setReadyForNewGame(true);
      
      // Notify parent to update stats
      onStatsUpdated();
    }, 1000);
  };
  
  return {
    handleCupSelect
  };
};

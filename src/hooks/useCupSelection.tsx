
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
  updatePlayerStats?: (won: boolean, betAmount: number, tokenType: string) => Promise<any>;
}

export const useCupSelection = ({ onStatsUpdated, updatePlayerStats }: UseCupSelectionProps) => {
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
    currentBet,
    canBet,
    initialReveal
  } = useGameState();
  
  // Handle cup selection
  const handleCupSelect = (index: number) => {
    // Don't allow selection if:
    // 1. Cups are shuffling
    // 2. Game has ended
    // 3. A cup is already selected
    // 4. Cups are lifted for initial reveal
    // 5. During the initial reveal phase
    // 6. User hasn't placed a bet yet (currentBet.amount === 0)
    if (
      isShuffling || 
      gameEnded || 
      selectedCup !== -1 || 
      areLifted || 
      initialReveal ||
      (canBet && currentBet.amount === 0)
    ) {
      console.log("Cup selection prevented - game is not in selection phase");
      return;
    }
    
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
        
        // Get player wallet address for payout
        const playerAddress = await window.aptos.account().then(acc => acc.address);
        await transferWinnings(playerAddress, winAmount, currentBet.tokenType);
        
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
      
      // Update stats if function is provided
      if (updatePlayerStats) {
        await updatePlayerStats(won, currentBet.amount, currentBet.tokenType);
      }
      
      // Notify parent to update stats
      onStatsUpdated();
    }, 1000);
  };
  
  return {
    handleCupSelect
  };
};

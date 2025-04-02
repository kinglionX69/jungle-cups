
import { useToast } from "@/components/ui/use-toast";
import { 
  didPlayerWin, 
  playClickSound, 
  playWinSound, 
  playLoseSound,
  playAnticipationSound
} from "@/utils/gameUtils";
import { transferWinnings } from "@/utils/escrowUtils";
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
    setShowReadyButton,
    ballPosition,
    isShuffling,
    gameEnded,
    selectedCup,
    areLifted,
    currentBet,
    canBet,
    initialReveal
  } = useGameState();
  
  const handleCupSelect = (index: number) => {
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
    
    const won = didPlayerWin(index, ballPosition);
    setPlayerWon(won);
    
    // Play anticipation sound
    playAnticipationSound();
    
    // Create anticipation with a shorter delay before revealing
    setTimeout(async () => {
      setIsRevealed(true);
      
      if (won) {
        playWinSound();
        const winAmount = currentBet.amount * 2;
        
        try {
          const playerAddress = await window.aptos.account().then(acc => acc.address);
          const payoutSuccess = await transferWinnings(playerAddress, winAmount, currentBet.tokenType);
          
          if (payoutSuccess) {
            toast({
              title: "You Won! 🎉",
              description: `${winAmount} ${currentBet.tokenType} has been added to your winnings`,
              variant: "default",
            });
          } else {
            toast({
              title: "Payout Processing",
              description: "Your winnings are being processed. They'll appear in your stats soon.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Error processing winnings:", error);
          toast({
            title: "Processing Error",
            description: "There was an issue processing your winnings. Please contact support.",
            variant: "destructive",
          });
        }
      } else {
        playLoseSound();
        toast({
          title: "You Lost 😢",
          description: "Better luck next time!",
          variant: "default",
        });
      }
      
      setGameEnded(true);
      
      // Show the ready for new game button instead of auto-starting
      setShowReadyButton(true);
      setReadyForNewGame(true);
      
      if (updatePlayerStats) {
        await updatePlayerStats(won, currentBet.amount, currentBet.tokenType);
      }
      
      onStatsUpdated();
    }, 1200); // Reduced from 2000ms to 1200ms for faster reveal after anticipation
  };
  
  return {
    handleCupSelect
  };
};

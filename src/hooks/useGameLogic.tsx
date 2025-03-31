
import { useToast } from "@/components/ui/use-toast";
import { useGame } from "@/contexts/GameContext";
import {
  shuffleCups,
  didPlayerWin,
  playShuffleSound,
  playCupsDownSound,
  playWinSound,
  playLoseSound,
  playClickSound,
  TIMING
} from "@/utils/gameUtils";
import {
  placeBet,
  transferWinnings,
} from "@/utils/aptosUtils";

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
  const { toast } = useToast();
  const {
    setGameStarted,
    setGameEnded,
    setSelectedCup,
    setIsRevealed,
    setAreLifted,
    setCanBet,
    setInitialReveal,
    setReadyForNewGame,
    setBallPosition,
    setIsShuffling,
    setPlayerWon,
    setCurrentBet,
    ballPosition,
    selectedCup,
    isShuffling,
    gameEnded,
    areLifted,
    currentBet
  } = useGame();
  
  // Starts a new game sequence with ball shown first
  const startGameSequence = () => {
    // Initial setup - show cups lifted and ball visible
    resetGameState();
    setAreLifted(true);
    setInitialReveal(true);
    
    // Randomize initial ball position
    const initialBallPosition = Math.floor(Math.random() * 3);
    setBallPosition(initialBallPosition);
    
    // After showing the ball, lower the cups
    setTimeout(() => {
      setAreLifted(false);
      playCupsDownSound();
      
      // After cups are down, start shuffling
      setTimeout(() => {
        setIsShuffling(true);
        playShuffleSound();
        
        // Shuffling animation duration
        const newBallPosition = shuffleCups(ballPosition);
        setBallPosition(newBallPosition);
        
        setTimeout(() => {
          setIsShuffling(false);
          setCanBet(true);
          setInitialReveal(false);
          
          toast({
            title: "Place Your Bet!",
            description: "Now you can place a bet and guess which cup hides the ball.",
          });
        }, TIMING.SHUFFLE_DURATION);
        
      }, TIMING.CUPS_DOWN);
      
    }, TIMING.INITIAL_REVEAL);
  };

  // Reset game state for new round
  const resetGameState = () => {
    setGameStarted(true);
    setGameEnded(false);
    setSelectedCup(-1);
    setIsRevealed(false);
    setAreLifted(false);
    setCanBet(false);
    setInitialReveal(false);
    setReadyForNewGame(false);
    setCurrentBet({
      amount: 0,
      tokenType: "APT",
    });
  };
  
  // Handle placing a bet and participating in the game
  const handlePlaceBet = async (tokenType: string, amount: number) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    if (!canBet) {
      toast({
        title: "Wait for Shuffling",
        description: "Please wait for the cups to shuffle before placing a bet",
        variant: "destructive",
      });
      return;
    }
    
    playClickSound();
    
    // Place the bet transaction
    const betPlaced = await placeBet(amount, tokenType);
    if (!betPlaced) {
      toast({
        title: "Bet Failed",
        description: "Failed to place your bet. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Store current bet
    setCurrentBet({
      amount,
      tokenType,
    });
    
    toast({
      title: "Bet Placed!",
      description: "Now select a cup where you think the ball is hidden",
    });
  };
  
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

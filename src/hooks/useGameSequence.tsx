
import { useToast } from "@/components/ui/use-toast";
import { 
  shuffleCups, 
  playCupsDownSound, 
  playShuffleSound 
} from "@/utils/gameUtils";
import { TIMING } from "@/utils/gameTiming";
import { useGameState } from "./useGameState";

export const useGameSequence = () => {
  const { toast } = useToast();
  const {
    setAreLifted,
    setInitialReveal,
    setBallPosition,
    setIsShuffling,
    setCanBet,
    ballPosition,
    resetGameState
  } = useGameState();
  
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
  
  return {
    startGameSequence
  };
};

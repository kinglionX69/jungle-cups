
import { useGame } from "@/contexts/GameContext";

export const useGameState = () => {
  const {
    setGameStarted,
    setGameEnded,
    setSelectedCup,
    setIsRevealed,
    setAreLifted,
    setCanBet,
    setInitialReveal,
    setReadyForNewGame,
    setShowReadyButton,
    setBallPosition,
    setIsShuffling,
    setPlayerWon,
    setCurrentBet,
    ballPosition,
    selectedCup,
    isShuffling,
    gameEnded,
    areLifted,
    currentBet,
    canBet,
    initialReveal,
    showReadyButton
  } = useGame();

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
    setShowReadyButton(false);
    setCurrentBet({
      amount: 0,
      tokenType: "APT",
    });
  };

  return {
    // State setters
    setGameStarted,
    setGameEnded,
    setSelectedCup,
    setIsRevealed,
    setAreLifted,
    setCanBet,
    setInitialReveal,
    setReadyForNewGame,
    setShowReadyButton,
    setBallPosition,
    setIsShuffling,
    setPlayerWon,
    setCurrentBet,
    
    // State values
    ballPosition,
    selectedCup,
    isShuffling,
    gameEnded,
    areLifted,
    currentBet,
    canBet,
    initialReveal,
    showReadyButton,
    
    // State management functions
    resetGameState
  };
};

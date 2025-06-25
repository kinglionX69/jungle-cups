
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
    console.log("🎮 GAME STATE: Resetting game state...");
    setGameStarted(true);
    setGameEnded(false);
    setSelectedCup(-1);
    setIsRevealed(false);
    setAreLifted(false);
    setCanBet(false); // This will be set to true after shuffling
    setInitialReveal(false);
    setReadyForNewGame(false);
    setShowReadyButton(false);
    setCurrentBet({
      amount: 0,
      tokenType: "APT",
    });
    console.log("✅ GAME STATE: Game state reset complete");
  };

  // Debug function to log current game state
  const logGameState = () => {
    console.log("🎮 GAME STATE: Current state:");
    console.log("🎮 GAME STATE: canBet:", canBet);
    console.log("🎮 GAME STATE: gameEnded:", gameEnded);
    console.log("🎮 GAME STATE: isShuffling:", isShuffling);
    console.log("🎮 GAME STATE: selectedCup:", selectedCup);
    console.log("🎮 GAME STATE: currentBet:", currentBet);
    console.log("🎮 GAME STATE: ballPosition:", ballPosition);
    console.log("🎮 GAME STATE: areLifted:", areLifted);
    console.log("🎮 GAME STATE: initialReveal:", initialReveal);
    console.log("🎮 GAME STATE: showReadyButton:", showReadyButton);
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
    resetGameState,
    logGameState
  };
};


import { GameState } from "@/types/gameTypes";

// Default initial state for the game
export const initialGameState: GameState = {
  // Game states
  gameStarted: false,
  isShuffling: false,
  gameEnded: false,
  ballPosition: 0,
  selectedCup: -1,
  isRevealed: false,
  playerWon: false,
  areLifted: false,
  canBet: false,
  initialReveal: false,
  readyForNewGame: false,
  showReadyButton: false,
  
  // Bet states
  currentBet: {
    amount: 0,
    tokenType: "APT",
  }
};

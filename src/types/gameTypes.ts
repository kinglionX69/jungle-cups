
// Define types for the game context
export interface GameState {
  // Game states
  gameStarted: boolean;
  isShuffling: boolean;
  gameEnded: boolean;
  ballPosition: number;
  selectedCup: number;
  isRevealed: boolean;
  playerWon: boolean;
  areLifted: boolean;
  canBet: boolean;
  initialReveal: boolean;
  readyForNewGame: boolean;
  
  // Bet states
  currentBet: {
    amount: number;
    tokenType: string;
  };
}

export interface GameActions {
  // Game actions
  setGameStarted: (value: boolean) => void;
  setIsShuffling: (value: boolean) => void;
  setGameEnded: (value: boolean) => void;
  setBallPosition: (value: number) => void;
  setSelectedCup: (value: number) => void;
  setIsRevealed: (value: boolean) => void;
  setPlayerWon: (value: boolean) => void;
  setAreLifted: (value: boolean) => void;
  setCanBet: (value: boolean) => void;
  setInitialReveal: (value: boolean) => void;
  setReadyForNewGame: (value: boolean) => void;
  setCurrentBet: (bet: { amount: number; tokenType: string }) => void;
}

// Player statistics interface
export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  aptWon: number;
  emojiWon: number;
  referrals: number;
}

export type GameContextType = GameState & GameActions;

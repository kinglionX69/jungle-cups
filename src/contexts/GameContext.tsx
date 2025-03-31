
import { 
  createContext, 
  useContext, 
  useState, 
  ReactNode, 
  useMemo 
} from "react";

// Define the shape of our context
interface GameContextType {
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

// Create the context with an empty default value
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Game states
  const [gameStarted, setGameStarted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [ballPosition, setBallPosition] = useState(0);
  const [selectedCup, setSelectedCup] = useState(-1);
  const [isRevealed, setIsRevealed] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [areLifted, setAreLifted] = useState(false);
  const [canBet, setCanBet] = useState(false);
  const [initialReveal, setInitialReveal] = useState(false);
  const [readyForNewGame, setReadyForNewGame] = useState(false);
  
  // Bet states
  const [currentBet, setCurrentBet] = useState({
    amount: 0,
    tokenType: "APT",
  });

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Game states
    gameStarted,
    isShuffling,
    gameEnded,
    ballPosition,
    selectedCup,
    isRevealed,
    playerWon,
    areLifted,
    canBet,
    initialReveal,
    readyForNewGame,
    
    // Bet states
    currentBet,
    
    // Game actions
    setGameStarted,
    setIsShuffling,
    setGameEnded,
    setBallPosition,
    setSelectedCup,
    setIsRevealed,
    setPlayerWon,
    setAreLifted,
    setCanBet,
    setInitialReveal,
    setReadyForNewGame,
    setCurrentBet,
  }), [
    gameStarted,
    isShuffling,
    gameEnded,
    ballPosition,
    selectedCup,
    isRevealed,
    playerWon,
    areLifted,
    canBet,
    initialReveal,
    readyForNewGame,
    currentBet
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

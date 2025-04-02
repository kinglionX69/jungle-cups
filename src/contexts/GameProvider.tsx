
import { 
  ReactNode, 
  useMemo, 
  useState 
} from "react";
import { GameContext } from "./GameContext";
import { initialGameState } from "./initialGameState";

export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Game states
  const [gameStarted, setGameStarted] = useState(initialGameState.gameStarted);
  const [isShuffling, setIsShuffling] = useState(initialGameState.isShuffling);
  const [gameEnded, setGameEnded] = useState(initialGameState.gameEnded);
  const [ballPosition, setBallPosition] = useState(initialGameState.ballPosition);
  const [selectedCup, setSelectedCup] = useState(initialGameState.selectedCup);
  const [isRevealed, setIsRevealed] = useState(initialGameState.isRevealed);
  const [playerWon, setPlayerWon] = useState(initialGameState.playerWon);
  const [areLifted, setAreLifted] = useState(initialGameState.areLifted);
  const [canBet, setCanBet] = useState(initialGameState.canBet);
  const [initialReveal, setInitialReveal] = useState(initialGameState.initialReveal);
  const [readyForNewGame, setReadyForNewGame] = useState(initialGameState.readyForNewGame);
  const [showReadyButton, setShowReadyButton] = useState(initialGameState.showReadyButton);
  
  // Bet states
  const [currentBet, setCurrentBet] = useState(initialGameState.currentBet);

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
    showReadyButton,
    
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
    setShowReadyButton,
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
    showReadyButton,
    currentBet
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

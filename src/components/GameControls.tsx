
import { useGame } from "@/contexts/GameContext";
import BetForm from "@/components/BetForm";
import GameResult from "@/components/GameResult";
import { Button } from "@/components/ui/button";

interface GameControlsProps {
  onStartGame: () => void;
  onPlaceBet: (tokenType: string, amount: number) => void;
  onPlayAgain: () => void;
  walletAddress: string;
  isEscrowFunded: boolean;
  availableTokens: string[];
}

const GameControls = ({ 
  onStartGame, 
  onPlaceBet, 
  onPlayAgain,
  walletAddress,
  isEscrowFunded,
  availableTokens
}: GameControlsProps) => {
  const {
    gameStarted,
    initialReveal,
    areLifted,
    isShuffling,
    gameEnded,
    playerWon,
    currentBet,
    canBet,
    selectedCup,
    isRevealed,
    readyForNewGame,
    showReadyButton
  } = useGame();

  // Game title based on current state
  const getGameTitle = () => {
    if (!gameStarted) {
      return "Start a New Game";
    } else if (showReadyButton) {
      return "Ready for a New Round?";
    } else if (initialReveal) {
      return areLifted ? "Watch Where the Ball Is..." : "Cups Coming Down...";
    } else if (isShuffling) {
      return "Shuffling Cups...";
    } else if (selectedCup !== -1 && !isRevealed) {
      return "Drum Roll Please...";
    } else if (gameEnded) {
      return playerWon ? "You Found It! 🎉" : "Wrong Cup 😢";
    } else if (canBet && currentBet.amount === 0) {
      return "Place Your Bet";
    } else {
      return "Select a Cup";
    }
  };

  return (
    <>
      <h2 className="text-2xl font-luckiest text-jungle-darkGreen mb-4 relative z-30">
        {getGameTitle()}
      </h2>
      
      {!gameStarted ? (
        <div className="text-center">
          <button 
            onClick={onStartGame} 
            className="jungle-btn px-8 py-3 mb-6"
          >
            Start Game
          </button>
          
          <p className="text-sm text-muted-foreground mt-2 relative z-30">
            Watch carefully where the ball is placed, then the cups will shuffle!
          </p>
        </div>
      ) : showReadyButton ? (
        <div className="text-center">
          <Button 
            onClick={onStartGame} 
            className="jungle-btn px-8 py-3 mb-6 animate-pulse"
          >
            I'm Ready
          </Button>
          
          <p className="text-sm text-muted-foreground mt-2 relative z-30">
            Click when you're ready to start a new round!
          </p>
        </div>
      ) : readyForNewGame ? (
        <div className="text-center">
          <GameResult 
            won={playerWon}
            amount={currentBet.amount}
            tokenType={currentBet.tokenType}
            onPlayAgain={onPlayAgain}
          />
        </div>
      ) : gameEnded ? (
        <GameResult 
          won={playerWon}
          amount={currentBet.amount}
          tokenType={currentBet.tokenType}
          onPlayAgain={onPlayAgain}
        />
      ) : (
        <>
          {canBet && currentBet.amount === 0 ? (
            <div className="max-w-md mx-auto mt-6">
              <BetForm 
                onPlaceBet={onPlaceBet}
                disabled={!walletAddress || !canBet}
                isEscrowFunded={isEscrowFunded}
                availableTokens={availableTokens}
              />
            </div>
          ) : canBet && currentBet.amount > 0 && selectedCup === -1 ? (
            <p className="text-center mt-4 mb-12 animate-pulse relative z-30">
              Click on a cup to make your guess!
            </p>
          ) : selectedCup !== -1 && !isRevealed ? (
            <p className="text-center mt-4 mb-12 animate-pulse relative z-30 font-bold text-jungle-orange">
              Will you find the ball? Revealing...
            </p>
          ) : !canBet && !gameEnded ? (
            <p className="text-center mt-4 mb-12 animate-pulse relative z-30">
              {isShuffling ? "Watch carefully..." : areLifted ? "Remember where the ball is..." : "Get ready..."}
            </p>
          ) : null}
        </>
      )}
    </>
  );
};

export default GameControls;

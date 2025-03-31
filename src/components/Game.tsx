
import { useState, useEffect } from "react";
import Cup from "@/components/Cup";
import BetForm from "@/components/BetForm";
import GameResult from "@/components/GameResult";
import { useToast } from "@/components/ui/use-toast";

import {
  placeBet,
  transferWinnings,
} from "@/utils/aptosUtils";

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

interface GameProps {
  walletAddress: string;
  isEscrowFunded: boolean;
  onStatsUpdated: () => void;
}

const Game = ({ walletAddress, isEscrowFunded, onStatsUpdated }: GameProps) => {
  const { toast } = useToast();
  
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
  
  // Bet states
  const [currentBet, setCurrentBet] = useState({
    amount: 0,
    tokenType: "APT",
  });
  
  // Starts the game sequence (initial reveal before betting)
  const startGameSequence = () => {
    // Initial setup - show cups lifted and ball visible
    setGameStarted(true);
    setGameEnded(false);
    setSelectedCup(-1);
    setIsRevealed(false);
    setAreLifted(true);
    setCanBet(false);
    setInitialReveal(true);
    
    // Randomize initial ball position
    const initialBallPosition = Math.floor(Math.random() * 3);
    setBallPosition(initialBallPosition);
    
    // After showing the ball, lower the cups
    setTimeout(() => {
      setAreLifted(false);
      playCupsDownSound();
      toast({
        title: "Watching the Cups",
        description: "The cups are covering the ball. Get ready!",
      });
      
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
      
      // Notify parent to update stats
      onStatsUpdated();
    }, 1000);
  };
  
  // Reset the game to play again
  const handlePlayAgain = () => {
    setGameStarted(false);
    setIsShuffling(false);
    setGameEnded(false);
    setSelectedCup(-1);
    setIsRevealed(false);
    setAreLifted(false);
    setCanBet(false);
    playClickSound();
  };

  return (
    <div className="game-container">
      <h2 className="text-2xl font-luckiest text-jungle-darkGreen mb-4">
        {!gameStarted 
          ? "Start a New Game"
          : initialReveal
            ? areLifted 
              ? "Watch Where the Ball Is..." 
              : "Cups Coming Down..."
            : isShuffling 
              ? "Shuffling Cups..." 
              : gameEnded 
                ? playerWon 
                  ? "You Found It! 🎉" 
                  : "Wrong Cup 😢" 
                : canBet && currentBet.amount === 0
                  ? "Place Your Bet"
                  : "Select a Cup"
        }
      </h2>
      
      {!gameStarted ? (
        <div className="text-center">
          <button 
            onClick={startGameSequence} 
            className="jungle-btn px-8 py-3 mb-6"
          >
            Start Game
          </button>
          
          <p className="text-sm text-muted-foreground mt-2">
            Watch carefully where the ball is placed, then the cups will shuffle!
          </p>
        </div>
      ) : gameEnded ? (
        <GameResult 
          won={playerWon}
          amount={currentBet.amount}
          tokenType={currentBet.tokenType}
          onPlayAgain={handlePlayAgain}
        />
      ) : (
        <>
          <div className="flex justify-center space-x-4 md:space-x-12 my-8">
            {[0, 1, 2].map((index) => (
              <Cup
                key={index}
                index={index}
                hasBall={index === ballPosition}
                onClick={handleCupSelect}
                isShuffling={isShuffling}
                isRevealed={isRevealed}
                gameEnded={gameEnded}
                selected={selectedCup === index}
                isLifted={areLifted}
              />
            ))}
          </div>

          {canBet && currentBet.amount === 0 ? (
            <div className="max-w-md mx-auto mt-6">
              <BetForm 
                onPlaceBet={handlePlaceBet}
                disabled={!walletAddress || !canBet}
                isEscrowFunded={isEscrowFunded}
              />
            </div>
          ) : canBet && currentBet.amount > 0 && selectedCup === -1 ? (
            <p className="text-center mt-4 animate-pulse">
              Click on a cup to make your guess!
            </p>
          ) : !canBet && !gameEnded ? (
            <p className="text-center mt-4 animate-pulse">
              {isShuffling ? "Watch carefully..." : areLifted ? "Remember where the ball is..." : "Get ready..."}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
};

export default Game;

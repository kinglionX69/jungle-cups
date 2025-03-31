import { useState, useEffect } from "react";
import WalletConnect from "@/components/WalletConnect";
import Cup from "@/components/Cup";
import BetForm from "@/components/BetForm";
import GameResult from "@/components/GameResult";
import StatsCard from "@/components/StatsCard";
import ReferralCard from "@/components/ReferralCard";
import Logo from "@/components/Logo";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Trophy, User } from "lucide-react";

import {
  checkEscrowFunding,
  getPlayerStats,
  getLeaderboardData,
  placeBet,
  transferWinnings,
  getReferralFromUrl,
  trackReferral,
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

const Index = () => {
  const { toast } = useToast();
  
  // Wallet and connection states
  const [walletAddress, setWalletAddress] = useState("");
  const [isEscrowFunded, setIsEscrowFunded] = useState(true);
  
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
  
  // Player data
  const [playerStats, setPlayerStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    aptWon: 0,
    emojiWon: 0,
    referrals: 0,
  });
  
  // Leaderboard data - keeping this state for later reintegration
  const [leaderboardData, setLeaderboardData] = useState({
    aptLeaders: [],
    emojiLeaders: [],
  });
  
  // Check escrow funding status on load and periodically
  useEffect(() => {
    const checkEscrowStatus = async () => {
      const isFunded = await checkEscrowFunding();
      setIsEscrowFunded(isFunded);
    };
    
    checkEscrowStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkEscrowStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle wallet connection
  const handleWalletConnect = async (address: string) => {
    setWalletAddress(address);
    
    if (address) {
      // Check for referral code
      const referralAddress = getReferralFromUrl();
      if (referralAddress && referralAddress !== address) {
        await trackReferral(address, referralAddress);
        toast({
          title: "Referral Detected",
          description: "You've been referred by another player!",
        });
      }
      
      // Load player stats
      const stats = await getPlayerStats(address);
      if (stats) {
        setPlayerStats(stats);
      }
      
      // Load leaderboard data (keeping this for later reintegration)
      const leaderboard = await getLeaderboardData();
      if (leaderboard) {
        setLeaderboardData(leaderboard);
      }
    }
  };
  
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
      
      // Update player stats
      const updatedStats = await getPlayerStats(walletAddress);
      if (updatedStats) {
        setPlayerStats(updatedStats);
      }
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
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 relative">
      {/* Header with Logo and Wallet Connection */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <Logo />
          <p className="text-jungle-green font-bungee ml-1">Find the ball, win the prize!</p>
        </div>
        
        <WalletConnect 
          onConnect={handleWalletConnect}
          connected={!!walletAddress}
          walletAddress={walletAddress}
        />
      </header>
      
      <main className="max-w-7xl mx-auto">
        {!walletAddress ? (
          <div className="game-container text-center py-16">
            <Trophy className="w-16 h-16 mx-auto mb-6 text-jungle-yellow" />
            <h2 className="text-3xl font-luckiest text-jungle-darkGreen mb-4">
              Connect Your Wallet to Play
            </h2>
            <p className="mb-8 text-lg max-w-xl mx-auto">
              Connect your Aptos wallet to start playing the Jungle Cups Game and win APT or Emojicoin tokens!
            </p>
            <WalletConnect 
              onConnect={handleWalletConnect}
              connected={false}
              walletAddress=""
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Area */}
            <div className="lg:col-span-2">
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
            </div>
            
            {/* Stats and Referral */}
            <div className="space-y-6">
              <StatsCard stats={playerStats} />
              
              <ReferralCard 
                walletAddress={walletAddress}
                referrals={playerStats.referrals}
              />
            </div>
          </div>
        )}
      </main>
      
      <footer className="max-w-7xl mx-auto mt-16 text-center">
        <Separator className="mb-6" />
        <div className="text-sm text-muted-foreground">
          <p>© 2023 Jungle Cups Game. All rights reserved.</p>
          <p className="mt-1">
            Powered by the Aptos blockchain. Not affiliated with Aptos Foundation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

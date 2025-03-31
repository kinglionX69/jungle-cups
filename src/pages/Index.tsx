
import { useState, useEffect } from "react";
import WalletConnect from "@/components/WalletConnect";
import Cup from "@/components/Cup";
import BetForm from "@/components/BetForm";
import GameResult from "@/components/GameResult";
import StatsCard from "@/components/StatsCard";
import LeaderboardCard from "@/components/LeaderboardCard";
import ReferralCard from "@/components/ReferralCard";
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
  playWinSound,
  playLoseSound,
  playClickSound,
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
  
  // Leaderboard data
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
      
      // Load leaderboard data
      const leaderboard = await getLeaderboardData();
      if (leaderboard) {
        setLeaderboardData(leaderboard);
      }
    }
  };
  
  // Handle placing a bet and starting the game
  const handlePlaceBet = async (tokenType: string, amount: number) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
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
    
    // Start the game
    startGame();
  };
  
  // Start the game with cup shuffling
  const startGame = () => {
    setGameStarted(true);
    setIsShuffling(true);
    setGameEnded(false);
    setSelectedCup(-1);
    setIsRevealed(false);
    
    // Play shuffle sound
    playShuffleSound();
    
    // Randomize ball position
    const newBallPosition = shuffleCups(ballPosition);
    setBallPosition(newBallPosition);
    
    // Shuffle animation duration
    setTimeout(() => {
      setIsShuffling(false);
      toast({
        title: "Make Your Choice",
        description: "Select a cup where you think the ball is hidden",
      });
    }, 3000);
  };
  
  // Handle cup selection
  const handleCupSelect = (index: number) => {
    if (isShuffling || gameEnded || selectedCup !== -1) return;
    
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
    playClickSound();
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 relative">
      {/* Header with Wallet Connection */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-4xl md:text-5xl font-luckiest text-jungle-darkGreen">
            3 Cups Game 🏆
          </h1>
          <p className="text-jungle-green font-bungee">Find the ball, win the prize!</p>
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
              Connect your Aptos wallet to start playing the 3 Cups Game and win APT or Emojicoin tokens!
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
                  {gameStarted 
                    ? isShuffling 
                      ? "Shuffling Cups..." 
                      : gameEnded 
                        ? playerWon 
                          ? "You Found It! 🎉" 
                          : "Wrong Cup 😢" 
                        : "Select a Cup"
                    : "Place Your Bet"
                  }
                </h2>
                
                {!gameStarted ? (
                  <div className="max-w-md mx-auto">
                    <BetForm 
                      onPlaceBet={handlePlaceBet}
                      disabled={!walletAddress || gameStarted}
                      isEscrowFunded={isEscrowFunded}
                    />
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
                        />
                      ))}
                    </div>
                    {!isShuffling && selectedCup === -1 && (
                      <p className="text-center mt-4 animate-pulse">
                        Click on a cup to make your guess!
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Stats and Leaderboard */}
            <div className="space-y-6">
              <StatsCard stats={playerStats} />
              
              <LeaderboardCard 
                aptLeaders={leaderboardData.aptLeaders}
                emojiLeaders={leaderboardData.emojiLeaders}
              />
              
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
          <p>© 2023 3 Cups Game. All rights reserved.</p>
          <p className="mt-1">
            Powered by the Aptos blockchain. Not affiliated with Aptos Foundation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

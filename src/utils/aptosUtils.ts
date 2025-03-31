
// Aptos wallet integration utilities
export const ESCROW_WALLET_ADDRESS = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"; // Replace with actual escrow wallet
export const EMOJICOIN_ADDRESS = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";

export const MIN_APT_BALANCE = 1; // 1 APT
export const MIN_EMOJICOIN_BALANCE = 1000; // 1000 Emojicoin

// Check if wallet is connected
export const isWalletConnected = async (): Promise<boolean> => {
  if (!window.aptos) return false;
  
  try {
    const { address } = await window.aptos.account();
    return !!address;
  } catch (error) {
    console.error("Error checking wallet connection:", error);
    return false;
  }
};

// Get wallet balance
export const getWalletBalance = async (address: string, tokenType: string = "APT"): Promise<number> => {
  if (!window.aptos) return 0;
  
  try {
    // Simplified implementation - in a real app, you would use the Aptos SDK to query balances
    if (tokenType === "APT") {
      // This would be an API call to get APT balance
      return 10; // Mock balance
    } else {
      // This would be an API call to get Emojicoin balance
      return 5000; // Mock balance
    }
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return 0;
  }
};

// Check if escrow wallet is sufficiently funded
export const checkEscrowFunding = async (): Promise<boolean> => {
  try {
    // In a real implementation, this would make API calls to check the balances
    const aptBalance = 5; // Mock APT balance
    const emojiBalance = 5000; // Mock Emojicoin balance
    
    return aptBalance >= MIN_APT_BALANCE && emojiBalance >= MIN_EMOJICOIN_BALANCE;
  } catch (error) {
    console.error("Error checking escrow funding:", error);
    return false;
  }
};

// Transfer tokens from player to escrow (betting)
export const placeBet = async (
  amount: number, 
  tokenType: string = "APT"
): Promise<boolean> => {
  if (!window.aptos) return false;
  
  try {
    // This would be an actual blockchain transaction in a real implementation
    // For now, we'll just return success
    console.log(`Placing bet of ${amount} ${tokenType}`);
    
    // Simulate a delay for transaction processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error("Error placing bet:", error);
    return false;
  }
};

// Transfer tokens from escrow to player (winning)
export const transferWinnings = async (
  amount: number, 
  tokenType: string = "APT"
): Promise<boolean> => {
  try {
    // This would be an actual blockchain transaction in a real implementation
    console.log(`Transferring winnings of ${amount} ${tokenType}`);
    
    // Simulate a delay for transaction processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error("Error transferring winnings:", error);
    return false;
  }
};

// Check if there's a referral code in the URL
export const getReferralFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("ref") || "";
};

// Track a referral when a new user connects
export const trackReferral = async (newUserAddress: string, referrerAddress: string): Promise<boolean> => {
  try {
    // In a real implementation, this would make an API call to track the referral
    console.log(`Tracking referral: ${referrerAddress} referred ${newUserAddress}`);
    return true;
  } catch (error) {
    console.error("Error tracking referral:", error);
    return false;
  }
};

// Get player stats
export const getPlayerStats = async (address: string): Promise<any> => {
  try {
    // In a real implementation, this would make an API call to get the player's stats
    // For now, we'll return mock data
    return {
      gamesPlayed: 10,
      wins: 6,
      losses: 4,
      winRate: 60,
      aptWon: 2.5,
      emojiWon: 1200,
      referrals: 2,
    };
  } catch (error) {
    console.error("Error getting player stats:", error);
    return null;
  }
};

// Get leaderboard data
export const getLeaderboardData = async (): Promise<any> => {
  try {
    // In a real implementation, this would make an API call to get the leaderboard data
    // For now, we'll return mock data
    const mockAddresses = [
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
      "0x456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123",
      "0x789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456",
      "0xdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abc",
    ];
    
    const aptLeaders = mockAddresses.map((address, i) => ({
      address,
      wins: 20 - i * 3,
      winRate: 80 - i * 5,
      earned: 10 - i,
    }));
    
    const emojiLeaders = mockAddresses.map((address, i) => ({
      address,
      wins: 18 - i * 2,
      winRate: 75 - i * 4,
      earned: 5000 - i * 800,
    }));
    
    return { aptLeaders, emojiLeaders };
  } catch (error) {
    console.error("Error getting leaderboard data:", error);
    return { aptLeaders: [], emojiLeaders: [] };
  }
};

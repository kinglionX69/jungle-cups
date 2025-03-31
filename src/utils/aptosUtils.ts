
// Aptos wallet integration utilities
import { AptosClient, Types } from "aptos";

// Testnet configuration
export const NETWORK = "testnet";
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const EXPLORER_URL = "https://explorer.aptoslabs.com/txn/";
export const FAUCET_URL = "https://faucet.testnet.aptoslabs.com";

// Placeholder escrow wallet for testing
export const ESCROW_WALLET_ADDRESS = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"; // Replace with actual escrow wallet
export const EMOJICOIN_ADDRESS = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";

export const MIN_APT_BALANCE = 1; // 1 APT
export const MIN_EMOJICOIN_BALANCE = 1000; // 1000 Emojicoin

// Initialize Aptos client
const client = new AptosClient(NODE_URL);

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

// Get wallet balance from Aptos blockchain
export const getWalletBalance = async (address: string, tokenType: string = "APT"): Promise<number> => {
  if (!window.aptos) return 0;
  
  try {
    if (tokenType === "APT") {
      // Get native APT balance from chain
      const resources = await client.getAccountResources(address);
      const aptosCoin = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      
      if (aptosCoin) {
        const balance = parseInt((aptosCoin.data as any).coin.value);
        return balance / 100000000; // Convert from octas to APT (8 decimals)
      }
      return 0;
    } else {
      // This would be an API call to get Emojicoin balance
      // For testing purposes, we'll return a mock balance
      return 5000;
    }
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return 0;
  }
};

// Check if escrow wallet is sufficiently funded
export const checkEscrowFunding = async (): Promise<boolean> => {
  try {
    // In a real implementation, this would check the escrow wallet's balance
    return true; // For testnet testing, assume the escrow is funded
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
    console.log(`Placing bet of ${amount} ${tokenType} on Aptos ${NETWORK}`);
    
    if (tokenType === "APT") {
      // Create a transaction payload to transfer APT
      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [
          ESCROW_WALLET_ADDRESS, 
          Math.floor(amount * 100000000).toString() // Convert APT to octas (8 decimals)
        ]
      };
      
      // Sign and submit the transaction
      const response = await window.aptos.signAndSubmitTransaction(payload);
      console.log("Transaction submitted:", response);
      
      // For testing, we would wait for transaction confirmation
      // In production, you'd implement proper transaction tracking
      
      return true;
    } else {
      // For testnet testing, we'll simulate a successful Emojicoin transfer
      // In production, you'd implement the actual token transfer
      console.log(`Simulating transfer of ${amount} ${tokenType} to escrow`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }
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
    // For testnet testing, we'll simulate a successful winnings transfer
    // In a production environment, this would be handled by a backend service
    // that controls the escrow wallet's private key
    console.log(`Simulating transfer of ${amount} ${tokenType} winnings to player`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error("Error transferring winnings:", error);
    return false;
  }
};

// Request testnet tokens from faucet (for testing)
export const requestTestnetTokens = async (address: string): Promise<boolean> => {
  try {
    console.log(`Requesting testnet tokens for ${address}`);
    // This would make an API call to the testnet faucet
    // For now, we'll simulate a successful request
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  } catch (error) {
    console.error("Error requesting testnet tokens:", error);
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

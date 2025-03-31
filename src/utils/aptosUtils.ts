// Aptos wallet integration utilities
import { AptosClient, Types, AptosAccount } from "aptos";
import { supabase } from "@/integrations/supabase/client";

// Testnet configuration
export const NETWORK = "testnet";
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const EXPLORER_URL = "https://explorer.aptoslabs.com/txn/";
export const FAUCET_URL = "https://faucet.testnet.aptoslabs.com";

// Real escrow wallet for the app
export const ESCROW_WALLET_ADDRESS = "0x2afbb09094a37b84d14bc9aaf7deb6dd586acc20b0e3ba8c8c5a7cafd9eb5a0d";
export const EMOJICOIN_ADDRESS = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";

export const MIN_APT_BALANCE = 1; // 1 APT
export const MIN_EMOJICOIN_BALANCE = 1000; // 1000 Emojicoin

// Initialize Aptos client
const client = new AptosClient(NODE_URL);

// Initialize account with APT coin if needed
export const initializeAccount = async (address: string): Promise<boolean> => {
  try {
    console.log(`Checking if account ${address} needs initialization`);
    
    // Check if the account has already registered the coin store
    const resources = await client.getAccountResources(address);
    const hasAptosCoin = resources.some(
      (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    
    if (hasAptosCoin) {
      console.log("Account already has APT coin store registered");
      return true;
    }
    
    console.log("Account needs APT coin store initialization");
    
    // If the wallet doesn't have the APT coin store yet, we need to register it
    if (window.aptos) {
      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: "0x1::managed_coin::register",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: []
      };
      
      const response = await window.aptos.signAndSubmitTransaction(payload);
      console.log("Coin registration transaction submitted:", response);
      
      // Wait for transaction to be confirmed
      await client.waitForTransaction(response.hash);
      console.log("Coin registration confirmed");
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error initializing account:", error);
    return false;
  }
};

// Initialize emojicoin or any other token
export const initializeTokenStore = async (address: string, tokenType: string): Promise<boolean> => {
  try {
    console.log(`Checking if account ${address} needs ${tokenType} initialization`);
    
    let tokenTypeAddress = "";
    
    if (tokenType === "EMOJICOIN") {
      tokenTypeAddress = EMOJICOIN_ADDRESS;
    } else {
      console.log("Unknown token type for initialization");
      return false;
    }
    
    // Check if the account has already registered the coin store
    const resources = await client.getAccountResources(address);
    const hasTokenStore = resources.some(
      (r) => r.type === `0x1::coin::CoinStore<${tokenTypeAddress}>`
    );
    
    if (hasTokenStore) {
      console.log(`Account already has ${tokenType} store registered`);
      return true;
    }
    
    console.log(`Account needs ${tokenType} store initialization`);
    
    // Register the token
    if (window.aptos) {
      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: "0x1::managed_coin::register",
        type_arguments: [tokenTypeAddress],
        arguments: []
      };
      
      const response = await window.aptos.signAndSubmitTransaction(payload);
      console.log(`${tokenType} registration transaction submitted:`, response);
      
      // Wait for transaction to be confirmed
      await client.waitForTransaction(response.hash);
      console.log(`${tokenType} registration confirmed`);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error initializing ${tokenType} store:`, error);
    return false;
  }
};

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
  if (!address) return 0;
  
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
    } else if (tokenType === "EMOJICOIN") {
      // Get Emojicoin balance
      const resources = await client.getAccountResources(address);
      const emojiCoin = resources.find(
        (r) => r.type === `0x1::coin::CoinStore<${EMOJICOIN_ADDRESS}>`
      );
      
      if (emojiCoin) {
        const balance = parseInt((emojiCoin.data as any).coin.value);
        return balance / 100000000; // Assuming same 8 decimals as APT
      }
      return 0;
    }
    
    // Unknown token type
    return 0;
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return 0;
  }
};

// Get escrow wallet balances
export const getEscrowWalletBalances = async (): Promise<{
  apt: number;
  emojicoin: number;
  availableTokens: string[];
}> => {
  try {
    console.log("Checking escrow wallet balances");
    
    // Default return value
    const defaultReturn = {
      apt: 0,
      emojicoin: 0,
      availableTokens: []
    };
    
    if (!ESCROW_WALLET_ADDRESS) {
      console.error("No escrow wallet address configured");
      return defaultReturn;
    }
    
    // Get APT balance
    const aptBalance = await getWalletBalance(ESCROW_WALLET_ADDRESS, "APT");
    console.log("Escrow APT balance:", aptBalance);
    
    // Get Emojicoin balance
    const emojiBalance = await getWalletBalance(ESCROW_WALLET_ADDRESS, "EMOJICOIN");
    console.log("Escrow Emojicoin balance:", emojiBalance);
    
    // Determine which tokens are available for betting
    const availableTokens: string[] = [];
    
    if (aptBalance >= MIN_APT_BALANCE) {
      availableTokens.push("APT");
    }
    
    if (emojiBalance >= MIN_EMOJICOIN_BALANCE) {
      availableTokens.push("EMOJICOIN");
    }
    
    return {
      apt: aptBalance,
      emojicoin: emojiBalance,
      availableTokens
    };
  } catch (error) {
    console.error("Error checking escrow funding:", error);
    return {
      apt: 0,
      emojicoin: 0,
      availableTokens: []
    };
  }
};

// Check if escrow wallet is sufficiently funded
export const checkEscrowFunding = async (): Promise<{
  funded: boolean;
  availableTokens: string[];
}> => {
  try {
    const { apt, emojicoin, availableTokens } = await getEscrowWalletBalances();
    
    // Escrow is considered funded if at least one token type is available
    const funded = availableTokens.length > 0;
    
    return {
      funded,
      availableTokens
    };
  } catch (error) {
    console.error("Error checking escrow funding:", error);
    return {
      funded: false,
      availableTokens: []
    };
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
      
      try {
        // Check if account needs initialization first
        const { address } = await window.aptos.account();
        const isInitialized = await initializeAccount(address);
        
        if (!isInitialized) {
          console.error("Could not initialize account");
          return false;
        }
        
        // Sign and submit the transaction
        const response = await window.aptos.signAndSubmitTransaction(payload);
        console.log("Transaction submitted:", response);
        
        // For testing, we would wait for transaction confirmation
        // In production, you'd implement proper transaction tracking
        
        return true;
      } catch (error: any) {
        console.error("Transaction error:", error);
        
        // Check for specific error cases
        const errorMessage = error.message || "";
        if (errorMessage.includes("CoinStore") && errorMessage.includes("not found")) {
          console.log("CoinStore not found, trying to initialize account first");
          
          const { address } = await window.aptos.account();
          await initializeAccount(address);
          
          // Try again after initialization
          const response = await window.aptos.signAndSubmitTransaction(payload);
          console.log("Transaction after initialization:", response);
          return true;
        }
        
        throw error; // Re-throw for other errors
      }
    } else if (tokenType === "EMOJICOIN") {
      // Initialize Emojicoin store if needed
      const { address } = await window.aptos.account();
      await initializeTokenStore(address, tokenType);
      
      // Create transaction payload for Emojicoin transfer
      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: [EMOJICOIN_ADDRESS],
        arguments: [
          ESCROW_WALLET_ADDRESS, 
          Math.floor(amount * 100000000).toString() // Convert to smallest units (8 decimals)
        ]
      };
      
      // Sign and submit the transaction
      const response = await window.aptos.signAndSubmitTransaction(payload);
      console.log("Emojicoin transaction submitted:", response);
      
      return true;
    } else {
      console.error(`Unsupported token type: ${tokenType}`);
      return false;
    }
  } catch (error) {
    console.error("Error placing bet:", error);
    return false;
  }
};

// Transfer tokens from escrow to player (winning) - Backend API version
export const transferWinnings = async (
  playerAddress: string,
  amount: number, 
  tokenType: string = "APT"
): Promise<boolean> => {
  try {
    if (!playerAddress || amount <= 0) {
      console.error("Invalid parameters for transferring winnings");
      return false;
    }
    
    console.log(`Initiating transfer of ${amount} ${tokenType} to ${playerAddress}`);
    
    // Generate a unique game ID for tracking
    const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Call the Supabase Edge Function to process the payout
    const { data, error } = await supabase.functions.invoke('payout', {
      body: {
        playerAddress,
        amount,
        tokenType,
        gameId
      }
    });
    
    if (error) {
      console.error("Error calling payout function:", error);
      return false;
    }
    
    if (data && data.success) {
      console.log(`Successfully initiated payout of ${amount} ${tokenType} to ${playerAddress}`);
      console.log(`Transaction hash: ${data.transactionHash}`);
      return true;
    } else {
      console.error(`Payout failed: ${data?.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error("Error transferring winnings:", error);
    return false;
  }
};

// Request testnet tokens from faucet (for testing)
export const requestTestnetTokens = async (address: string): Promise<boolean> => {
  try {
    console.log(`Requesting testnet tokens for ${address}`);
    
    // First, ensure the account has a coin store registered
    await initializeAccount(address);
    
    // Implement proper faucet API call (there's no authorized web API for the faucet,
    // but we can inform users to use the official faucet)
    
    // This is a mock implementation - in production, this might be handled by a backend service
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


import { client, EMOJICOIN_ADDRESS, handleApiError, retryRequest } from "./aptosConfig";

// Initialize account with APT coin if needed
export const initializeAccount = async (address: string): Promise<boolean> => {
  if (!address) {
    console.error("No address provided for initialization");
    return false;
  }
  
  try {
    console.log(`Checking if account ${address} needs initialization`);
    
    // Check if the account has already registered the coin store using new SDK
    const resources = await retryRequest(async (client) => {
      return await client.getAccountResources({ 
        accountAddress: address 
      });
    });
    
    const hasAptosCoin = resources.some(
      (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    
    if (hasAptosCoin) {
      console.log("Account already has APT coin store registered");
      return true;
    }
    
    console.log("Account needs APT coin store initialization");
    
    // If the wallet doesn't have the APT coin store yet, we need to register it
    if (!window.aptos) {
      console.error("Wallet not connected or not available");
      return false;
    }
    
    // Use the wallet adapter to send transaction
    const payload = {
      function: "0x1::managed_coin::register",
      typeArguments: ["0x1::aptos_coin::AptosCoin"],
      functionArguments: []
    };
    
    // Add retry logic for transaction submission
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        // Use wallet adapter to sign and submit
        const response = await window.aptos.signAndSubmitTransaction(payload);
        console.log("Coin registration transaction submitted:", response);
        
        // Wait for transaction to be confirmed
        await client.waitForTransaction({
          transactionHash: response.hash
        });
        
        console.log("Coin registration confirmed");
        return true;
      } catch (error) {
        attempts++;
        console.error(`Attempt ${attempts}/${maxAttempts} failed:`, error);
        
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error initializing account:", handleApiError(error));
    return false;
  }
};

// Initialize emojicoin or any other token
export const initializeTokenStore = async (address: string, tokenType: string): Promise<boolean> => {
  if (!address) {
    console.error("No address provided for token initialization");
    return false;
  }
  
  try {
    console.log(`Checking if account ${address} needs ${tokenType} initialization`);
    
    // For testing purposes, we're just using APT for Emojicoin
    // So we check if the APT coin store is registered
    if (tokenType === "EMOJICOIN") {
      console.log("Using APT coin store for Emojicoin (testing only)");
      return await initializeAccount(address);
    }
    
    let tokenTypeAddress = "";
    
    if (tokenType === "EMOJICOIN") {
      tokenTypeAddress = EMOJICOIN_ADDRESS;
    } else {
      console.log("Unknown token type for initialization");
      return false;
    }
    
    return await initializeAccount(address);
  } catch (error) {
    console.error(`Error initializing ${tokenType} store:`, handleApiError(error));
    return false;
  }
};

// Get wallet balance from Aptos blockchain with improved error handling
export const getWalletBalance = async (address: string, tokenType: string = "APT"): Promise<number> => {
  if (!address) {
    console.log("No address provided for balance check");
    return 0;
  }
  
  try {
    if (tokenType === "APT") {
      // Try multiple methods to get APT balance
      console.log(`Fetching APT balance for ${address}`);
      
      // Method 1: Try to get balance using the account info endpoint
      try {
        const accountInfo = await retryRequest(async (client) => {
          return await client.getAccountInfo({ 
            accountAddress: address 
          });
        });
        
        if (accountInfo) {
          console.log("Account info retrieved successfully:", accountInfo);
        }
      } catch (error) {
        console.log("Account info method failed:", error);
      }
      
      // Method 2: Try to get balance using coin API
      try {
        const coinBalance = await retryRequest(async (client) => {
          return await client.getAccountCoinAmount({
            accountAddress: address,
            coinType: "0x1::aptos_coin::AptosCoin"
          });
        });
        
        if (coinBalance !== undefined) {
          const result = coinBalance / 100000000; // Convert from octas to APT (8 decimals)
          console.log(`APT balance (coin API) for ${address}: ${result}`);
          return result;
        }
      } catch (error) {
        console.log("Coin API method failed:", error);
      }
      
      // Method 3: Fallback to resources method
      const resources = await retryRequest(async (client) => {
        return await client.getAccountResources({ 
          accountAddress: address 
        });
      });
      
      console.log(`Found ${resources.length} resources for ${address}`);
      
      const aptosCoin = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      
      if (aptosCoin && aptosCoin.data) {
        const balance = parseInt((aptosCoin.data as any).coin.value);
        const result = balance / 100000000; // Convert from octas to APT (8 decimals)
        console.log(`APT balance (resources) for ${address}: ${result}`);
        return result;
      }
      
      console.log(`No APT coin store found for ${address}`);
      return 0;
    } else if (tokenType === "EMOJICOIN") {
      // For testing, we're using APT for Emojicoin
      const resources = await retryRequest(async (client) => {
        return await client.getAccountResources({ 
          accountAddress: address 
        });
      });
      
      const aptosCoin = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      
      if (aptosCoin) {
        const balance = parseInt((aptosCoin.data as any).coin.value);
        const result = balance / 100000000; // Same conversion as APT for testing
        console.log(`Emojicoin balance (simulated) for ${address}: ${result}`);
        return result;
      }
      
      console.log(`No simulated Emojicoin coin store found for ${address}`);
      return 0;
    }
    
    // Unknown token type
    console.warn(`Unknown token type requested: ${tokenType}`);
    return 0;
  } catch (error) {
    console.error("Error getting wallet balance:", handleApiError(error));
    return 0;
  }
};

// Request testnet tokens from faucet (for testing)
export const requestTestnetTokens = async (address: string): Promise<boolean> => {
  if (!address) {
    console.error("No address provided for testnet token request");
    return false;
  }
  
  try {
    console.log(`Requesting testnet tokens for ${address}`);
    
    // First, ensure the account has a coin store registered
    const initialized = await initializeAccount(address);
    
    if (!initialized) {
      console.error("Could not initialize account");
      return false;
    }
    
    // In a real implementation, we would call a faucet API here
    // For now, we'll simulate a successful request and tell the user
    // to use the official faucet if needed
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Open faucet in a new tab
    window.open("https://aptoslabs.com/testnet-faucet", "_blank");
    
    return true;
  } catch (error) {
    console.error("Error requesting testnet tokens:", handleApiError(error));
    return false;
  }
};

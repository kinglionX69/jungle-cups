
import { client, EMOJICOIN_ADDRESS } from "./aptosConfig";

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
      const payload = {
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
    
    // This part will be used in mainnet but is commented out for testing
    /*
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
      const payload = {
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
    */
    
    return false;
  } catch (error) {
    console.error(`Error initializing ${tokenType} store:`, error);
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
      // For testing, we're using APT for Emojicoin
      // This will be replaced with real Emojicoin in mainnet
      const resources = await client.getAccountResources(address);
      const aptosCoin = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      
      if (aptosCoin) {
        const balance = parseInt((aptosCoin.data as any).coin.value);
        return balance / 100000000; // Same conversion as APT for testing
      }
      return 0;
      
      // This part will be used in mainnet but is commented out for testing
      /*
      // Get Emojicoin balance
      const resources = await client.getAccountResources(address);
      const emojiCoin = resources.find(
        (r) => r.type === `0x1::coin::CoinStore<${EMOJICOIN_ADDRESS}>`
      );
      
      if (emojiCoin) {
        const balance = parseInt((emojiCoin.data as any).coin.value);
        return balance / 100000000; // Assuming same 8 decimals as APT
      }
      */
    }
    
    // Unknown token type
    return 0;
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return 0;
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

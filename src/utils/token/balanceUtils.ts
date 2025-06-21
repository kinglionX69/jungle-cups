
import { client, handleApiError, retryRequest } from "../aptosConfig";

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


import { client, EMOJICOIN_ADDRESS, handleApiError, retryRequest } from "../aptosConfig";

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

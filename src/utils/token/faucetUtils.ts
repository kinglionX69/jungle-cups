
import { handleApiError } from "../aptosConfig";
import { initializeAccount } from "./accountInitialization";

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

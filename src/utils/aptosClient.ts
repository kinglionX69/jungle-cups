
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { client } from "./aptosConfig";

// Check if wallet is connected
export const isWalletConnected = async (): Promise<boolean> => {
  try {
    // Modern way to check connection status through wallet adapter
    if (typeof window !== 'undefined' && window.aptos) {
      const account = await window.aptos.account();
      return !!account.address;
    }
    return false;
  } catch (error) {
    console.error("Error checking wallet connection:", error);
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


import { AptosClient, Types } from "aptos";
import { client, NODE_URL } from "./aptosConfig";

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

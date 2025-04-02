
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useReferralSystem = (walletAddress: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const { toast } = useToast();

  // Generate a referral code when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      // Format: "proud-lions-cups-" + last 5 digits of wallet address
      const lastFiveDigits = walletAddress.substring(walletAddress.length - 5);
      setReferralCode(`proud-lions-cups-${lastFiveDigits}`);
    } else {
      setReferralCode("");
    }
  }, [walletAddress]);

  // Check for referral in URL on component mount
  useEffect(() => {
    if (walletAddress) {
      checkForReferralCode();
    }
  }, [walletAddress]);

  // Process a referral code from URL
  const checkForReferralCode = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    
    if (!refCode || !walletAddress) {
      return; // No referral code or not connected
    }
    
    // Don't process if it's the user's own code
    if (refCode === referralCode) {
      console.log("Self-referral detected, ignoring");
      return;
    }
    
    await processReferralCode(refCode);
    
    // Remove referral param from URL without page reload
    const newUrl = window.location.pathname;
    window.history.pushState({}, "", newUrl);
  };

  // Apply a referral code manually entered by user
  const applyReferralCode = async (code: string): Promise<boolean> => {
    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }
    
    if (code === referralCode) {
      toast({
        title: "Invalid Code",
        description: "You cannot use your own referral code",
        variant: "destructive",
      });
      return false;
    }
    
    return await processReferralCode(code);
  };

  // Common function to process referral codes
  const processReferralCode = async (code: string): Promise<boolean> => {
    try {
      setIsProcessing(true);
      
      // Check if this wallet has already been referred
      const { data: existingReferral, error: checkError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_address', walletAddress)
        .single();
      
      if (!checkError && existingReferral) {
        toast({
          title: "Already Referred",
          description: "You have already been referred by another player",
          variant: "destructive",
        });
        return false;
      }
      
      // Find the referrer wallet from the referral code
      // We need to look at the last 5 characters of the code and match with wallet addresses
      const lastFiveDigits = code.substring(code.length - 5);
      
      // Find a wallet address that ends with these digits
      const { data: referrerData, error: referrerError } = await supabase
        .from('player_stats')
        .select('wallet_address')
        .filter('wallet_address', 'ilike', `%${lastFiveDigits}`)
        .single();
      
      if (referrerError || !referrerData) {
        toast({
          title: "Invalid Code",
          description: "No matching referrer found for this code",
          variant: "destructive",
        });
        return false;
      }
      
      const referrerAddress = referrerData.wallet_address;
      
      // Don't allow self-referrals
      if (referrerAddress === walletAddress) {
        toast({
          title: "Invalid Code",
          description: "You cannot use your own referral code",
          variant: "destructive",
        });
        return false;
      }
      
      // Create new referral record
      const { error: insertError } = await supabase
        .from('referrals')
        .insert([
          { referrer_address: referrerAddress, referred_address: walletAddress }
        ]);
        
      if (insertError) {
        console.error("Error creating referral:", insertError);
        toast({
          title: "Error",
          description: "Failed to apply referral code. Please try again.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Referral Applied!",
        description: "Thanks for growing the Pride! When your friend plays their first game with your code, your referral will reflect. Refer 10 friends to win 1 APT!",
      });
      
      return true;
    } catch (error) {
      console.error("Error processing referral:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while processing the referral",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Activate a referral after first game
  const activateReferral = async (): Promise<boolean> => {
    if (!walletAddress) return false;
    
    try {
      // Call the function to activate the referral
      const { error } = await supabase.rpc('activate_referral', {
        referred_wallet: walletAddress
      });
      
      if (error) {
        console.error("Error activating referral:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in activateReferral:", error);
      return false;
    }
  };
  
  return {
    referralCode,
    isProcessing,
    checkForReferralCode,
    applyReferralCode,
    activateReferral
  };
};

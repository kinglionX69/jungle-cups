
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
      // Use shortened wallet address as referral code
      setReferralCode(walletAddress.substring(0, 10));
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

  // Process a referral link
  const checkForReferralCode = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    
    if (!refCode || !walletAddress || refCode === walletAddress.substring(0, 10)) {
      return; // No referral code or self-referral
    }
    
    try {
      setIsProcessing(true);
      
      // Find the full wallet address from the referral code
      const { data: referrerData, error: referrerError } = await supabase
        .from('player_stats')
        .select('wallet_address')
        .ilike('wallet_address', `${refCode}%`)
        .single();
      
      if (referrerError || !referrerData) {
        console.log("No matching referrer found for code:", refCode);
        return;
      }
      
      const referrerAddress = referrerData.wallet_address;
      
      // Check if this user has already been referred
      const { data: existingReferral, error: checkError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_address', walletAddress)
        .single();
      
      if (!checkError && existingReferral) {
        console.log("User has already been referred");
        return;
      }
      
      // Create new referral record
      const { error: insertError } = await supabase
        .from('referrals')
        .insert([
          { referrer_address: referrerAddress, referred_address: walletAddress }
        ]);
        
      if (insertError) {
        console.error("Error creating referral:", insertError);
        return;
      }
      
      // Update referrer's referral count
      const { error: updateError } = await supabase.rpc('increment_referral_count', {
        referrer_wallet: referrerAddress
      });
      
      if (updateError) {
        console.error("Error updating referral count:", updateError);
      } else {
        toast({
          title: "Referral Applied!",
          description: "You've been successfully referred by another player.",
        });
        
        // Remove referral param from URL without page reload
        const newUrl = window.location.pathname;
        window.history.pushState({}, "", newUrl);
      }
    } catch (error) {
      console.error("Error processing referral:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    referralCode,
    isProcessing,
    checkForReferralCode
  };
};

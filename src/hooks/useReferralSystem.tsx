
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

  // Common function to process referral codes via Edge Function
  const processReferralCode = async (code: string): Promise<boolean> => {
    try {
      setIsProcessing(true);

      // Self-referral guard (quick client-side check); server validates again
      if (code === referralCode) {
        toast({
          title: "Invalid Code",
          description: "You cannot use your own referral code",
          variant: "destructive",
        });
        return false;
      }

      // Delegate validation and insertion to server (service role)
      const { data, error } = await supabase.functions.invoke('referral', {
        body: {
          playerAddress: walletAddress,
          code,
        },
      });

      if (error || !data?.success) {
        console.error("Referral apply error:", error || data);
        toast({
          title: "Error",
          description: data?.message || "Failed to apply referral code. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success!",
        description: "Referral code applied successfully.",
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

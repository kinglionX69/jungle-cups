
import { useToast } from "@/components/ui/use-toast";
import { requestTestnetTokens } from "@/utils/aptosUtils";

interface UseTestnetTokensProps {
  walletAddress: string;
  initializeWallet: () => Promise<boolean>;
}

export function useTestnetTokens({ walletAddress, initializeWallet }: UseTestnetTokensProps) {
  const { toast } = useToast();

  const getTestnetTokens = async () => {
    if (!walletAddress) return;
    
    toast({
      title: "Requesting Tokens",
      description: "Requesting testnet tokens. Please wait...",
    });
    
    // Check if account is initialized first
    await initializeWallet();
    
    const success = await requestTestnetTokens(walletAddress);
    
    if (success) {
      toast({
        title: "Success",
        description: "Testnet tokens have been requested. Please go to https://aptoslabs.com/testnet-faucet to claim tokens.",
      });
    } else {
      toast({
        title: "Request Failed",
        description: "Failed to initialize account. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return {
    getTestnetTokens
  };
}

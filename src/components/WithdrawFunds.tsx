
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { withdrawWinnings } from "@/utils/aptosUtils";

interface WithdrawFundsProps {
  walletAddress: string;
  aptBalance: number;
  emojiBalance: number;
  onWithdrawComplete: () => void;
}

const WithdrawFunds = ({ 
  walletAddress, 
  aptBalance, 
  emojiBalance, 
  onWithdrawComplete 
}: WithdrawFundsProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [tokenType, setTokenType] = useState<string>("APT");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get maximum available balance based on selected token
  const maxBalance = tokenType === "APT" ? aptBalance : emojiBalance;
  
  // Set max amount based on token type
  const setMaxAmount = () => {
    setAmount(maxBalance.toString());
  };

  // Handle withdraw request
  const handleWithdraw = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > maxBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${maxBalance} ${tokenType} available to withdraw`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const success = await withdrawWinnings(withdrawAmount, tokenType);

      if (success) {
        toast({
          title: "Withdrawal Successful",
          description: `${withdrawAmount} ${tokenType} has been sent to your wallet`,
        });
        setAmount("");
        onWithdrawComplete();
      } else {
        toast({
          title: "Withdrawal Failed",
          description: "There was an error processing your withdrawal",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-jungle-green">
      <h3 className="text-xl text-jungle-darkGreen">Withdraw Winnings</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="token-type" className="text-sm font-medium">Token Type</label>
            <span className="text-sm text-muted-foreground">
              Balance: {tokenType === "APT" ? aptBalance : emojiBalance} {tokenType}
            </span>
          </div>
          
          <Select 
            value={tokenType} 
            onValueChange={setTokenType}
            disabled={isProcessing}
          >
            <SelectTrigger id="token-type" className="w-full input-field">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APT">APT</SelectItem>
              <SelectItem value="EMOJICOIN">EMOJICOIN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="amount" className="text-sm font-medium">Amount</label>
            <button 
              onClick={setMaxAmount} 
              className="text-xs text-jungle-green hover:underline"
              disabled={isProcessing}
            >
              Max
            </button>
          </div>
          
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            min="0"
            step="0.01"
            max={maxBalance}
            disabled={isProcessing}
          />
        </div>
        
        <Button 
          onClick={handleWithdraw} 
          className="jungle-btn w-full" 
          disabled={!amount || isProcessing || parseFloat(amount) <= 0 || parseFloat(amount) > maxBalance}
        >
          {isProcessing ? "Processing..." : `Withdraw ${tokenType}`}
        </Button>
      </div>
    </div>
  );
};

export default WithdrawFunds;

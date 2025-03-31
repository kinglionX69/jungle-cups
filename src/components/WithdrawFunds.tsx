
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayerStats } from "@/types/gameTypes";
import { CreditCard, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EXPLORER_URL } from "@/utils/aptosConfig";

interface WithdrawFundsProps {
  stats: PlayerStats;
  isWithdrawing: boolean;
  onWithdraw: (amount: number, tokenType: string) => Promise<boolean>;
}

const MIN_APT_WITHDRAWAL = 0.1;
// Reduced for testing purposes
const MIN_EMOJICOIN_WITHDRAWAL = 0.1; // Will be increased for mainnet

const WithdrawFunds = ({ stats, isWithdrawing, onWithdraw }: WithdrawFundsProps) => {
  const [tokenType, setTokenType] = useState<string>("APT");
  const [amount, setAmount] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const { toast } = useToast();
  
  // Get current balance based on token type
  const getCurrentBalance = () => {
    return tokenType === "APT" ? stats.aptWon : stats.emojiWon;
  };
  
  // Get minimum withdrawal amount
  const getMinWithdrawal = () => {
    return tokenType === "APT" ? MIN_APT_WITHDRAWAL : MIN_EMOJICOIN_WITHDRAWAL;
  };
  
  // Handle withdrawal
  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);
    const minWithdrawal = getMinWithdrawal();
    const currentBalance = getCurrentBalance();
    
    // Validate amount
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }
    
    // Check minimum withdrawal
    if (amountNum < minWithdrawal) {
      toast({
        title: "Amount Too Small",
        description: `Minimum withdrawal is ${minWithdrawal} ${tokenType}`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if enough balance
    if (amountNum > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${currentBalance} ${tokenType} available`,
        variant: "destructive",
      });
      return;
    }
    
    // Process withdrawal
    const success = await onWithdraw(amountNum, tokenType);
    
    if (success) {
      setAmount("");
      // Store transaction hash for explorer link (would need to be passed from the hook)
      // This would need to be modified to capture the actual transaction hash
      
      toast({
        title: "Withdrawal Initiated",
        description: `${amountNum} ${tokenType} withdrawal has been initiated. Check your wallet for the transaction!`,
      });
    }
  };
  
  // Reset amount when token type changes
  const handleTokenChange = (value: string) => {
    setTokenType(value);
    setAmount("");
  };
  
  // Format the balance display
  const formatBalance = (balance: number) => {
    if (tokenType === "APT") {
      return balance.toFixed(2);
    }
    return balance.toFixed(2); // Same formatting for testing
  };
  
  // Check if user has any balance to withdraw
  const hasWithdrawableBalance = stats.aptWon > 0 || stats.emojiWon > 0;
  
  return (
    <div className="stats-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-jungle-green" />
        <h3 className="text-lg font-luckiest text-jungle-darkGreen">Withdraw Funds</h3>
      </div>
      
      {!hasWithdrawableBalance ? (
        <p className="text-sm text-muted-foreground">You don't have any winnings to withdraw yet. Play and win to earn tokens!</p>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <Select 
                value={tokenType} 
                onValueChange={handleTokenChange}
              >
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APT" disabled={stats.aptWon <= 0}>
                    APT {stats.aptWon <= 0 && "(No balance)"}
                  </SelectItem>
                  <SelectItem value="EMOJICOIN" disabled={stats.emojiWon <= 0}>
                    🦁♥️ Emojicoin (Testing) {stats.emojiWon <= 0 && "(No balance)"}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs mt-1">
                Available: <span className="font-semibold">{formatBalance(getCurrentBalance())} {tokenType}</span>
              </p>
            </div>
            
            <div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Amount (min: ${getMinWithdrawal()})`}
                className="input-field"
                min={getMinWithdrawal()}
                step={tokenType === "APT" ? "0.1" : "0.1"} // Same step for testing
              />
            </div>
            
            <Button 
              className="jungle-btn w-full" 
              onClick={handleWithdraw}
              disabled={isWithdrawing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > getCurrentBalance()}
            >
              {isWithdrawing ? "Processing..." : "Withdraw to Wallet"}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Withdrawals are processed on the Aptos blockchain. Tokens will be transferred directly to your connected wallet.
            </p>

            {tokenType === "EMOJICOIN" && (
              <p className="text-xs text-amber-600 mt-2">
                Note: For testing purposes, we're using APT for 🦁♥️ Emojicoin transactions. 
                This will be replaced with the real Emojicoin token on mainnet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WithdrawFunds;

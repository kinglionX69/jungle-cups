
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface BetFormProps {
  onPlaceBet: (tokenType: string, amount: number) => void;
  disabled: boolean;
  isEscrowFunded: boolean;
  availableTokens: string[];
}

const BetForm = ({ onPlaceBet, disabled, isEscrowFunded, availableTokens }: BetFormProps) => {
  const [tokenType, setTokenType] = useState<string>("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  // Define minimum bet amounts for each token type
  const MIN_APT_BET = 0.01;
  // Reduced Emojicoin minimum bet for testing purposes
  const MIN_EMOJICOIN_BET = 0.01; // Will be increased for mainnet

  // Initialize token type when available tokens change
  useEffect(() => {
    if (availableTokens.length > 0 && !availableTokens.includes(tokenType)) {
      setTokenType(availableTokens[0]);
    }
  }, [availableTokens, tokenType]);

  // Get the current minimum bet based on selected token
  const getCurrentMinBet = () => {
    return tokenType === "APT" ? MIN_APT_BET : MIN_EMOJICOIN_BET;
  };

  // Reset amount when token type changes
  useEffect(() => {
    setAmount("");
  }, [tokenType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenType) {
      toast({
        title: "Token Required",
        description: "Please select a token type",
        variant: "destructive",
      });
      return;
    }
    
    const minBet = getCurrentMinBet();
    const amountNum = parseFloat(amount);
    
    if (!amount || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    if (amountNum < minBet) {
      toast({
        title: "Bet Too Small",
        description: `Minimum bet is ${minBet} ${tokenType}`,
        variant: "destructive",
      });
      return;
    }
    
    onPlaceBet(tokenType, amountNum);
  };

  // Check if form is valid (amount is entered and meets minimum)
  const isFormValid = tokenType !== "" && amount !== "" && parseFloat(amount) >= getCurrentMinBet();

  // Check if no tokens are available
  const noTokensAvailable = availableTokens.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="font-luckiest text-lg text-jungle-darkGreen">Select Token</label>
        <Select
          value={tokenType || ""}
          onValueChange={setTokenType}
          disabled={disabled || noTokensAvailable}
        >
          <SelectTrigger className="input-field">
            <SelectValue placeholder={noTokensAvailable ? "No tokens available" : "Select token"} />
          </SelectTrigger>
          <SelectContent>
            {availableTokens.includes("APT") && (
              <SelectItem value="APT">APT</SelectItem>
            )}
            {availableTokens.includes("EMOJICOIN") && (
              <SelectItem value="EMOJICOIN">🦁♥️ Emojicoin (Testing)</SelectItem>
            )}
            {noTokensAvailable && (
              <SelectItem value="" disabled>No tokens available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="font-luckiest text-lg text-jungle-darkGreen">Bet Amount</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={tokenType ? `Min: ${getCurrentMinBet()} ${tokenType}` : "Select token first"}
          className="input-field"
          min={tokenType ? getCurrentMinBet() : 0}
          step={tokenType === "APT" ? "0.01" : "0.01"} // Same step for testing
          disabled={disabled || !tokenType || noTokensAvailable}
        />
        {tokenType && (
          <span className="text-xs text-muted-foreground">
            Minimum bet: {getCurrentMinBet()} {tokenType} {tokenType === "EMOJICOIN" && "(Testing mode)"}
          </span>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="jungle-btn w-full" 
        disabled={disabled || !isEscrowFunded || !isFormValid || noTokensAvailable}
      >
        {!isEscrowFunded
          ? "⚠️ Game unavailable: Escrow wallet is low on funds"
          : noTokensAvailable
            ? "No tokens available for betting"
            : "Place Bet"}
      </Button>

      {noTokensAvailable && isEscrowFunded && (
        <p className="text-xs text-red-500 text-center">
          The escrow wallet currently has no tokens available for payouts.
          Please check back later.
        </p>
      )}
      
      {tokenType === "EMOJICOIN" && (
        <p className="text-xs text-amber-600 text-center mt-2">
          Note: For testing purposes, we're using APT for 🦁♥️ Emojicoin transactions. 
          This will be replaced with the real Emojicoin token on mainnet.
        </p>
      )}
    </form>
  );
};

export default BetForm;

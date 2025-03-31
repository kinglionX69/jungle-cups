
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
}

const BetForm = ({ onPlaceBet, disabled, isEscrowFunded }: BetFormProps) => {
  const [tokenType, setTokenType] = useState("APT");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  // Define minimum bet amounts for each token type
  const MIN_APT_BET = 0.01;
  const MIN_EMOJICOIN_BET = 1000;

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
  const isFormValid = amount !== "" && parseFloat(amount) >= getCurrentMinBet();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="font-luckiest text-lg text-jungle-darkGreen">Select Token</label>
        <Select
          value={tokenType}
          onValueChange={setTokenType}
          disabled={disabled}
        >
          <SelectTrigger className="input-field">
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="APT">APT</SelectItem>
            <SelectItem value="EMOJICOIN">🦁♥️ Emojicoin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="font-luckiest text-lg text-jungle-darkGreen">Bet Amount</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Min: ${getCurrentMinBet()} ${tokenType}`}
          className="input-field"
          min={getCurrentMinBet()}
          step={tokenType === "APT" ? "0.01" : "100"}
          disabled={disabled}
        />
        <span className="text-xs text-muted-foreground">
          Minimum bet: {getCurrentMinBet()} {tokenType}
        </span>
      </div>
      
      <Button 
        type="submit" 
        className="jungle-btn w-full" 
        disabled={disabled || !isEscrowFunded || !isFormValid}
      >
        {!isEscrowFunded
          ? "⚠️ Game unavailable: Escrow wallet is low on funds"
          : "Place Bet"}
      </Button>
    </form>
  );
};

export default BetForm;

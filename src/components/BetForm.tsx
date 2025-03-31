
import { useState } from "react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    onPlaceBet(tokenType, parseFloat(amount));
  };

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
          placeholder="Enter bet amount"
          className="input-field"
          min="0.1"
          step="0.1"
          disabled={disabled}
        />
      </div>
      
      <Button 
        type="submit" 
        className="jungle-btn w-full" 
        disabled={disabled || !isEscrowFunded}
      >
        {!isEscrowFunded
          ? "⚠️ Game unavailable: Escrow wallet is low on funds"
          : "Start Game"}
      </Button>
    </form>
  );
};

export default BetForm;

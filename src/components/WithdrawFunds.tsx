
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { PlayerStats } from "@/types/gameTypes";
import { motion } from "framer-motion";

interface WithdrawFundsProps {
  stats: PlayerStats;
  isWithdrawing: boolean;
  onWithdraw: (amount: number, tokenType: string) => Promise<boolean>;
}

const WithdrawFunds = ({ stats, isWithdrawing, onWithdraw }: WithdrawFundsProps) => {
  const [amount, setAmount] = useState<string>("");
  const [tokenType, setTokenType] = useState<string>("APT");
  
  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    await onWithdraw(Number(amount), tokenType);
    setAmount(""); // Clear the input after withdrawal
  };
  
  const maxAmount = tokenType === "APT" ? stats.aptWon : stats.emojiWon;
  const isInvalidAmount = !amount || isNaN(Number(amount)) || Number(amount) <= 0 || Number(amount) > maxAmount;
  
  const handleSetMaxAmount = () => {
    setAmount(maxAmount.toString());
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5" />
          Withdraw Winnings
        </CardTitle>
        <CardDescription>
          Transfer your winnings to your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token-type">Select Token</Label>
          <RadioGroup 
            value={tokenType}
            onValueChange={setTokenType}
            className="flex space-x-2"
            id="token-type"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="APT" id="apt" />
              <Label htmlFor="apt" className="cursor-pointer">APT</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="EMOJICOIN" id="emoji" />
              <Label htmlFor="emoji" className="cursor-pointer">EMOJICOIN</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="amount">Amount</Label>
            <span className="text-sm text-muted-foreground">
              Available: {tokenType === "APT" ? stats.aptWon.toFixed(2) : stats.emojiWon.toFixed(0)} {tokenType}
            </span>
          </div>
          <div className="flex space-x-2">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter ${tokenType} amount`}
              min="0"
              step={tokenType === "APT" ? "0.01" : "1"}
              disabled={isWithdrawing}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSetMaxAmount}
              disabled={maxAmount <= 0 || isWithdrawing}
            >
              Max
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleWithdraw} 
          disabled={isInvalidAmount || isWithdrawing} 
          className="w-full"
        >
          {isWithdrawing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Withdraw {amount ? amount : "0"} {tokenType}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WithdrawFunds;

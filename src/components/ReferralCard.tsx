
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useReferralSystem } from "@/hooks/useReferralSystem";

interface ReferralCardProps {
  walletAddress: string;
  referrals: number;
}

const ReferralCard = ({ walletAddress, referrals }: ReferralCardProps) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const { 
    referralCode, 
    applyReferralCode, 
    isProcessing 
  } = useReferralSystem(walletAddress);
  
  // Calculate progress percentage (0-100%)
  const progressPercentage = Math.min(referrals * 10, 100);
  
  const copyToClipboard = () => {
    // Changed to copy only the referral code, not the full URL
    navigator.clipboard.writeText(referralCode).then(
      () => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Thanks for growing the Pride! When your friend plays their first game with your code, your referral will reflect. Refer 10 friends to win 1 APT!",
        });
        
        setTimeout(() => setIsCopied(false), 3000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy referral code",
          variant: "destructive",
        });
      }
    );
  };

  const handleApplyReferralCode = async () => {
    if (!referralCodeInput) {
      toast({
        title: "Error",
        description: "Please enter a referral code",
        variant: "destructive",
      });
      return;
    }

    // Ensure users can't use their own code
    if (referralCodeInput === referralCode) {
      toast({
        title: "Invalid Code",
        description: "You cannot use your own referral code",
        variant: "destructive",
      });
      return;
    }

    const success = await applyReferralCode(referralCodeInput);
    
    if (success) {
      setReferralCodeInput("");
      toast({
        title: "Success!",
        description: "Referral code applied successfully.",
      });
    }
  };

  return (
    <Card className="stats-card">
      <CardHeader>
        <CardTitle className="text-xl text-center">Referral Program</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-center">
          Share your referral link and earn 5% bonus on the first 3 wins of new users!
        </p>
        
        <div className="flex flex-col space-y-2">
          <span className="text-sm text-muted-foreground">Your referral code:</span>
          <div className="flex items-center">
            <div className="bg-white rounded-l-lg border border-r-0 border-jungle-green px-3 py-2 truncate flex-1">
              {referralCode}
            </div>
            <Button 
              onClick={copyToClipboard}
              className="rounded-l-none rounded-r-lg bg-jungle-green hover:bg-jungle-darkGreen"
            >
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        
        {/* Referral Code Input */}
        <div className="pt-2 space-y-2">
          <span className="text-sm text-muted-foreground">Have a referral code?</span>
          <div className="flex items-center gap-2">
            <Input
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value)}
              placeholder="Enter referral code"
              className="flex-1"
            />
            <Button 
              onClick={handleApplyReferralCode}
              disabled={isProcessing || !referralCodeInput}
              className="bg-jungle-yellow hover:bg-jungle-yellow/80 text-jungle-darkGreen"
            >
              Apply
            </Button>
          </div>
        </div>
        
        {/* Referral Progress */}
        <div className="space-y-2 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Referral Progress:</span>
            <span className="text-sm font-bold">{referrals}/10</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Refer 10 friends to win 1 APT bonus!
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <span>Active Referrals:</span>
          <span className="font-bold text-jungle-green text-xl">{referrals}</span>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Referrals only become active when your friends play their first game.
          You can use a different referral code for each bet you make.
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralCard;

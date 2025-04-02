
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useReferralSystem } from "@/hooks/useReferralSystem";
import { Clipboard, Users } from "lucide-react";

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
    navigator.clipboard.writeText(referralCode).then(
      () => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Thanks for growing the Pride! Refer 10 friends to win 1 APT!",
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
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
          <Users className="h-5 w-5 text-jungle-green" />
          Referrals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress and Status */}
        <div className="bg-white/50 rounded-lg p-2 border border-jungle-green/10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress: {referrals}/10</span>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-center mt-1 text-muted-foreground">
            Refer 10 friends to win 1 APT!
          </p>
        </div>
        
        {/* Referral Code */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input 
              value={referralCode}
              readOnly
              className="pr-10 bg-white/80 border-jungle-green/30"
            />
            <Button 
              size="sm"
              variant="ghost" 
              className="absolute right-0 top-0 h-full px-2"
              onClick={copyToClipboard}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            size="sm"
            onClick={copyToClipboard}
            className="bg-jungle-green hover:bg-jungle-darkGreen whitespace-nowrap"
          >
            {isCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
        
        {/* Apply Referral */}
        <div className="flex gap-2">
          <Input
            value={referralCodeInput}
            onChange={(e) => setReferralCodeInput(e.target.value)}
            placeholder="Enter referral code"
            className="flex-1 bg-white/80 border-jungle-green/30"
            size="sm"
          />
          <Button 
            size="sm"
            onClick={handleApplyReferralCode}
            disabled={isProcessing || !referralCodeInput}
            className="bg-jungle-yellow hover:bg-jungle-yellow/80 text-jungle-darkGreen whitespace-nowrap"
          >
            Apply
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Referrals become active when your friends play their first game. You can use a different code for each bet.
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralCard;

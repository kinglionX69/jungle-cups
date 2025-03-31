
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ReferralCardProps {
  walletAddress: string;
  referrals: number;
}

const ReferralCard = ({ walletAddress, referrals }: ReferralCardProps) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  
  // Create referral link based on wallet address
  const referralLink = `${window.location.origin}?ref=${walletAddress}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(
      () => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Referral link copied to clipboard",
        });
        
        setTimeout(() => setIsCopied(false), 3000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy referral link",
          variant: "destructive",
        });
      }
    );
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
          <span className="text-sm text-muted-foreground">Your referral link:</span>
          <div className="flex items-center">
            <div className="bg-white rounded-l-lg border border-r-0 border-jungle-green px-3 py-2 truncate flex-1">
              {referralLink}
            </div>
            <Button 
              onClick={copyToClipboard}
              className="rounded-l-none rounded-r-lg bg-jungle-green hover:bg-jungle-darkGreen"
            >
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <span>Active Referrals:</span>
          <span className="font-bold text-jungle-green text-xl">{referrals}</span>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Referral bonus will be automatically credited to your wallet after referred users win.
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralCard;

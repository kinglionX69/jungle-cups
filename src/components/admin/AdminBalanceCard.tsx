
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, TrendingUp, AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { requestTestnetTokens } from "@/utils/tokenManagement";
import { ESCROW_WALLET_ADDRESS } from "@/utils/aptosConfig";

interface AdminBalanceCardProps {
  balances: {
    apt: number;
    emojicoin: number;
    availableTokens: string[];
  };
  isLoading: boolean;
}

const AdminBalanceCard = ({ balances, isLoading }: AdminBalanceCardProps) => {
  const { toast } = useToast();
  const [isRequestingTokens, setIsRequestingTokens] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("10");

  const handleRequestTokens = async () => {
    try {
      setIsRequestingTokens(true);
      const success = await requestTestnetTokens(ESCROW_WALLET_ADDRESS);
      
      if (success) {
        toast({
          title: "Tokens Requested",
          description: "Testnet tokens have been requested. Check the faucet page for details.",
        });
      } else {
        toast({
          title: "Request Failed",
          description: "Failed to request testnet tokens. Please try the manual faucet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting tokens:", error);
      toast({
        title: "Error",
        description: "An error occurred while requesting tokens",
        variant: "destructive",
      });
    } finally {
      setIsRequestingTokens(false);
    }
  };

  const handleManualFunding = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Open the faucet with the escrow wallet address
    const faucetUrl = `https://aptoslabs.com/testnet-faucet?address=${ESCROW_WALLET_ADDRESS}`;
    window.open(faucetUrl, "_blank");
    
    toast({
      title: "Manual Funding",
      description: "Faucet opened in new tab. Request tokens manually.",
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalValue = balances.apt + (balances.emojicoin * 0.001);
  const isLowFunds = balances.availableTokens.length === 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-jungle-green/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">APT Balance</CardTitle>
            <Coins className="h-4 w-4 text-jungle-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-jungle-darkGreen">
              {balances.apt.toFixed(4)} APT
            </div>
            <Badge 
              variant={balances.availableTokens.includes("APT") ? "default" : "destructive"}
              className="mt-2"
            >
              {balances.availableTokens.includes("APT") ? "Available" : "Low Funds"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-jungle-orange/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emojicoin Balance</CardTitle>
            <span className="text-lg">🦁♥️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-jungle-darkGreen">
              {balances.emojicoin.toFixed(4)} EMJ
            </div>
            <Badge 
              variant={balances.availableTokens.includes("EMOJICOIN") ? "default" : "destructive"}
              className="mt-2"
            >
              {balances.availableTokens.includes("EMOJICOIN") ? "Available" : "Low Funds"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-jungle-darkGreen">
              {isLowFunds ? "⚠️ Alert" : "✅ Active"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {balances.availableTokens.length} token{balances.availableTokens.length !== 1 ? 's' : ''} available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funding Actions */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Fund Escrow Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customAmount">Request Amount (APT)</Label>
              <Input
                id="customAmount"
                type="number"
                step="1"
                min="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleRequestTokens}
                disabled={isRequestingTokens}
                className="flex-1"
              >
                {isRequestingTokens ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Auto Request
                  </>
                )}
              </Button>
              <Button 
                onClick={handleManualFunding}
                variant="outline"
              >
                Manual Fund
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Auto Request:</strong> Opens faucet automatically with escrow address</p>
            <p><strong>Manual Fund:</strong> Opens faucet for manual token request</p>
          </div>
        </CardContent>
      </Card>

      {isLowFunds && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-800">Low Funds Alert</h3>
            </div>
            <p className="text-sm text-red-700 mb-4">
              The escrow wallet has insufficient funds for payouts. Players cannot place bets until funds are added.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleRequestTokens}
                disabled={isRequestingTokens}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                {isRequestingTokens ? "Requesting..." : "Request Tokens Now"}
              </Button>
              <Button 
                onClick={handleManualFunding}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Manual Fund
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBalanceCard;

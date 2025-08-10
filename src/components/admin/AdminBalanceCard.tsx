import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
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
  const [isTesting, setIsTesting] = useState(false);

  const openFaucet = () => {
    const explorerUrl = `https://explorer.aptoslabs.com/account/${ESCROW_WALLET_ADDRESS}`;
    window.open(explorerUrl, "_blank");
    
    toast({
      title: "Explorer Opened",
      description: "Viewing escrow wallet on Aptos Explorer.",
    });
  };

  const sendTestTransfer = async () => {
    try {
      setIsTesting(true);
      // Get connected wallet address
      let playerAddress = "";
      if ((window as any).aptos) {
        const accountInfo = await (window as any).aptos.account();
        playerAddress = accountInfo?.address?.toString() || "";
      }
      if (!playerAddress) {
        toast({ title: "Wallet not connected", description: "Connect a wallet to receive the test transfer." });
        return;
      }

      const res = await fetch("https://eiqiabykntujbxldsppg.functions.supabase.co/payout/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcWlhYnlrbnR1amJ4bGRzcHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MjEwMjgsImV4cCI6MjA1ODk5NzAyOH0.3I16J3OUlxJTAHVKpBugYG0vQt1j0xPPPEvoJLTK6ac",
        },
        body: JSON.stringify({ playerAddress, amount: 0.0001, tokenType: "APT" }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Test failed (${res.status})`);
      }

      toast({
        title: "Test transfer sent",
        description: `0.0001 APT sent. View: ${data.explorerUrl || "Explorer link"}`,
      });
    } catch (e: any) {
      toast({ title: "Test failed", description: e?.message || "Unknown error" });
    } finally {
      setIsTesting(false);
    }
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

      {/* Manual Funding Only */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Fund Escrow Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Fund the escrow wallet by sending APT to this address:
            </p>
            <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
              {ESCROW_WALLET_ADDRESS}
            </p>
          </div>
          
          <Button 
            onClick={openFaucet}
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Explorer
          </Button>

          <Button 
            onClick={sendTestTransfer}
            className="w-full"
            disabled={isTesting}
          >
            {isTesting ? "Sending 0.0001 APT..." : "Send 0.0001 APT Test"}
          </Button>
          
          <div className="text-xs text-muted-foreground">
            <p>You can view transactions and details for the escrow wallet on the Aptos Explorer.</p>
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
            <Button 
              onClick={openFaucet}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              Open Faucet to Fund Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBalanceCard;

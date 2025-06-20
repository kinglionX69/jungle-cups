
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminBalanceCardProps {
  balances: {
    apt: number;
    emojicoin: number;
    availableTokens: string[];
  };
  isLoading: boolean;
}

const AdminBalanceCard = ({ balances, isLoading }: AdminBalanceCardProps) => {
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

  const totalValue = balances.apt + (balances.emojicoin * 0.001); // Rough conversion
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

      {isLowFunds && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-800">Low Funds Alert</h3>
            </div>
            <p className="text-sm text-red-700">
              The escrow wallet has insufficient funds for payouts. Players cannot place bets until funds are added.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBalanceCard;

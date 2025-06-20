
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, TrendingUp, Users, Settings, History } from "lucide-react";
import { getEscrowWalletBalances } from "@/utils/escrowUtils";
import AdminBalanceCard from "./AdminBalanceCard";
import AdminPlayersCard from "./AdminPlayersCard";
import AdminTransactionsCard from "./AdminTransactionsCard";
import AdminSettingsCard from "./AdminSettingsCard";

interface AdminDashboardProps {
  walletAddress: string;
}

const AdminDashboard = ({ walletAddress }: AdminDashboardProps) => {
  const [escrowBalances, setEscrowBalances] = useState({
    apt: 0,
    emojicoin: 0,
    availableTokens: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEscrowBalances = async () => {
      try {
        setIsLoading(true);
        const balances = await getEscrowWalletBalances();
        setEscrowBalances(balances);
      } catch (error) {
        console.error("Error fetching escrow balances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEscrowBalances();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchEscrowBalances, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-jungle-green" />
        <div>
          <h1 className="text-3xl font-bold text-jungle-darkGreen font-luckiest">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your jungle game platform
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Players
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AdminBalanceCard 
            balances={escrowBalances} 
            isLoading={isLoading} 
          />
        </TabsContent>

        <TabsContent value="players">
          <AdminPlayersCard />
        </TabsContent>

        <TabsContent value="transactions">
          <AdminTransactionsCard />
        </TabsContent>

        <TabsContent value="settings">
          <AdminSettingsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

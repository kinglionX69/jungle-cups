
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string;
  player_address: string;
  amount: number;
  token_type: string;
  status: string;
  transaction_hash: string | null;
  game_id: string;
  created_at: string;
}

const AdminTransactionsCard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    totalVolume: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('game_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setTransactions(data || []);
      
      // Calculate stats
      const transactionStats = (data || []).reduce((acc, tx) => ({
        totalTransactions: acc.totalTransactions + 1,
        pendingTransactions: acc.pendingTransactions + (tx.status === 'pending' ? 1 : 0),
        completedTransactions: acc.completedTransactions + (tx.status === 'completed' ? 1 : 0),
        totalVolume: acc.totalVolume + parseFloat(tx.amount.toString())
      }), { totalTransactions: 0, pendingTransactions: 0, completedTransactions: 0, totalVolume: 0 });
      
      setStats(transactionStats);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatWalletAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatTxHash = (hash: string | null) => 
    hash ? `${hash.slice(0, 8)}...${hash.slice(-8)}` : 'N/A';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-jungle-darkGreen">
              {stats.totalTransactions}
            </div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingTransactions}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.completedTransactions}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-jungle-darkGreen">
              {stats.totalVolume.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total Volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button onClick={fetchTransactions} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions found.
              </p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium font-mono text-sm">
                        {formatWalletAddress(tx.player_address)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {parseFloat(tx.amount.toString()).toFixed(4)} {tx.token_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Game: {tx.game_id.slice(-8)}
                      </p>
                    </div>
                    
                    <Badge variant={getStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                    
                    {tx.transaction_hash && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${tx.transaction_hash}?network=testnet`, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <span className="font-mono text-xs">
                          {formatTxHash(tx.transaction_hash)}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTransactionsCard;

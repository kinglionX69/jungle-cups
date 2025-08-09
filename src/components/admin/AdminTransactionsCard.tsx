
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, ExternalLink, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { manuallyProcessTransaction } from "@/utils/adminActions";

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
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    failedTransactions: 0,
    totalVolume: 0
  });
  const [processingTx, setProcessingTx] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_transactions'
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('game_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setTransactions(data || []);
      
      // Calculate stats
      const transactionStats = (data || []).reduce((acc, tx) => ({
        totalTransactions: acc.totalTransactions + 1,
        pendingTransactions: acc.pendingTransactions + (tx.status === 'pending' || tx.status === 'processing' ? 1 : 0),
        completedTransactions: acc.completedTransactions + (tx.status === 'completed' ? 1 : 0),
        failedTransactions: acc.failedTransactions + (tx.status === 'failed' ? 1 : 0),
        totalVolume: acc.totalVolume + parseFloat(tx.amount.toString())
      }), { totalTransactions: 0, pendingTransactions: 0, completedTransactions: 0, failedTransactions: 0, totalVolume: 0 });
      
      setStats(transactionStats);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualProcess = async (transactionId: string, action: 'complete' | 'fail') => {
    try {
      setProcessingTx(transactionId);
      const result = await manuallyProcessTransaction(transactionId, action);
      
      if (result.success) {
        toast({
          title: "Transaction Updated",
          description: `Transaction has been marked as ${action === 'complete' ? 'completed' : 'failed'}`,
        });
        fetchTransactions();
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update transaction status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing transaction:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing the transaction",
        variant: "destructive",
      });
    } finally {
      setProcessingTx(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': 
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'processing': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
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
            <div className="text-2xl font-bold text-red-600">
              {stats.failedTransactions}
            </div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction Management</CardTitle>
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
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <div>
                        <p className="font-medium font-mono text-sm">
                          {formatWalletAddress(tx.player_address)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
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
                    
                    {tx.transaction_hash ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${tx.transaction_hash}?network=mainnet`, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <span className="font-mono text-xs">
                          {formatTxHash(tx.transaction_hash)}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground px-3">
                        No hash
                      </span>
                    )}
                    
                    {(tx.status === 'pending' || tx.status === 'processing') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Transaction</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded">
                              <p><strong>ID:</strong> {tx.id}</p>
                              <p><strong>Player:</strong> {tx.player_address}</p>
                              <p><strong>Amount:</strong> {tx.amount} {tx.token_type}</p>
                              <p><strong>Status:</strong> {tx.status}</p>
                              <p><strong>Created:</strong> {new Date(tx.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleManualProcess(tx.id, 'complete')}
                                disabled={processingTx === tx.id}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                {processingTx === tx.id ? "Processing..." : "Mark Complete"}
                              </Button>
                              <Button
                                onClick={() => handleManualProcess(tx.id, 'fail')}
                                disabled={processingTx === tx.id}
                                variant="destructive"
                                className="flex-1"
                              >
                                {processingTx === tx.id ? "Processing..." : "Mark Failed"}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Use these actions only when you're sure about the transaction outcome.
                              Marking as complete will update player balances accordingly.
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {stats.totalVolume > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Total Transaction Volume</span>
                <span className="text-lg font-bold text-blue-900">{stats.totalVolume.toFixed(4)} APT</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTransactionsCard;


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Transaction {
  id: string;
  transaction_hash: string | null;
  token_type: string;
  amount: number;
  status: string;
  created_at: string;
  game_id: string;
}

interface UseTransactionHistoryProps {
  walletAddress: string;
  limit?: number;
}

interface TransactionHistoryData {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTransactionHistory({ 
  walletAddress, 
  limit = 5 
}: UseTransactionHistoryProps): TransactionHistoryData {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = async () => {
    if (!walletAddress) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('game_transactions')
        .select('*')
        .eq('player_address', walletAddress)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setTransactions(data || []);
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch transactions"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    
    // Setup real-time subscription for new transactions
    const channel = supabase
      .channel('public:game_transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_transactions',
          filter: `player_address=eq.${walletAddress}`
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress, limit]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions
  };
}

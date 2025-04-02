
import { useTransactionHistory, Transaction } from "@/hooks/useTransactionHistory";
import { ExternalLink, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EXPLORER_URL } from "@/utils/aptosConfig";
import { useIsMobile } from "@/hooks/use-mobile";

interface TransactionHistoryProps {
  walletAddress: string;
  limit?: number;
}

const TransactionHistory = ({ walletAddress, limit = 5 }: TransactionHistoryProps) => {
  const isMobile = useIsMobile();
  const { transactions, isLoading } = useTransactionHistory({ 
    walletAddress, 
    limit 
  });

  if (!walletAddress) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatAmount = (amount: number, tokenType: string) => {
    return `${amount.toFixed(tokenType === 'APT' ? 4 : 2)} ${tokenType}`;
  };

  // Determine if transaction is incoming or outgoing (simplified logic)
  const isOutgoing = (tx: Transaction) => {
    // Game bets are outgoing
    return tx.game_id.includes('bet');
  };

  return (
    <Card className="transaction-history-card bg-white/80 backdrop-blur-sm mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-jungle-darkGreen">Transaction History</CardTitle>
        <CardDescription>Your recent transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {!isMobile && <TableHead className="text-right">Status</TableHead>}
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {isOutgoing(tx) ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-green-500" />
                        )}
                        <span className="truncate max-w-20">
                          {formatDate(tx.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tx.token_type}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isOutgoing(tx) ? "text-red-500" : "text-green-500"}>
                        {isOutgoing(tx) ? '-' : '+'}{formatAmount(tx.amount, tx.token_type)}
                      </span>
                    </TableCell>
                    {!isMobile && (
                      <TableCell className="text-right">
                        <span className={`
                          px-2 py-1 rounded-full text-xs
                          ${tx.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}
                        `}>
                          {tx.status}
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {tx.transaction_hash && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          asChild
                        >
                          <a 
                            href={`${EXPLORER_URL}${tx.transaction_hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View on explorer</span>
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;


import { PlayerStats } from "@/types/gameTypes";

export interface UsePlayerStatsReturn {
  stats: PlayerStats;
  isLoading: boolean;
  isWithdrawing: boolean;
  loadStats: (walletAddress: string) => Promise<void>;
  updateStats: (won: boolean, betAmount: number, tokenType: string) => Promise<boolean>;
  addReferral: (referrerAddress: string) => Promise<boolean>;
  withdrawFunds: (amount: number, tokenType: string) => Promise<boolean>;
  lastTxHash?: string | null;
  lastTxExplorerUrl?: string | null;
}

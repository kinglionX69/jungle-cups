
import { PlayerStats } from "@/types/gameTypes";

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  aptWon: 0,
  emojiWon: 0,
  referrals: 0,
};

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

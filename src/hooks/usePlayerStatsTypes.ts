
import { PlayerStats } from "@/types/gameTypes";

// Default stats for new players
export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  aptWon: 0,
  emojiWon: 0,
  referrals: 0,
};

// Hook return type for better type safety across modules
export interface UsePlayerStatsReturn {
  stats: PlayerStats;
  isLoading: boolean;
  isWithdrawing: boolean;
  loadStats: (address: string) => Promise<void>;
  updateStats: (won: boolean, betAmount: number, tokenType: string) => Promise<PlayerStats | undefined>;
  addReferral: () => Promise<PlayerStats | undefined>;
  withdrawFunds: (amount: number, tokenType: string) => Promise<boolean>;
}

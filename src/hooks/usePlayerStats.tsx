import { useEffect } from "react";
import { useStatsLoader } from "./useStatsLoader";
import { useStatsUpdater } from "./useStatsUpdater";
import { useStatsWithdrawal } from "./useStatsWithdrawal";
import { UsePlayerStatsReturn } from "./usePlayerStatsTypes";

export const usePlayerStats = (walletAddress: string): UsePlayerStatsReturn => {
  const { stats, setStats, isLoading, loadStats } = useStatsLoader();
  const { updateStats, addReferral } = useStatsUpdater(walletAddress, stats, setStats);
  const { isWithdrawing, withdrawFunds, lastTxHash, lastTxExplorerUrl } = useStatsWithdrawal(walletAddress, stats, setStats);
  
  useEffect(() => {
    if (walletAddress) {
      loadStats(walletAddress);
    } else {
      setStats({
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        aptWon: 0,
        emojiWon: 0,
        referrals: 0,
      });
    }
  }, [walletAddress]);
  
  return {
    stats,
    isLoading,
    isWithdrawing,
    loadStats,
    updateStats,
    addReferral,
    withdrawFunds,
    lastTxHash,
    lastTxExplorerUrl
  };
};

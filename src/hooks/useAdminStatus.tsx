
import { useMemo } from "react";
import { ESCROW_WALLET_ADDRESS } from "@/utils/aptosConfig";

interface UseAdminStatusProps {
  walletAddress: string;
}

export function useAdminStatus({ walletAddress }: UseAdminStatusProps) {
  const isAdmin = useMemo(() => {
    if (!walletAddress || !ESCROW_WALLET_ADDRESS) return false;
    return walletAddress.toLowerCase() === ESCROW_WALLET_ADDRESS.toLowerCase();
  }, [walletAddress]);

  return {
    isAdmin
  };
}

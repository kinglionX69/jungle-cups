
// This is now a barrel file to export all functions from the modularized files

// Configuration
export { 
  NETWORK, 
  NODE_URL, 
  EXPLORER_URL, 
  FAUCET_URL,
  ESCROW_WALLET_ADDRESS,
  EMOJICOIN_ADDRESS,
  MIN_APT_BALANCE,
  MIN_EMOJICOIN_BALANCE,
  client
} from './aptosConfig';

// Client utilities
export {
  isWalletConnected,
  getReferralFromUrl,
  trackReferral
} from './aptosClient';

// Token management
export {
  initializeAccount,
  initializeTokenStore,
  getWalletBalance,
  requestTestnetTokens
} from './tokenManagement';

// Escrow operations
export {
  getEscrowWalletBalances,
  checkEscrowFunding,
  transferWinnings
} from './escrowUtils';

// Transaction operations
export {
  placeBet,
  withdrawWinnings
} from './transactionUtils';

// Stats and leaderboard
export {
  getPlayerStats,
  getLeaderboardData
} from './statsUtils';

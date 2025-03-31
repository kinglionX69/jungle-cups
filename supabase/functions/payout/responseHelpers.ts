
import { client } from "./aptosUtils.ts";

// Create successful response
export const createSuccessResponse = (
  amount: number,
  tokenType: string,
  playerAddress: string,
  transactionHash: string
) => {
  return {
    success: true,
    status: 200,
    message: `Successfully processed withdrawal of ${amount} ${tokenType} to ${playerAddress}`,
    transactionHash: transactionHash,
    explorerUrl: `https://explorer.aptoslabs.com/txn/${transactionHash}?network=${client.nodeUrl.includes('testnet') ? 'testnet' : 'mainnet'}`,
    details: "Transaction successfully submitted to the blockchain."
  };
};

// Create error response
export const createErrorResponse = (
  status: number,
  error: string,
  details: string = "An unexpected error occurred in the withdrawal process."
) => {
  return {
    success: false,
    status: status,
    error: error,
    details: details
  };
};

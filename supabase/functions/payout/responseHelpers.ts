
import { corsHeaders } from "./cors.ts";
import { NETWORK } from "./aptosUtils.ts";

// Create successful response for withdrawal or payout
export const createSuccessResponse = (
  amount: number,
  tokenType: string,
  playerAddress: string,
  transactionHash: string
) => {
  // Determine the explorer URL based on the network
  const explorerBaseUrl = NETWORK === "mainnet" 
    ? "https://explorer.aptoslabs.com" 
    : "https://explorer.aptoslabs.com/txn";
  
  const explorerUrl = `${explorerBaseUrl}/${transactionHash}?network=${NETWORK}`;
  
  return {
    status: 200,
    success: true,
    message: `Successfully processed ${amount} ${tokenType} transaction`,
    playerAddress,
    transactionHash,
    explorerUrl,
    details: `Transaction has been submitted to the blockchain and confirmed. You can view it on the explorer at ${explorerUrl}`
  };
};

// Create standardized error response
export const createErrorResponse = (
  statusCode: number,
  error: string,
  details: string
) => {
  console.error(`Error (${statusCode}): ${error} - ${details}`);
  
  return {
    status: statusCode,
    success: false,
    error,
    details
  };
};

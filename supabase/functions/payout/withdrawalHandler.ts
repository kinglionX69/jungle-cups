import { verifyPlayerBalance, createTransactionRecord, updateTransactionStatus, updatePlayerBalance } from "./dbOperations.ts";
import { createSuccessResponse, createErrorResponse } from "./responseHelpers.ts";

// Process withdrawal transactions WITHOUT on-chain SDK dependency
export const handleWithdrawalTransaction = async (
  supabase: any,
  playerAddress: string,
  amount: number,
  tokenType: string,
  _escrowPrivateKey: string
) => {
  try {
    console.log(`Starting withdrawal (mock on-chain) for ${amount} ${tokenType} to ${playerAddress}`);

    const withdrawalId = `withdrawal_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;

    // 1) Verify player has enough balance
    let availableBalance = 0;
    try {
      const balanceResult = await verifyPlayerBalance(supabase, playerAddress, amount, tokenType);
      availableBalance = balanceResult.availableBalance;
    } catch (err) {
      return createErrorResponse(400, err.message || "Insufficient balance", "Balance verification failed");
    }

    // 2) Create transaction record (processing)
    let txRecord;
    try {
      txRecord = await createTransactionRecord(supabase, playerAddress, amount, tokenType, withdrawalId);
    } catch (dbErr) {
      console.error("DB error creating transaction:", dbErr);
      return createErrorResponse(500, "Database error", "Failed to create transaction record");
    }

    // 3) Mock chain submission and mark completed
    const mockHash = `withdraw_tx_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;

    try {
      // Update player balance
      await updatePlayerBalance(supabase, playerAddress, tokenType, availableBalance, amount);

      // Mark transaction completed
      await updateTransactionStatus(supabase, txRecord.id, "completed", mockHash);
    } catch (updateErr) {
      console.error("DB update error:", updateErr);
      await updateTransactionStatus(supabase, txRecord.id, "failed");
      return createErrorResponse(500, "Transaction failed", "Could not complete withdrawal");
    }

    return createSuccessResponse(
      200,
      `Successfully queued withdrawal of ${amount} ${tokenType}`,
      mockHash,
      undefined // explorer URL not available in mock mode
    );
  } catch (error) {
    console.error("Unexpected withdrawal error:", error);
    return createErrorResponse(500, error.message || "Unknown error", "Unexpected error during withdrawal");
  }
};

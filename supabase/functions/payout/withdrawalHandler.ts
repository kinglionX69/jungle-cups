import { verifyPlayerBalance, createTransactionRecord, updateTransactionStatus, updatePlayerBalance } from "./dbOperations.ts";
import { createSuccessResponse, createErrorResponse } from "./responseHelpers.ts";
import { processWithdrawalTransaction } from "./transactionUtils.ts";
import { createAptosAccount, client } from "./aptosUtils.ts";

// Process withdrawal transactions WITHOUT on-chain SDK dependency
export const handleWithdrawalTransaction = async (
  supabase: any,
  playerAddress: string,
  amount: number,
  tokenType: string,
  _escrowPrivateKey: string
) => {
  try {
    console.log(`Starting withdrawal (on-chain) for ${amount} ${tokenType} to ${playerAddress}`);

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

    // 3) Submit on-chain transfer and mark completed after confirmation
    try {
      // Derive escrow sender address from private key
      const escrowAccount = createAptosAccount(_escrowPrivateKey);
      const senderAddress = escrowAccount.accountAddress.toString();

      // Convert amount to base units for chain
      const amountBaseUnits =
        tokenType === "APT"
          ? Math.round(amount * 1e8)
          : Math.floor(amount);

      const tx = await processWithdrawalTransaction(
        senderAddress,
        playerAddress,
        amountBaseUnits,
        tokenType,
        _escrowPrivateKey
      );

      // Wait for on-chain confirmation
      await client.waitForTransaction({ transactionHash: tx.hash });

      // Update player balance in DB (keep human units)
      await updatePlayerBalance(supabase, playerAddress, tokenType, availableBalance, amount);

      // Mark transaction completed with real hash
      await updateTransactionStatus(supabase, txRecord.id, "completed", tx.hash);

      return createSuccessResponse(amount, tokenType, playerAddress, tx.hash);
    } catch (updateErr) {
      console.error("On-chain or DB update error:", updateErr);
      try { await updateTransactionStatus(supabase, txRecord.id, "failed"); } catch (_) {}
      return createErrorResponse(500, "Transaction failed", "Could not complete withdrawal on-chain");
    }
  } catch (error) {
    console.error("Unexpected withdrawal error:", error);
    return createErrorResponse(500, error.message || "Unknown error", "Unexpected error during withdrawal");
  }
};

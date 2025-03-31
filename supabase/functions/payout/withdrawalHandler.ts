
import { corsHeaders } from "./cors.ts";
import { client, initializeAptosAccount } from "./aptosUtils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Process withdrawal transactions
export const handleWithdrawalTransaction = async (
  supabase: any,
  playerAddress: string, 
  amount: number, 
  tokenType: string,
  escrowPrivateKey: string
) => {
  try {
    // Check if the player has enough balance to withdraw
    const { data: stats, error: statsError } = await supabase
      .from('player_stats')
      .select('apt_won, emoji_won')
      .eq('wallet_address', playerAddress)
      .single();

    if (statsError) {
      console.error("Error fetching player stats:", statsError);
      return {
        success: false,
        status: 500,
        error: "Could not verify player balance"
      };
    }

    // Check available balance
    let availableBalance = 0;
    if (tokenType === "APT") {
      availableBalance = stats.apt_won;
    } else if (tokenType === "EMOJICOIN") {
      availableBalance = stats.emoji_won;
    }

    if (availableBalance < amount) {
      return {
        success: false,
        status: 400,
        error: "Insufficient balance"
      };
    }

    // Generate a unique withdrawal ID
    const withdrawalId = `withdrawal_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    // Save transaction to database as processing
    const { data, error } = await supabase
      .from('game_transactions')
      .insert({
        player_address: playerAddress,
        amount: amount,
        token_type: tokenType,
        game_id: withdrawalId,
        status: 'processing'
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return {
        success: false,
        status: 500,
        error: "Database error"
      };
    }

    try {
      // Initialize the escrow account
      const escrowAccount = initializeAptosAccount(escrowPrivateKey);
      console.log("Escrow account initialized:", escrowAccount.address().hex());

      // Convert amount to octas (8 decimals)
      const amountInOctas = Math.floor(amount * 100000000).toString(); 

      // Create transaction payload
      let functionName, typeArguments, functionArguments;
      
      if (tokenType === "APT") {
        functionName = "0x1::coin::transfer";
        typeArguments = ["0x1::aptos_coin::AptosCoin"];
        functionArguments = [playerAddress, amountInOctas];
      } else {
        // For testing, still use APT but will be replaced with Emojicoin on mainnet
        functionName = "0x1::coin::transfer";
        typeArguments = ["0x1::aptos_coin::AptosCoin"];
        functionArguments = [playerAddress, amountInOctas];
      }
      
      // Generate transaction with proper error handling
      let txnRequest;
      try {
        txnRequest = await client.generateTransaction(
          escrowAccount.address().hex(),
          {
            function: functionName,
            type_arguments: typeArguments,
            arguments: functionArguments,
          }
        );
        console.log("Transaction generated successfully");
      } catch (genError) {
        console.error("Error generating transaction:", genError);
        throw new Error(`Failed to generate transaction: ${genError.message}`);
      }

      // Sign transaction with proper error handling
      let signedTxn;
      try {
        signedTxn = await client.signTransaction(escrowAccount, txnRequest);
        console.log("Transaction signed successfully");
      } catch (signError) {
        console.error("Error signing transaction:", signError);
        throw new Error(`Failed to sign transaction: ${signError.message}`);
      }

      // Submit transaction with proper error handling
      let transactionRes;
      try {
        transactionRes = await client.submitTransaction(signedTxn);
        console.log("Transaction submitted successfully:", transactionRes.hash);
      } catch (submitError) {
        console.error("Error submitting transaction:", submitError);
        throw new Error(`Failed to submit transaction: ${submitError.message}`);
      }

      // Wait for transaction completion with timeout
      let txResult;
      try {
        txResult = await Promise.race([
          client.waitForTransaction(transactionRes.hash),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Transaction confirmation timeout")), 30000)
          )
        ]);
        console.log("Transaction confirmed:", txResult);
      } catch (waitError) {
        console.error("Error waiting for transaction:", waitError);
        
        // Update transaction as pending since we don't know if it went through
        await supabase
          .from('game_transactions')
          .update({
            transaction_hash: transactionRes.hash,
            status: 'pending'
          })
          .eq('id', data.id);
          
        throw new Error(`Waiting for transaction timed out or failed: ${waitError.message}`);
      }

      // Early fail if the transaction failed
      if (txResult.success === false) {
        await supabase
          .from('game_transactions')
          .update({
            transaction_hash: transactionRes.hash,
            status: 'failed',
          })
          .eq('id', data.id);
          
        throw new Error(`Transaction failed on chain: ${txResult.vm_status}`);
      }

      // Update the player's stats to reduce their balance
      const updateField = tokenType === "APT" ? "apt_won" : "emoji_won";
      const { error: updateError } = await supabase
        .from('player_stats')
        .update({
          [updateField]: availableBalance - amount
        })
        .eq('wallet_address', playerAddress);

      if (updateError) {
        console.error("Error updating player stats:", updateError);
        throw new Error(`Failed to update player stats: ${updateError.message}`);
      }

      // Update transaction with hash
      const { error: updateTxError } = await supabase
        .from('game_transactions')
        .update({
          transaction_hash: transactionRes.hash,
          status: 'completed'
        })
        .eq('id', data.id);

      if (updateTxError) {
        console.error("Error updating transaction:", updateTxError);
        throw new Error(`Failed to update transaction: ${updateTxError.message}`);
      }

      // Return success response
      return {
        success: true,
        status: 200,
        message: `Successfully processed withdrawal of ${amount} ${tokenType} to ${playerAddress}`,
        transactionHash: transactionRes.hash,
        explorerUrl: `https://explorer.aptoslabs.com/txn/${transactionRes.hash}?network=${client.nodeUrl.includes('testnet') ? 'testnet' : 'mainnet'}`,
        details: "Transaction successfully submitted to the blockchain."
      };
    } catch (txError) {
      console.error("Transaction error:", txError);
      
      // Update transaction status to failed
      await supabase
        .from('game_transactions')
        .update({
          status: 'failed',
          transaction_hash: `error: ${txError.message}`
        })
        .eq('id', data.id);

      return {
        success: false,
        status: 500,
        error: `Transaction failed: ${txError.message}`,
        details: "The blockchain transaction could not be completed, but your balance has not been affected. Try again later."
      };
    }
  } catch (error) {
    console.error("Error in handleWithdrawalTransaction:", error);
    return {
      success: false,
      status: 500,
      error: error.message,
      details: "An unexpected error occurred in the withdrawal process."
    };
  }
};

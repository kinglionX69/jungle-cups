
import { corsHeaders } from "./cors.ts";
import { client, initializeAptosAccount } from "./aptosUtils.ts";
import { BCS, TxnBuilderTypes, HexString } from "https://esm.sh/aptos@1.37.1";

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
      const amountInOctas = Math.floor(amount * 100000000); 

      // Create transaction payload for APT transfer
      if (tokenType === "APT" || tokenType === "EMOJICOIN") { // For testing, we use APT for both
        // Get account sequence number
        const senderAddress = escrowAccount.address().hex();
        const senderAccount = await client.getAccount(senderAddress);
        
        // Create a serializer for coin transfer function
        const serializer = new BCS.Serializer();
        
        // Encode the recipient address as a 32-byte array
        const recipientAddress = HexString.ensure(playerAddress).toUint8Array();
        serializer.serializeFixedBytes(recipientAddress);
        
        // Encode the amount as a u64
        serializer.serializeU64(BigInt(amountInOctas));
        
        // Prepare the transaction payload
        const entryFunctionPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
          TxnBuilderTypes.EntryFunction.natural(
            "0x1::coin",
            "transfer",
            [new TxnBuilderTypes.TypeTagStruct(
              TxnBuilderTypes.StructTag.fromString("0x1::aptos_coin::AptosCoin")
            )],
            [serializer.getBytes()]
          )
        );

        // Prepare raw transaction
        const rawTxn = new TxnBuilderTypes.RawTransaction(
          TxnBuilderTypes.AccountAddress.fromHex(senderAddress),
          BigInt(senderAccount.sequence_number),
          entryFunctionPayload,
          BigInt(2000), // Max gas amount
          BigInt(100), // Gas price per unit
          BigInt(Math.floor(Date.now() / 1000) + 600), // Expiration timestamp: 10 minutes from now
          new TxnBuilderTypes.ChainId(parseInt(await client.getChainId()))
        );

        // Sign the transaction
        const signingMessage = TxnBuilderTypes.RawTransactionWithData.new(rawTxn).inner();
        const signature = escrowAccount.signBuffer(signingMessage);
        
        // Create and submit signed transaction
        const authenticator = new TxnBuilderTypes.TransactionAuthenticatorEd25519(
          new TxnBuilderTypes.Ed25519PublicKey(escrowAccount.publicKey().toBytes()),
          new TxnBuilderTypes.Ed25519Signature(signature)
        );
        
        const signedTxn = new TxnBuilderTypes.SignedTransaction(rawTxn, authenticator);
        
        // Submit the transaction
        const transactionRes = await client.submitSignedBCSTransaction(signedTxn);
        console.log("Transaction submitted successfully:", transactionRes.hash);

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
      } else {
        throw new Error(`Unsupported token type: ${tokenType}`);
      }
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

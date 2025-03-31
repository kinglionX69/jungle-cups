
import { BCS, TxnBuilderTypes, HexString } from "https://esm.sh/aptos@1.37.1";
import { client } from "./aptosUtils.ts";

// Create transaction payload for token transfer
export const createTransferPayload = (
  tokenType: string,
  recipientAddress: string,
  amountInOctas: number
) => {
  // For now, we're using APT for both APT and EMOJICOIN in testing
  const typeTag = new TxnBuilderTypes.TypeTagStruct(
    TxnBuilderTypes.StructTag.fromString("0x1::aptos_coin::AptosCoin")
  );

  // Create a serializer for coin transfer function
  const serializer = new BCS.Serializer();
  
  // Encode the recipient address as a 32-byte array
  const recipientAddressBytes = HexString.ensure(recipientAddress).toUint8Array();
  serializer.serializeFixedBytes(recipientAddressBytes);
  
  // Encode the amount as a u64
  serializer.serializeU64(BigInt(amountInOctas));
  
  // Return the transaction payload
  return new TxnBuilderTypes.TransactionPayloadEntryFunction(
    TxnBuilderTypes.EntryFunction.natural(
      "0x1::coin",
      "transfer",
      [typeTag],
      [serializer.getBytes()]
    )
  );
};

// Prepare raw transaction
export const createRawTransaction = async (
  senderAddress: string,
  entryFunctionPayload: TxnBuilderTypes.TransactionPayloadEntryFunction,
) => {
  // Get account sequence number
  const senderAccount = await client.getAccount(senderAddress);
  
  // Create raw transaction
  return new TxnBuilderTypes.RawTransaction(
    TxnBuilderTypes.AccountAddress.fromHex(senderAddress),
    BigInt(senderAccount.sequence_number),
    entryFunctionPayload,
    BigInt(2000), // Max gas amount
    BigInt(100), // Gas price per unit
    BigInt(Math.floor(Date.now() / 1000) + 600), // Expiration timestamp: 10 minutes from now
    new TxnBuilderTypes.ChainId(parseInt(await client.getChainId()))
  );
};

// Sign and submit transaction
export const signAndSubmitTransaction = async (
  rawTxn: TxnBuilderTypes.RawTransaction,
  escrowAccount: any
) => {
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
  return await client.submitSignedBCSTransaction(signedTxn);
};

// Wait for transaction with timeout
export const waitForTransactionWithTimeout = async (
  transactionHash: string,
  timeoutMs: number = 30000
) => {
  return await Promise.race([
    client.waitForTransaction(transactionHash),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Transaction confirmation timeout")), timeoutMs)
    )
  ]);
};

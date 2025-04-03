
import { AptosClient, AptosAccount, AccountAddress, Ed25519PrivateKey, TypeTag, EntryFunction, TransactionPayloadEntryFunction, RawTransaction, SignedTransaction } from "https://esm.sh/@aptos-labs/ts-sdk@1.5.1";

// Aptos client configuration
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const client = new AptosClient({ baseUrl: NODE_URL, network: 'testnet' });

// Create Aptos account from private key
export const createAptosAccount = (privateKey: string): AptosAccount => {
  // Remove '0x' prefix if present
  const privateKeyHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  const privateKeyBytes = new Ed25519PrivateKey(privateKeyHex);
  return new AptosAccount(privateKeyBytes);
};

// Create and sign a transaction using a private key
export const createAndSignTransaction = async (
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  tokenType: string,
  privateKey: string
) => {
  try {
    console.log(`Creating transaction from ${senderAddress} to ${recipientAddress}`);
    
    // Create account from private key
    const account = createAptosAccount(privateKey);
    
    // Determine token type address
    let tokenTypeAddress;
    if (tokenType === "APT") {
      tokenTypeAddress = "0x1::aptos_coin::AptosCoin";
    } else if (tokenType === "EMOJICOIN") {
      tokenTypeAddress = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";
    } else {
      throw new Error(`Unsupported token type: ${tokenType}`);
    }
    
    // Parse addresses
    const sender = AccountAddress.fromHex(senderAddress);
    const recipient = AccountAddress.fromHex(recipientAddress);
    
    // Get account sequence number (nonce)
    const sequenceNumber = await client.getAccountSequenceNumber({ accountAddress: sender });
    
    // Calculate gas price
    const gasEstimation = await client.estimateGasPrice();
    
    // Create entry function for coin transfer
    const typeTag = new TypeTag(tokenTypeAddress);
    const entryFunction = EntryFunction.natural(
      "0x1::coin",
      "transfer",
      [typeTag],
      [recipient.hex(), amount.toString()]
    );
    
    // Create transaction payload
    const payload = new TransactionPayloadEntryFunction(entryFunction);
    
    // Create raw transaction
    const chainId = await client.getChainId();
    const expirationTimestampSecs = Math.floor(Date.now() / 1000) + 600; // 10 minutes
    
    const rawTxn = new RawTransaction(
      sender,
      BigInt(sequenceNumber),
      payload,
      BigInt(10000), // Max gas amount
      BigInt(gasEstimation.gasUnitPrice),
      BigInt(expirationTimestampSecs),
      BigInt(chainId)
    );
    
    // Sign transaction
    const signedTxn = SignedTransaction.create(rawTxn, account);
    
    // Submit transaction
    const pendingTxn = await client.submitTransaction({ transaction: signedTxn });
    
    console.log(`Transaction submitted with hash: ${pendingTxn.hash}`);
    
    return {
      success: true,
      hash: pendingTxn.hash,
      details: `Transaction submitted from ${senderAddress} to ${recipientAddress} for ${amount} ${tokenType}`
    };
  } catch (error) {
    console.error("Error creating and signing transaction:", error);
    throw error;
  }
};

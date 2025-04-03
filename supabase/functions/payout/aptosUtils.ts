
import { AptosAccount, AptosClient, HexString, TxnBuilderTypes, BCS } from "https://esm.sh/aptos@1.20.0";

// Aptos client configuration
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const client = new AptosClient(NODE_URL);

// Create Aptos account from private key
export const createAptosAccount = (privateKey: string): AptosAccount => {
  const privateKeyBytes = HexString.ensure(privateKey).toUint8Array();
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
    
    // Get account sequence number (nonce)
    const { sequence_number: sequenceNumber } = await client.getAccount(account.address());
    
    // Calculate gas price to ensure we're not underpaying
    const gasUnitPrice = await client.estimateGasPrice();
    
    // Create transfer transaction payload
    const entryFunctionPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural(
        "0x1::coin",
        "transfer",
        [new TxnBuilderTypes.TypeTag(TxnBuilderTypes.StructTag.fromString(tokenTypeAddress))],
        [
          BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(HexString.ensure(recipientAddress))),
          BCS.bcsSerializeUint64(amount),
        ]
      )
    );
    
    // Create raw transaction
    const rawTxn = new TxnBuilderTypes.RawTransaction(
      TxnBuilderTypes.AccountAddress.fromHex(account.address()),
      BigInt(sequenceNumber),
      entryFunctionPayload,
      BigInt(10000), // Max gas units
      BigInt(gasUnitPrice.gas_estimate), // Gas unit price
      BigInt(Math.floor(Date.now() / 1000) + 600), // Expiration timestamp (10 minutes)
      new TxnBuilderTypes.ChainId(2) // Testnet chain ID
    );
    
    // Sign the transaction
    const signedTxn = BCS.bcsToBytes(new TxnBuilderTypes.SignedTransaction(
      rawTxn,
      new TxnBuilderTypes.Ed25519Signature(
        account.signBuffer(BCS.bcsToBytes(rawTxn)).toUint8Array()
      ),
      new TxnBuilderTypes.Ed25519PublicKey(account.pubKey().toUint8Array())
    ));
    
    // Submit the transaction
    const response = await client.submitSignedBCSTransaction(signedTxn);
    
    console.log(`Transaction submitted with hash: ${response.hash}`);
    
    return {
      success: true,
      hash: response.hash,
      details: `Transaction submitted from ${senderAddress} to ${recipientAddress} for ${amount} ${tokenType}`
    };
  } catch (error) {
    console.error("Error creating and signing transaction:", error);
    throw error;
  }
};

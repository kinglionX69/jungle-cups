
import { Aptos, Network, AptosConfig, AccountAddress, EntryFunctionArgumentTypes, Account, Ed25519PrivateKey } from "https://esm.sh/@aptos-labs/ts-sdk@2.0.1";

// Aptos client configuration
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const config = new AptosConfig({ network: Network.TESTNET });
export const client = new Aptos(config);

// Create Aptos account from private key
export const createAptosAccount = (privateKey: string) => {
  const privateKeyHex = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  const privateKeyObj = new Ed25519PrivateKey(privateKeyHex);
  const address = privateKeyObj.publicKey().toAddress().toString();
  return Account.fromPrivateKey({
    privateKey: privateKeyObj,
    address: AccountAddress.fromString(address)
  });
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
    const sender = AccountAddress.fromString(senderAddress);
    const recipient = AccountAddress.fromString(recipientAddress);
    
    // Create transaction builder
    const rawTxn = await client.transaction.build.simple({
      sender,
      data: {
        function: "0x1::coin::transfer",
        typeArguments: [tokenTypeAddress],
        functionArguments: [recipient, BigInt(amount)]
      }
    });
    
    const pendingTxn = await client.signAndSubmitTransaction({
      signer: account,
      transaction: rawTxn
    });
    
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

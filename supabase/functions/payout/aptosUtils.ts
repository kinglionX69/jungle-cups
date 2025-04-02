
// Network settings
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const NETWORK = "testnet";
export const EMOJICOIN_ADDRESS = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";

// Aptos SDK imports for Edge Functions (using Deno compatibility)
import { 
  AptosClient, 
  AptosAccount, 
  TxnBuilderTypes, 
  BCS, 
  HexString,
  AccountAddress,
  TransactionBuilderEd25519,
  Ed25519PrivateKey
} from "https://esm.sh/aptos@1.20.0";

// Initialize Aptos client for REST API calls
export const client = new AptosClient(NODE_URL);

// Helper to create Aptos account from private key
export const createAptosAccount = (privateKeyHex: string): AptosAccount => {
  try {
    // Remove '0x' prefix if present
    if (privateKeyHex.startsWith('0x')) {
      privateKeyHex = privateKeyHex.slice(2);
    }
    
    console.log(`Creating account from private key (first 4 chars: ${privateKeyHex.substring(0, 4)}...)`);
    
    // Create account from private key
    const privateKeyBytes = new HexString(privateKeyHex).toUint8Array();
    return new AptosAccount(privateKeyBytes);
  } catch (error) {
    console.error('Error creating Aptos account:', error);
    throw new Error(`Failed to initialize Aptos account: ${error.message}`);
  }
};

// Perform actual transaction using Aptos SDK
export const createAndSignTransaction = async (
  senderAddress: string,
  recipientAddress: string, 
  amount: number,
  tokenType: string,
  privateKey: string
) => {
  try {
    console.log(`Creating transaction for ${amount} ${tokenType} from ${senderAddress} to ${recipientAddress}`);
    
    // Convert sender address from string to AccountAddress
    const escrowAccount = createAptosAccount(privateKey);
    
    // Determine token type address
    let tokenTypeAddress;
    if (tokenType === 'APT') {
      tokenTypeAddress = '0x1::aptos_coin::AptosCoin';
    } else if (tokenType === 'EMOJICOIN') {
      tokenTypeAddress = EMOJICOIN_ADDRESS;
      console.log('Using EMOJICOIN token address:', tokenTypeAddress);
      // For testing we'll use APT instead of Emojicoin
      tokenTypeAddress = '0x1::aptos_coin::AptosCoin';
    } else {
      throw new Error(`Unsupported token type: ${tokenType}`);
    }
    
    // Build coin transfer transaction
    const payload = {
      function: "0x1::coin::transfer",
      type_arguments: [tokenTypeAddress],
      arguments: [recipientAddress, amount.toString()]
    };
    
    // Generate the raw transaction
    const rawTxn = await client.generateTransaction(escrowAccount.address(), payload);
    
    // Sign the transaction
    const signedTxn = await client.signTransaction(escrowAccount, rawTxn);
    
    // Submit the transaction
    const transactionResponse = await client.submitTransaction(signedTxn);
    console.log(`Transaction submitted with hash: ${transactionResponse.hash}`);
    
    return {
      hash: transactionResponse.hash,
      success: true
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

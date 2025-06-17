
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  Aptos,
  AptosConfig,
  Network,
  Account,
  AccountAddress,
  Ed25519PrivateKey,
} = require('@aptos-labs/ts-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: '*', // In production, specify your allowed origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware for parsing JSON
app.use(express.json());

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn('No API_KEY set in environment variables. This is insecure!');
    return next(); // Continue without validation if API_KEY is not set
  }

  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== apiKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  next();
};

// Apply API Key validation to all routes
app.use(validateApiKey);

// Aptos client setup
const NODE_URL = process.env.NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
const config = new AptosConfig({ network: Network.TESTNET, fullnode: NODE_URL });
const client = new Aptos(config);
console.log(`Aptos client initialized with node URL: ${NODE_URL}`);

// Helper to create Aptos account from private key
const createAptosAccount = (privateKeyHex) => {
  try {
    // Process private key from hex format
    if (!privateKeyHex) {
      throw new Error('Private key is required');
    }
    
    // Remove '0x' prefix if present
    if (privateKeyHex.startsWith('0x')) {
      privateKeyHex = privateKeyHex.slice(2);
    }
    
    console.log(`Creating account from private key (first 4 chars: ${privateKeyHex.substring(0, 4)}...)`);
    
    // Create account from private key using new SDK
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    const address = privateKey.publicKey().toAddress().toString();
    return Account.fromPrivateKey({
      privateKey,
      address: AccountAddress.fromString(address),
    });
  } catch (error) {
    console.error('Error creating Aptos account:', error);
    throw new Error(`Failed to initialize Aptos account: ${error.message}`);
  }
};

// Process transaction endpoint
app.post('/processTransaction', async (req, res) => {
  try {
    const { operation, tokenType, amount, recipientAddress, privateKey } = req.body;
    
    if (!operation || !tokenType || !amount || !recipientAddress || !privateKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters',
        details: 'Required fields: operation, tokenType, amount, recipientAddress, privateKey'
      });
    }
    
    console.log(`Processing ${operation} transaction of ${amount} ${tokenType} to ${recipientAddress}`);
    
    // Initialize escrow account
    let escrowAccount;
    try {
      escrowAccount = createAptosAccount(privateKey);
      console.log(`Escrow account initialized with address: ${escrowAccount.accountAddress.hex()}`);
    } catch (error) {
      console.error('Failed to initialize escrow account:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize escrow account',
        details: error.message
      });
    }
    
    // Determine token type address
    let tokenTypeAddress;
    if (tokenType === 'APT') {
      // Use the native Aptos coin
      tokenTypeAddress = '0x1::aptos_coin::AptosCoin';
    } else if (tokenType === 'EMOJICOIN') {
      // For Emojicoin, we would use a specific address
      // For testing purposes, we'll use APT
      tokenTypeAddress = '0x1::aptos_coin::AptosCoin';
      console.log('Using APT for Emojicoin transactions (testing mode)');
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported token type',
        details: `Token type ${tokenType} is not supported`
      });
    }
    
    if (operation === 'withdraw') {
      try {
        // Parse recipient address
        const recipient = AccountAddress.fromString(recipientAddress);

        const rawTxn = await client.transaction.build.simple({
          sender: escrowAccount.accountAddress,
          data: {
            function: "0x1::coin::transfer",
            typeArguments: [tokenTypeAddress],
            functionArguments: [recipient, BigInt(amount)]
          }
        });

        const pendingTxn = await client.signAndSubmitTransaction({
          signer: escrowAccount,
          transaction: rawTxn
        });
        
        console.log(`Transaction submitted with hash: ${pendingTxn.hash}`);
        
        // Return successful response with transaction hash
        return res.status(200).json({
          success: true,
          hash: pendingTxn.hash,
          details: `Transaction submitted for ${amount} ${tokenType} to ${recipientAddress}`
        });
      } catch (error) {
        console.error('Transaction error:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Transaction failed',
          details: error.message
        });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported operation',
        details: `Operation ${operation} is not supported`
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: error.message
    });
  }
});

// Server status endpoint for health checks
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    network: process.env.NETWORK || 'testnet'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Aptos service running on port ${PORT}`);
  console.log(`Network: ${process.env.NETWORK || 'testnet'}`);
  console.log(`Environment variables loaded: API_KEY=${!!process.env.API_KEY}, NODE_URL=${!!process.env.NODE_URL}`);
  
  // Only log the first few characters of private key if present (for debugging only)
  if (process.env.ESCROW_PRIVATE_KEY) {
    const keyPrefix = process.env.ESCROW_PRIVATE_KEY.substring(0, 4);
    console.log(`ESCROW_PRIVATE_KEY is set (starts with: ${keyPrefix}...)`);
  } else {
    console.warn('⚠️ ESCROW_PRIVATE_KEY is not set! Transactions will fail.');
  }
});

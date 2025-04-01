
# Aptos Blockchain Transaction Service

This service handles Aptos blockchain transactions for the Emojicoin game application. It provides an API to process transactions securely using the Aptos SDK, which isn't compatible with the Deno runtime used by Supabase Edge Functions.

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Fill in your environment variables:
   - `NODE_URL`: Aptos network node URL
   - `NETWORK`: Network name (testnet or mainnet)
   - `API_KEY`: A secure API key for authentication
   - `ESCROW_PRIVATE_KEY`: The private key of the escrow wallet

## Running the Service

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Process Transaction

```
POST /processTransaction
```

Request body:
```json
{
  "operation": "withdraw",
  "tokenType": "APT",
  "amount": 10000000,
  "recipientAddress": "0x123...",
  "privateKey": "0xabc..."
}
```

Response:
```json
{
  "success": true,
  "hash": "0x123...",
  "details": "Transaction submitted for 10000000 APT to 0x123..."
}
```

### Status Check

```
GET /status
```

Response:
```json
{
  "status": "online",
  "timestamp": "2023-04-01T12:00:00.000Z",
  "network": "testnet"
}
```

## Deployment on Vercel

1. Push this repository to GitHub
2. Connect your GitHub repository to Vercel
3. During the import step, configure the following environment variables:
   - `NODE_URL`: The Aptos node URL (default: https://fullnode.testnet.aptoslabs.com/v1)
   - `NETWORK`: The network name (testnet or mainnet)
   - `API_KEY`: A secure random string
   - `ESCROW_PRIVATE_KEY`: Your escrow wallet private key
4. Deploy the service
5. Note the URL of your deployed service
6. Update your Supabase Edge Function with the following secrets:
   - `APTOS_SERVICE_URL`: The URL of your deployed service
   - `APTOS_SERVICE_API_KEY`: The same API_KEY you set in Vercel

## Security Considerations

- Never expose your private keys in code or public repositories
- Secure the API_KEY environment variable
- In production, restrict CORS to your application domain
- Use HTTPS for all communication

# sBTC Guardian Vaults - Backend API

AI-powered backend for sBTC Guardian Vaults DeFi application.

## Features

- 🔐 Vault management API
- 🤖 AI-powered risk analysis
- 📊 Portfolio analytics
- 📈 APY tracking and history
- 💹 Market sentiment analysis
- 🔄 Rebalancing recommendations

## Quick Start

### Installation

```bash
cd backend
npm install
```

### Configuration

Create `.env` file (already created):
```
PORT=3001
NODE_ENV=development
STACKS_NETWORK=testnet
```

### Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### Run Production Server

```bash
npm start
```

## API Endpoints

### Vault Routes (`/api/vault`)

#### Get Vault Data
```
GET /api/vault/:address
```
Returns vault information for a specific address.

#### Get APY
```
GET /api/vault/apy/:riskProfile
```
Returns current APY for a risk profile (conservative, moderate, aggressive).

#### Get Global Stats
```
GET /api/vault/stats/global
```
Returns platform-wide statistics.

### AI Routes (`/api/ai`)

#### Analyze Risk
```
POST /api/ai/analyze-risk
Body: {
  vaultBalance: number,
  riskProfile: string,
  btcPrice: number
}
```
Returns AI-powered risk analysis.

#### Market Sentiment
```
GET /api/ai/market-sentiment
```
Returns current market sentiment indicators.

#### Rebalancing Recommendation
```
POST /api/ai/rebalance-recommendation
Body: {
  vaultBalance: number,
  riskProfile: string,
  currentAllocations: object
}
```
Returns optimal portfolio allocation recommendations.

### Analytics Routes (`/api/analytics`)

#### Portfolio Performance
```
GET /api/analytics/performance/:address?days=30
```
Returns portfolio performance history.

#### APY History
```
GET /api/analytics/apy-history/:riskProfile?days=30
```
Returns historical APY data.

#### Transaction Analytics
```
GET /api/analytics/transactions/:address
```
Returns transaction statistics and analytics.

#### Risk Exposure
```
GET /api/analytics/risk-exposure/:address
```
Returns current risk exposure breakdown.

## Testing

Test endpoints using curl:

```bash
# Health check
curl http://localhost:3001/health

# Get vault data
curl http://localhost:3001/api/vault/ST2X1GBHA2WJXREWP231EEQXZ1GDYZEEXYRAD1PA8

# AI risk analysis
curl -X POST http://localhost:3001/api/ai/analyze-risk \
  -H "Content-Type: application/json" \
  -d '{"vaultBalance": 0.006, "riskProfile": "conservative", "btcPrice": 42000}'
```

## Architecture

```
backend/
├── server.js              # Main Express server
├── routes/
│   ├── vaultRoutes.js     # Vault management endpoints
│   ├── aiRoutes.js        # AI analysis endpoints
│   └── analyticsRoutes.js # Analytics endpoints
├── package.json
└── .env                   # Environment variables
```

## Next Steps

1. ✅ Basic API structure (DONE)
2. 🔄 Connect to real DeFi protocols
3. 🤖 Integrate real AI models
4. 💾 Add database (PostgreSQL)
5. 🔒 Add authentication
6. 🚀 Deploy to production

## Tech Stack

- **Framework**: Express.js
- **Blockchain**: Stacks.js
- **Cache**: node-cache
- **AI**: OpenAI API (configurable)
- **Network**: Stacks Testnet/Mainnet

## Notes

- Currently uses mock data for demonstration
- AI analysis simulated (ready for real AI integration)
- Cache enabled for performance
- CORS enabled for frontend integration

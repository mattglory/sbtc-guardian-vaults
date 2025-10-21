const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api';

// Vault API calls
export const vaultAPI = {
  // Get vault data for an address
  async getVaultData(address) {
    const response = await fetch(`${API_BASE_URL}/vault/${address}`);
    return response.json();
  },

  // Get current APY for a risk profile
  async getAPY(riskProfile) {
    const response = await fetch(`${API_BASE_URL}/vault/apy/${riskProfile}`);
    return response.json();
  },

  // Get global vault statistics
  async getGlobalStats() {
    const response = await fetch(`${API_BASE_URL}/vault/stats/global`);
    return response.json();
  }
};

// AI API calls
export const aiAPI = {
  // Get AI risk analysis
  async analyzeRisk(vaultBalance, riskProfile) {
    const response = await fetch(`${API_BASE_URL}/ai/analyze-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vaultBalance, riskProfile })
    });
    return response.json();
  },

  // Get market sentiment
  async getMarketSentiment() {
    const response = await fetch(`${API_BASE_URL}/ai/market-sentiment`);
    return response.json();
  },

  // Get rebalancing recommendation
  async getRebalanceRecommendation(vaultBalance, riskProfile, currentAllocations) {
    const response = await fetch(`${API_BASE_URL}/ai/rebalance-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vaultBalance, riskProfile, currentAllocations })
    });
    return response.json();
  },

  // Chat with AI (NEW!)
  async chat(query, context) {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context })
    });
    return response.json();
  },

  // Get AI status (NEW!)
  async getAIStatus() {
    const response = await fetch(`${API_BASE_URL}/ai/status`);
    return response.json();
  }
};

// Analytics API calls
export const analyticsAPI = {
  // Get portfolio performance history
  async getPerformance(address, days = 30) {
    const response = await fetch(`${API_BASE_URL}/analytics/performance/${address}?days=${days}`);
    return response.json();
  },

  // Get APY history
  async getAPYHistory(riskProfile, days = 30) {
    const response = await fetch(`${API_BASE_URL}/analytics/apy-history/${riskProfile}?days=${days}`);
    return response.json();
  },

  // Get transaction analytics
  async getTransactionAnalytics(address) {
    const response = await fetch(`${API_BASE_URL}/analytics/transactions/${address}`);
    return response.json();
  },

  // Get risk exposure breakdown
  async getRiskExposure(address) {
    const response = await fetch(`${API_BASE_URL}/analytics/risk-exposure/${address}`);
    return response.json();
  }
};

// Market API calls
export const marketAPI = {
  // Get current BTC price
  async getBTCPrice() {
    const response = await fetch(`${API_BASE_URL}/market/btc/price`);
    return response.json();
  },

  // Get BTC price history
  async getBTCHistory(days = 30) {
    const response = await fetch(`${API_BASE_URL}/market/btc/history/${days}`);
    return response.json();
  },

  // Get BTC market stats
  async getBTCStats() {
    const response = await fetch(`${API_BASE_URL}/market/btc/stats`);
    return response.json();
  },

  // Get all DeFi protocols
  async getProtocols() {
    const response = await fetch(`${API_BASE_URL}/market/protocols`);
    return response.json();
  },

  // Get specific protocol data
  async getProtocol(protocol) {
    const response = await fetch(`${API_BASE_URL}/market/protocols/${protocol}`);
    return response.json();
  },

  // Get optimal allocation
  async getOptimalAllocation(riskProfile, amount) {
    const response = await fetch(`${API_BASE_URL}/market/allocation/${riskProfile}?amount=${amount}`);
    return response.json();
  },

  // Get market overview
  async getMarketOverview() {
    const response = await fetch(`${API_BASE_URL}/market/overview`);
    return response.json();
  }
};

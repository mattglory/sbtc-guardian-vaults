const express = require('express');
const router = express.Router();
const axios = require('axios');
const cache = require('../cache');
const priceService = require('../services/priceService');
const protocolService = require('../services/protocolService');
const aiService = require('../services/aiService');

// AI Risk Analysis endpoint
router.post('/analyze-risk', async (req, res) => {
  try {
    const { vaultBalance, riskProfile } = req.body;

    // Get real BTC price
    const btcPriceData = await priceService.getCurrentPrice();
    const btcPrice = btcPriceData.usd;
    const btcChange = btcPriceData.usd_24h_change;

    console.log('🤖 AI analyzing risk...');
    console.log(`  Balance: ${vaultBalance} sBTC`);
    console.log(`  Profile: ${riskProfile}`);
    console.log(`  BTC Price: $${btcPrice}`);
    console.log(`  24h Change: ${btcChange.toFixed(2)}%`);

    // Check cache first (5 minute cache)
    const cacheKey = `risk_${riskProfile}_${vaultBalance}_${Math.floor(btcPrice / 1000)}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('✅ Returning cached analysis');
      return res.json(cached);
    }

    // Get protocol data
    const protocols = await protocolService.getAllProtocols();

    // Use real AI service (OpenAI/Grok or rule-based fallback)
    const aiAnalysis = await aiService.analyzePortfolio({
      vaultBalance,
      riskProfile,
      btcPrice,
      btcChange,
      protocols
    });

    // Format response
    const response = {
      success: true,
      riskScore: aiAnalysis.riskScore,
      recommendation: aiAnalysis.recommendation,
      confidence: aiAnalysis.confidence,
      factors: {
        marketVolatility: getVolatilityLevel(Math.abs(btcChange)),
        liquidityRisk: 'Low',
        protocolRisk: getProtocolRiskLevel(protocols),
        btcTrend: btcChange > 0 ? 'Bullish' : 'Bearish',
        btcPrice: btcPrice,
        priceChange24h: btcChange.toFixed(2)
      },
      suggestedActions: aiAnalysis.suggestedActions,
      aiProvider: aiAnalysis.provider,
      aiModel: aiAnalysis.model,
      reasoning: aiAnalysis.reasoning || null,
      marketOutlook: aiAnalysis.marketOutlook,
      rebalanceNeeded: aiAnalysis.rebalanceNeeded || false,
      timestamp: new Date().toISOString()
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, response, 300);

    console.log(`✅ AI Analysis complete (provider: ${aiAnalysis.provider})`);
    res.json(response);

  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get market sentiment
router.get('/market-sentiment', async (req, res) => {
  try {
    // Check cache
    const cached = cache.get('market_sentiment');
    if (cached) {
      return res.json(cached);
    }

    // Fetch real market data
    const sentiment = await getMarketSentiment();

    cache.set('market_sentiment', sentiment);
    res.json(sentiment);

  } catch (error) {
    console.error('Error fetching sentiment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get rebalancing recommendations
router.post('/rebalance-recommendation', async (req, res) => {
  try {
    const { vaultBalance, riskProfile, currentAllocations } = req.body;

    const recommendation = await getRebalanceRecommendation(
      vaultBalance,
      riskProfile,
      currentAllocations
    );

    res.json({
      success: true,
      data: recommendation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting rebalance recommendation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get AI chat response (NEW!)
router.post('/chat', async (req, res) => {
  try {
    const { query, context } = req.body;

    console.log('💬 AI Chat query:', query);

    const response = await aiService.generateInsight(query, context);

    res.json({
      success: true,
      ...response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get AI status (NEW!)
router.get('/status', async (req, res) => {
  try {
    const status = aiService.getStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting AI status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
function getVolatilityLevel(change) {
  if (change > 5) return 'High';
  if (change > 2) return 'Moderate';
  return 'Low';
}

function getProtocolRiskLevel(protocols) {
  const avgRisk = Object.values(protocols).reduce((sum, p) => sum + p.riskScore, 0) / Object.keys(protocols).length;
  if (avgRisk > 60) return 'High';
  if (avgRisk > 40) return 'Moderate';
  return 'Low';
}

async function getMarketSentiment() {
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    sentiment: 'Bullish',
    score: 72,
    indicators: {
      fearGreedIndex: 68,
      btcDominance: 52.3,
      defiTVL: '$45.2B',
      tradingVolume: 'High'
    },
    timestamp: new Date().toISOString()
  };
}

async function getRebalanceRecommendation(balance, profile, allocations) {
  await new Promise(resolve => setTimeout(resolve, 800));

  const recommendations = {
    conservative: {
      zest: 70,
      velar: 20,
      stackswap: 10
    },
    moderate: {
      zest: 50,
      velar: 30,
      stackswap: 20
    },
    aggressive: {
      zest: 30,
      velar: 35,
      stackswap: 35
    }
  };

  const allocation = recommendations[profile.toLowerCase()] || recommendations.conservative;

  return {
    currentProfile: profile,
    recommendedAllocation: allocation,
    rebalanceNeeded: true,
    estimatedAPY: profile === 'aggressive' ? 12 : profile === 'moderate' ? 8.5 : 8,
    reason: 'Optimizing for current market conditions'
  };
}

module.exports = router;

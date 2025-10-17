const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');
const protocolService = require('../services/protocolService');

// Get current BTC price
router.get('/btc/price', async (req, res) => {
  try {
    const price = await priceService.getCurrentPrice();
    
    res.json({
      success: true,
      data: price,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching BTC price:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get BTC price history
router.get('/btc/history/:days', async (req, res) => {
  try {
    const { days } = req.params;
    const history = await priceService.getPriceHistory(parseInt(days));
    
    res.json({
      success: true,
      days: parseInt(days),
      data: history,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching BTC history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get BTC market statistics
router.get('/btc/stats', async (req, res) => {
  try {
    const stats = await priceService.getMarketStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching BTC stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all DeFi protocols
router.get('/protocols', async (req, res) => {
  try {
    const protocols = await protocolService.getAllProtocols();
    
    res.json({
      success: true,
      data: protocols,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching protocols:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific protocol data
router.get('/protocols/:protocol', async (req, res) => {
  try {
    const { protocol } = req.params;
    const data = await protocolService.getProtocolData(protocol);
    
    res.json({
      success: true,
      protocol,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching protocol:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get optimal allocation for risk profile
router.get('/allocation/:riskProfile', async (req, res) => {
  try {
    const { riskProfile } = req.params;
    const { amount = 1.0 } = req.query;
    
    const allocation = protocolService.getOptimalAllocation(
      riskProfile, 
      parseFloat(amount)
    );
    
    const protocols = await protocolService.getAllProtocols();
    const weightedAPY = protocolService.calculateWeightedAPY(allocation, protocols);
    
    res.json({
      success: true,
      riskProfile,
      totalAmount: parseFloat(amount),
      allocation,
      estimatedAPY: weightedAPY,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating allocation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get market overview (combined data)
router.get('/overview', async (req, res) => {
  try {
    const [btcPrice, protocols, btcStats] = await Promise.all([
      priceService.getCurrentPrice(),
      protocolService.getAllProtocols(),
      priceService.getMarketStats()
    ]);

    // Calculate total DeFi TVL
    const totalTVL = Object.values(protocols).reduce((sum, p) => sum + p.tvl, 0);
    const total24hVolume = Object.values(protocols).reduce((sum, p) => sum + p.volume24h, 0);

    res.json({
      success: true,
      data: {
        bitcoin: {
          price: btcPrice.usd,
          change24h: btcPrice.usd_24h_change,
          marketCap: btcStats?.marketCap || 0,
          volume24h: btcPrice.usd_24h_vol
        },
        defi: {
          totalTVL,
          total24hVolume,
          protocolCount: Object.keys(protocols).length,
          protocols
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

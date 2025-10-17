const express = require('express');
const router = express.Router();

// Get portfolio performance history
router.get('/performance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { days = 30 } = req.query;

    // Mock performance data (in production, from database)
    const performance = generatePerformanceData(parseInt(days));

    res.json({
      success: true,
      address,
      period: `${days} days`,
      data: performance,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get APY history
router.get('/apy-history/:riskProfile', async (req, res) => {
  try {
    const { riskProfile } = req.params;
    const { days = 30 } = req.query;

    const apyHistory = generateAPYHistory(riskProfile, parseInt(days));

    res.json({
      success: true,
      riskProfile,
      period: `${days} days`,
      data: apyHistory,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching APY history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction analytics
router.get('/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Mock transaction analytics
    const analytics = {
      totalDeposits: 5,
      totalWithdrawals: 2,
      netFlow: 0.0060,
      averageDepositSize: 0.0012,
      largestDeposit: 0.0050,
      totalFesPaid: 0.00001,
      profitLoss: 0.00032,
      profitLossPercent: 5.3
    };

    res.json({
      success: true,
      address,
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching transaction analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get risk exposure breakdown
router.get('/risk-exposure/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const exposure = {
      totalValue: 0.0060,
      byProtocol: {
        zest: { amount: 0.0042, percentage: 70, apy: 7.5 },
        velar: { amount: 0.0012, percentage: 20, apy: 9.2 },
        stackswap: { amount: 0.0006, percentage: 10, apy: 11.8 }
      },
      riskLevel: 'Conservative',
      diversificationScore: 85
    };

    res.json({
      success: true,
      address,
      data: exposure,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching risk exposure:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper: Generate performance data
function generatePerformanceData(days) {
  const data = [];
  const baseValue = 1000;
  let currentValue = baseValue;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate growth with some volatility
    const growthRate = 0.002; // 0.2% daily average
    const volatility = (Math.random() - 0.5) * 0.01;
    currentValue = currentValue * (1 + growthRate + volatility);

    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(currentValue.toFixed(2)),
      change: parseFloat(((currentValue - baseValue) / baseValue * 100).toFixed(2))
    });
  }

  return data;
}

// Helper: Generate APY history
function generateAPYHistory(riskProfile, days) {
  const baseAPYs = {
    conservative: 8,
    moderate: 8.5,
    aggressive: 12
  };

  const baseAPY = baseAPYs[riskProfile.toLowerCase()] || 8;
  const data = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate APY fluctuation
    const fluctuation = (Math.random() - 0.5) * 1; // ±0.5% variation
    const apy = baseAPY + fluctuation;

    data.push({
      date: date.toISOString().split('T')[0],
      apy: parseFloat(apy.toFixed(2))
    });
  }

  return data;
}

module.exports = router;

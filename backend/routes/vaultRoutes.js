const express = require('express');
const router = express.Router();
const { StacksTestnet } = require('@stacks/network');

const network = new StacksTestnet();
const CONTRACT_ADDRESS = 'ST2X1GBHA2WJXREWP231EEQXZ1GDYZEEXYRAD1PA8';
const CONTRACT_NAME = 'sbtc-vault-guardian';

// Get vault data for a user
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    console.log(`📊 Fetching vault data for: ${address}`);

    // Mock vault data (replace with real blockchain call later)
    const mockVaultData = {
      address,
      balance: 0.0060,
      riskProfile: 'conservative',
      totalDeposits: 5,
      totalWithdrawals: 2,
      apy: 8.0,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockVaultData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching vault:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current APY for a risk profile
router.get('/apy/:riskProfile', async (req, res) => {
  try {
    const { riskProfile } = req.params;
    
    // Mock APY data (in production, this would come from real DeFi protocols)
    const apyData = {
      conservative: { apy: 8, protocols: ['Zest Protocol'] },
      moderate: { apy: 8.5, protocols: ['Zest', 'Velar'] },
      aggressive: { apy: 12, protocols: ['Zest', 'Velar', 'StackSwap'] }
    };

    const data = apyData[riskProfile.toLowerCase()] || apyData.conservative;

    res.json({
      success: true,
      riskProfile,
      ...data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching APY:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get vault statistics
router.get('/stats/global', async (req, res) => {
  try {
    // Mock global statistics (would be from database in production)
    const stats = {
      totalValueLocked: '1,234.56',
      totalVaults: 42,
      averageAPY: 8.8,
      totalUsers: 156,
      last24hVolume: '345.67'
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

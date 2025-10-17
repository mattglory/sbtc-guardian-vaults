const axios = require('axios');
const cache = require('../cache');

// Stacks API endpoints
const STACKS_API = 'https://api.testnet.hiro.so';

class ProtocolService {
  constructor() {
    this.protocols = {
      zest: {
        name: 'Zest Protocol',
        type: 'lending',
        contractAddress: 'ST2X1GBHA2WJXREWP231EEQXZ1GDYZEEXYRAD1PA8.zest-protocol',
        baseAPY: 7.5,
        riskLevel: 'low'
      },
      velar: {
        name: 'Velar',
        type: 'dex',
        contractAddress: 'ST2X1GBHA2WJXREWP231EEQXZ1GDYZEEXYRAD1PA8.velar-dex',
        baseAPY: 9.2,
        riskLevel: 'medium'
      },
      stackswap: {
        name: 'StackSwap',
        type: 'dex',
        contractAddress: 'ST2X1GBHA2WJXREWP231EEQXZ1GDYZEEXYRAD1PA8.stackswap',
        baseAPY: 11.8,
        riskLevel: 'high'
      }
    };
  }

  /**
   * Get all protocol data
   */
  async getAllProtocols() {
    try {
      const cacheKey = 'all_protocols';
      const cached = cache.get(cacheKey);
      
      if (cached) {
        console.log('📊 Returning cached protocol data');
        return cached;
      }

      console.log('🔍 Fetching protocol data...');
      
      const protocolData = await Promise.all(
        Object.keys(this.protocols).map(key => this.getProtocolData(key))
      );

      const result = Object.keys(this.protocols).reduce((acc, key, index) => {
        acc[key] = protocolData[index];
        return acc;
      }, {});

      // Cache for 5 minutes
      cache.set(cacheKey, result, 300);
      
      console.log('✅ All protocol data fetched');
      return result;

    } catch (error) {
      console.error('Error fetching protocols:', error.message);
      return this.getMockProtocolData();
    }
  }

  /**
   * Get individual protocol data
   */
  async getProtocolData(protocolKey) {
    const protocol = this.protocols[protocolKey];
    
    if (!protocol) {
      throw new Error(`Unknown protocol: ${protocolKey}`);
    }

    try {
      // In production, fetch real contract data
      // For now, simulate with enhanced mock data
      
      const volatility = Math.random() * 0.5; // 0-0.5%
      const currentAPY = protocol.baseAPY + (Math.random() - 0.5) * 2;
      
      return {
        name: protocol.name,
        type: protocol.type,
        apy: parseFloat(currentAPY.toFixed(2)),
        baseAPY: protocol.baseAPY,
        tvl: this.calculateTVL(protocolKey),
        volume24h: this.calculateVolume(protocolKey),
        liquidity: this.calculateLiquidity(protocolKey),
        riskScore: this.calculateRiskScore(protocolKey),
        riskLevel: protocol.riskLevel,
        health: this.getProtocolHealth(currentAPY, protocol.baseAPY),
        utilization: parseFloat((60 + Math.random() * 30).toFixed(2)),
        users: Math.floor(100 + Math.random() * 400),
        status: 'active',
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error fetching ${protocolKey}:`, error.message);
      return this.getMockProtocolData()[protocolKey];
    }
  }

  /**
   * Calculate protocol TVL
   */
  calculateTVL(protocolKey) {
    const baseTVL = {
      zest: 2500000,
      velar: 1800000,
      stackswap: 1200000
    };
    
    const variance = (Math.random() - 0.5) * 200000;
    return parseFloat((baseTVL[protocolKey] + variance).toFixed(2));
  }

  /**
   * Calculate 24h volume
   */
  calculateVolume(protocolKey) {
    const baseVolume = {
      zest: 150000,
      velar: 450000,
      stackswap: 380000
    };
    
    const variance = (Math.random() - 0.5) * 50000;
    return parseFloat((baseVolume[protocolKey] + variance).toFixed(2));
  }

  /**
   * Calculate liquidity
   */
  calculateLiquidity(protocolKey) {
    const baseLiquidity = {
      zest: 800000,
      velar: 650000,
      stackswap: 420000
    };
    
    return parseFloat((baseLiquidity[protocolKey] * (0.9 + Math.random() * 0.2)).toFixed(2));
  }

  /**
   * Calculate risk score (0-100, lower is better)
   */
  calculateRiskScore(protocolKey) {
    const baseRisk = {
      zest: 25,
      velar: 45,
      stackswap: 65
    };
    
    return baseRisk[protocolKey] + Math.floor((Math.random() - 0.5) * 10);
  }

  /**
   * Get protocol health status
   */
  getProtocolHealth(currentAPY, baseAPY) {
    const deviation = Math.abs(currentAPY - baseAPY);
    
    if (deviation < 1) return 'excellent';
    if (deviation < 2) return 'good';
    if (deviation < 3) return 'fair';
    return 'warning';
  }

  /**
   * Get optimal allocation based on risk profile
   */
  getOptimalAllocation(riskProfile, totalAmount) {
    const allocations = {
      conservative: {
        zest: 0.70,
        velar: 0.20,
        stackswap: 0.10
      },
      moderate: {
        zest: 0.50,
        velar: 0.30,
        stackswap: 0.20
      },
      aggressive: {
        zest: 0.30,
        velar: 0.35,
        stackswap: 0.35
      }
    };

    const allocation = allocations[riskProfile.toLowerCase()] || allocations.moderate;
    
    return Object.keys(allocation).reduce((acc, protocol) => {
      acc[protocol] = {
        percentage: allocation[protocol] * 100,
        amount: totalAmount * allocation[protocol]
      };
      return acc;
    }, {});
  }

  /**
   * Calculate weighted APY for an allocation
   */
  calculateWeightedAPY(allocation, protocolData) {
    let weightedAPY = 0;
    
    Object.keys(allocation).forEach(protocol => {
      const weight = allocation[protocol].percentage / 100;
      const apy = protocolData[protocol].apy;
      weightedAPY += weight * apy;
    });
    
    return parseFloat(weightedAPY.toFixed(2));
  }

  /**
   * Get mock protocol data (fallback)
   */
  getMockProtocolData() {
    return {
      zest: {
        name: 'Zest Protocol',
        type: 'lending',
        apy: 7.5,
        baseAPY: 7.5,
        tvl: 2500000,
        volume24h: 150000,
        liquidity: 800000,
        riskScore: 25,
        riskLevel: 'low',
        health: 'excellent',
        utilization: 72.5,
        users: 245,
        status: 'active',
        lastUpdated: new Date().toISOString()
      },
      velar: {
        name: 'Velar',
        type: 'dex',
        apy: 9.2,
        baseAPY: 9.2,
        tvl: 1800000,
        volume24h: 450000,
        liquidity: 650000,
        riskScore: 45,
        riskLevel: 'medium',
        health: 'good',
        utilization: 68.3,
        users: 312,
        status: 'active',
        lastUpdated: new Date().toISOString()
      },
      stackswap: {
        name: 'StackSwap',
        type: 'dex',
        apy: 11.8,
        baseAPY: 11.8,
        tvl: 1200000,
        volume24h: 380000,
        liquidity: 420000,
        riskScore: 65,
        riskLevel: 'high',
        health: 'good',
        utilization: 85.7,
        users: 178,
        status: 'active',
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

module.exports = new ProtocolService();

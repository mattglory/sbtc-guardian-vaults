const axios = require('axios');
const cache = require('../cache');

// CoinGecko API (free, no API key required)
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

class PriceService {
  constructor() {
    this.cacheKey = 'btc_price';
    this.cacheTTL = 60; // 1 minute cache
  }

  /**
   * Get current BTC price in USD
   */
  async getCurrentPrice() {
    try {
      // Check cache first
      const cached = cache.get(this.cacheKey);
      if (cached) {
        console.log('💰 Returning cached BTC price:', cached.usd);
        return cached;
      }

      // Fetch from CoinGecko
      console.log('🔍 Fetching live BTC price from CoinGecko...');
      const response = await axios.get(`${COINGECKO_API}/simple/price`, {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true
        }
      });

      const data = {
        usd: response.data.bitcoin.usd,
        usd_24h_change: response.data.bitcoin.usd_24h_change,
        usd_24h_vol: response.data.bitcoin.usd_24h_vol,
        usd_market_cap: response.data.bitcoin.usd_market_cap,
        timestamp: new Date().toISOString()
      };

      // Cache the result
      cache.set(this.cacheKey, data, this.cacheTTL);
      
      console.log('✅ BTC Price:', data.usd);
      return data;

    } catch (error) {
      console.error('Error fetching BTC price:', error.message);
      
      // Return fallback price if API fails
      return {
        usd: 42000,
        usd_24h_change: 0,
        usd_24h_vol: 0,
        usd_market_cap: 0,
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }
  }

  /**
   * Get BTC price history (last N days)
   */
  async getPriceHistory(days = 30) {
    try {
      const cacheKey = `btc_history_${days}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        console.log(`💰 Returning cached BTC history (${days} days)`);
        return cached;
      }

      console.log(`🔍 Fetching BTC price history (${days} days)...`);
      const response = await axios.get(`${COINGECKO_API}/coins/bitcoin/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: days > 90 ? 'daily' : 'hourly'
        }
      });

      const prices = response.data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2))
      }));

      // Cache for 1 hour
      cache.set(cacheKey, prices, 3600);
      
      console.log(`✅ Fetched ${prices.length} price points`);
      return prices;

    } catch (error) {
      console.error('Error fetching BTC history:', error.message);
      
      // Return mock data as fallback
      return this.generateMockHistory(days);
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats() {
    try {
      const cacheKey = 'btc_market_stats';
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      console.log('🔍 Fetching BTC market statistics...');
      const response = await axios.get(`${COINGECKO_API}/coins/bitcoin`, {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false
        }
      });

      const data = response.data;
      const stats = {
        price: data.market_data.current_price.usd,
        marketCap: data.market_data.market_cap.usd,
        volume24h: data.market_data.total_volume.usd,
        priceChange24h: data.market_data.price_change_percentage_24h,
        priceChange7d: data.market_data.price_change_percentage_7d,
        priceChange30d: data.market_data.price_change_percentage_30d,
        ath: data.market_data.ath.usd,
        athDate: data.market_data.ath_date.usd,
        atl: data.market_data.atl.usd,
        atlDate: data.market_data.atl_date.usd,
        circulatingSupply: data.market_data.circulating_supply,
        totalSupply: data.market_data.total_supply,
        maxSupply: data.market_data.max_supply,
        timestamp: new Date().toISOString()
      };

      // Cache for 5 minutes
      cache.set(cacheKey, stats, 300);
      
      console.log('✅ Market stats fetched');
      return stats;

    } catch (error) {
      console.error('Error fetching market stats:', error.message);
      return null;
    }
  }

  /**
   * Generate mock price history as fallback
   */
  generateMockHistory(days) {
    const prices = [];
    let currentPrice = 42000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random walk
      const change = (Math.random() - 0.5) * 1000;
      currentPrice = Math.max(35000, Math.min(50000, currentPrice + change));
      
      prices.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(currentPrice.toFixed(2))
      });
    }
    
    return prices;
  }
}

module.exports = new PriceService();

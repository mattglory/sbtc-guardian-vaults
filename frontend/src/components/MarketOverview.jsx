import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import { TrendingUp, TrendingDown, DollarSign, Activity, Shield, Zap } from 'lucide-react';

export default function MarketOverview() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
    // Refresh every 60 seconds
    const interval = setInterval(loadMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      const data = await marketAPI.getMarketOverview();
      setMarketData(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading market data:', error);
      setLoading(false);
    }
  };

  if (loading || !marketData) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 backdrop-blur-sm border border-blue-500/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const { bitcoin, defi } = marketData;
  const btcChangePositive = bitcoin.change24h >= 0;

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 backdrop-blur-sm border border-blue-500/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="w-7 h-7 text-blue-400" />
          Live Market Data
        </h2>
        <div className="text-xs text-gray-400">
          Updates every 60s
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* BTC Price */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Bitcoin Price</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${bitcoin.price.toLocaleString()}
          </div>
          <div className={`flex items-center gap-1 text-sm ${btcChangePositive ? 'text-green-400' : 'text-red-400'}`}>
            {btcChangePositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{btcChangePositive ? '+' : ''}{bitcoin.change24h.toFixed(2)}%</span>
          </div>
        </div>

        {/* BTC Market Cap */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Market Cap</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${(bitcoin.marketCap / 1e9).toFixed(1)}B
          </div>
          <div className="text-sm text-gray-400">
            Bitcoin
          </div>
        </div>

        {/* Total DeFi TVL */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">DeFi TVL</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${(defi.totalTVL / 1e6).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-400">
            {defi.protocolCount} Protocols
          </div>
        </div>

        {/* 24h Volume */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-400">24h Volume</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${(defi.total24hVolume / 1e6).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-400">
            DeFi Activity
          </div>
        </div>
      </div>

      {/* Protocol Status */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Protocol Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(defi.protocols).map(([key, protocol]) => (
            <div key={key} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{protocol.name}</span>
                <div className={`w-2 h-2 rounded-full ${
                  protocol.health === 'excellent' ? 'bg-green-400' :
                  protocol.health === 'good' ? 'bg-blue-400' :
                  protocol.health === 'fair' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-400">APY</div>
                  <div className="text-green-400 font-medium">{protocol.apy}%</div>
                </div>
                <div>
                  <div className="text-gray-400">TVL</div>
                  <div className="text-white font-medium">${(protocol.tvl / 1e6).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-gray-400">Risk</div>
                  <div className={`font-medium ${
                    protocol.riskLevel === 'low' ? 'text-green-400' :
                    protocol.riskLevel === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {protocol.riskLevel.charAt(0).toUpperCase() + protocol.riskLevel.slice(1)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Users</div>
                  <div className="text-white font-medium">{protocol.users}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

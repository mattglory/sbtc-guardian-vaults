import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { TrendingUp, PieChart, Activity, DollarSign } from 'lucide-react';
import PortfolioChart from './PortfolioChart';
import APYChart from './APYChart';
import RiskExposureChart from './RiskExposureChart';

export default function AnalyticsDashboard({ address, riskProfile }) {
  const [performance, setPerformance] = useState(null);
  const [apyHistory, setApyHistory] = useState(null);
  const [exposure, setExposure] = useState(null);
  const [txAnalytics, setTxAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [address, riskProfile, timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [perfData, apyData, expData, txData] = await Promise.all([
        analyticsAPI.getPerformance(address, parseInt(timeframe)),
        analyticsAPI.getAPYHistory(riskProfile, parseInt(timeframe)),
        analyticsAPI.getRiskExposure(address),
        analyticsAPI.getTransactionAnalytics(address)
      ]);

      setPerformance(perfData);
      setApyHistory(apyData);
      setExposure(expData);
      setTxAnalytics(txData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/20">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!performance || !apyHistory || !exposure || !txAnalytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="w-7 h-7 text-purple-400" />
          Portfolio Analytics
        </h2>
        <div className="flex gap-2">
          {['7', '30', '90'].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeframe === days
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Total Profit/Loss</span>
          </div>
          <div className={`text-2xl font-bold ${txAnalytics.data.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {txAnalytics.data.profitLoss >= 0 ? '+' : ''}{txAnalytics.data.profitLoss.toFixed(5)} sBTC
          </div>
          <div className={`text-sm ${txAnalytics.data.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {txAnalytics.data.profitLossPercent >= 0 ? '+' : ''}{txAnalytics.data.profitLossPercent.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Deposits</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {txAnalytics.data.totalDeposits}
          </div>
          <div className="text-sm text-gray-400">
            Avg: {txAnalytics.data.averageDepositSize.toFixed(4)} sBTC
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Total Withdrawals</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {txAnalytics.data.totalWithdrawals}
          </div>
          <div className="text-sm text-gray-400">
            Net Flow: {txAnalytics.data.netFlow.toFixed(4)} sBTC
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Diversification</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {exposure.data.diversificationScore}
          </div>
          <div className="text-sm text-green-400">
            Excellent
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Performance */}
        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900/30 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Portfolio Performance
            </h3>
            <div className="text-sm text-gray-400">
              Last {timeframe} days
            </div>
          </div>
          <PortfolioChart data={performance.data} timeframe={`${timeframe}d`} />
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">Current: </span>
              <span className="text-white font-medium">
                ${performance.data[performance.data.length - 1]?.value.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Change: </span>
              <span className={`font-medium ${
                performance.data[performance.data.length - 1]?.change >= 0 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {performance.data[performance.data.length - 1]?.change >= 0 ? '+' : ''}
                {performance.data[performance.data.length - 1]?.change.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* APY History */}
        <div className="bg-gradient-to-br from-green-900/30 to-gray-900/30 rounded-2xl p-6 backdrop-blur-sm border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              APY History
            </h3>
            <div className="text-sm text-gray-400">
              {riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)}
            </div>
          </div>
          <APYChart data={apyHistory.data} />
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">Current APY: </span>
              <span className="text-green-400 font-medium">
                {apyHistory.data[apyHistory.data.length - 1]?.apy.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">Avg APY: </span>
              <span className="text-white font-medium">
                {(apyHistory.data.reduce((sum, d) => sum + d.apy, 0) / apyHistory.data.length).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Risk Exposure */}
        <div className="bg-gradient-to-br from-blue-900/30 to-gray-900/30 rounded-2xl p-6 backdrop-blur-sm border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              Protocol Allocation
            </h3>
            <div className="text-sm text-gray-400">
              {exposure.data.totalValue.toFixed(4)} sBTC
            </div>
          </div>
          <RiskExposureChart exposure={exposure.data} />
        </div>

        {/* Protocol Breakdown */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-gray-900/30 rounded-2xl p-6 backdrop-blur-sm border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              Protocol Details
            </h3>
          </div>
          <div className="space-y-4">
            {Object.entries(exposure.data.byProtocol).map(([protocol, data]) => (
              <div key={protocol} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium capitalize">{protocol}</span>
                  <span className="text-purple-400 font-semibold">{data.percentage}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white ml-2">{data.amount.toFixed(4)} sBTC</span>
                  </div>
                  <div>
                    <span className="text-gray-400">APY:</span>
                    <span className="text-green-400 ml-2">{data.apy}%</span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

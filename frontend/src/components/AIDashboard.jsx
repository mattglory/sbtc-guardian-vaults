import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { TrendingUp, Brain, AlertCircle, Activity } from 'lucide-react';

export default function AIDashboard({ vaultBalance, riskProfile }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [marketSentiment, setMarketSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIData();
  }, [vaultBalance, riskProfile]);

  const loadAIData = async () => {
    try {
      setLoading(true);

      // Load AI analysis and market sentiment in parallel
      const [analysis, sentiment] = await Promise.all([
        aiAPI.analyzeRisk(vaultBalance, riskProfile),
        aiAPI.getMarketSentiment()
      ]);

      setAiAnalysis(analysis);
      setMarketSentiment(sentiment);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">AI Intelligence</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4">Analyzing your portfolio...</p>
        </div>
      </div>
    );
  }

  if (!aiAnalysis || !marketSentiment) {
    return null;
  }

  const getRiskColor = (score) => {
    if (score < 40) return 'text-green-400';
    if (score < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'Bullish') return 'text-green-400';
    if (sentiment === 'Neutral') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* AI Risk Analysis */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">AI Risk Analysis</h2>
          </div>
          <button
            onClick={loadAIData}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Risk Score */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-gray-300">Risk Score</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getRiskColor(aiAnalysis.riskScore)}`}>
                {aiAnalysis.riskScore}
              </span>
              <span className="text-gray-400">/100</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Confidence: {(aiAnalysis.confidence * 100).toFixed(0)}%
            </p>
          </div>

          {/* Market Factors */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-300">Market Factors</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Volatility</span>
                <span className="text-white font-medium">{aiAnalysis.factors.marketVolatility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Liquidity Risk</span>
                <span className="text-white font-medium">{aiAnalysis.factors.liquidityRisk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protocol Risk</span>
                <span className="text-white font-medium">{aiAnalysis.factors.protocolRisk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">BTC Trend</span>
                <span className={`font-medium ${aiAnalysis.factors.btcTrend === 'Bullish' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {aiAnalysis.factors.btcTrend}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="mt-6 bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
          <h3 className="text-sm font-semibold text-purple-300 mb-2">AI Recommendation</h3>
          <p className="text-white mb-4">{aiAnalysis.recommendation}</p>
          
          <h4 className="text-sm font-semibold text-purple-300 mb-2">Suggested Actions</h4>
          <ul className="space-y-2">
            {aiAnalysis.suggestedActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-purple-400 mt-1">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Market Sentiment */}
      <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl p-6 backdrop-blur-sm border border-blue-500/20">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Market Sentiment</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Overall Sentiment */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Overall Sentiment</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getSentimentColor(marketSentiment.sentiment)}`}>
                {marketSentiment.sentiment}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Sentiment Score</span>
                <span className="text-white font-medium">{marketSentiment.score}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${marketSentiment.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Market Indicators */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Key Indicators</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Fear & Greed Index</span>
                <span className="text-white font-medium">{marketSentiment.indicators.fearGreedIndex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">BTC Dominance</span>
                <span className="text-white font-medium">{marketSentiment.indicators.btcDominance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">DeFi TVL</span>
                <span className="text-white font-medium">{marketSentiment.indicators.defiTVL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trading Volume</span>
                <span className="text-white font-medium">{marketSentiment.indicators.tradingVolume}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

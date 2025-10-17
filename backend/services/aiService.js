const OpenAI = require('openai');
const axios = require('axios');

class AIService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.grokKey = process.env.GROK_API_KEY;
    this.defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'openai';
    
    // Initialize OpenAI if key exists
    if (this.openaiKey && this.openaiKey !== 'your_openai_key_here') {
      this.openai = new OpenAI({
        apiKey: this.openaiKey
      });
      console.log('✅ OpenAI initialized');
    } else {
      console.log('⚠️  OpenAI key not configured - using fallback AI');
    }

    // Grok initialization (when available)
    if (this.grokKey && this.grokKey !== 'your_grok_key_here') {
      console.log('✅ Grok API key configured');
    }
  }

  /**
   * Generate AI portfolio analysis
   */
  async analyzePortfolio(data) {
    const { vaultBalance, riskProfile, btcPrice, btcChange, protocols } = data;

    try {
      // Try real AI first
      if (this.openai) {
        return await this.analyzeWithOpenAI(data);
      } else if (this.grokKey) {
        return await this.analyzeWithGrok(data);
      } else {
        // Fallback to rule-based AI
        return this.analyzeWithRuleBased(data);
      }
    } catch (error) {
      console.error('AI analysis error:', error.message);
      // Fallback to rule-based
      return this.analyzeWithRuleBased(data);
    }
  }

  /**
   * OpenAI GPT-4 Analysis
   */
  async analyzeWithOpenAI(data) {
    const { vaultBalance, riskProfile, btcPrice, btcChange, protocols } = data;

    const prompt = `You are a DeFi portfolio advisor analyzing a Bitcoin vault investment.

Portfolio Details:
- Balance: ${vaultBalance} sBTC (≈$${(vaultBalance * btcPrice).toFixed(2)})
- Risk Profile: ${riskProfile}
- BTC Price: $${btcPrice.toLocaleString()}
- 24h Change: ${btcChange > 0 ? '+' : ''}${btcChange.toFixed(2)}%

Available DeFi Protocols:
${Object.entries(protocols).map(([name, p]) => 
  `- ${p.name}: ${p.apy}% APY, $${(p.tvl/1e6).toFixed(1)}M TVL, ${p.riskLevel} risk`
).join('\n')}

Current Allocation (${riskProfile}):
- Zest: ${riskProfile === 'conservative' ? '70%' : riskProfile === 'moderate' ? '50%' : '30%'}
- Velar: ${riskProfile === 'conservative' ? '20%' : riskProfile === 'moderate' ? '30%' : '35%'}
- StackSwap: ${riskProfile === 'conservative' ? '10%' : riskProfile === 'moderate' ? '20%' : '35%'}

Provide a concise analysis in JSON format with:
{
  "riskScore": <number 0-100>,
  "recommendation": "<1-2 sentence recommendation>",
  "reasoning": "<brief explanation>",
  "suggestedActions": ["<action 1>", "<action 2>", "<action 3>"],
  "marketOutlook": "<bullish/neutral/bearish>",
  "rebalanceNeeded": <boolean>
}

Keep it professional, concise, and actionable.`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert DeFi portfolio advisor with deep knowledge of Bitcoin and DeFi protocols. Provide concise, actionable advice in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    
    return {
      provider: 'openai',
      model: 'gpt-4',
      ...aiResponse,
      confidence: 0.92,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Grok AI Analysis (when API becomes available)
   */
  async analyzeWithGrok(data) {
    const { vaultBalance, riskProfile, btcPrice, btcChange, protocols } = data;

    // Grok API endpoint (placeholder - update when Grok API is released)
    const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

    const prompt = `Analyze this DeFi Bitcoin portfolio:
- ${vaultBalance} sBTC at $${btcPrice}
- Risk: ${riskProfile}
- BTC 24h: ${btcChange > 0 ? '+' : ''}${btcChange.toFixed(2)}%

Protocols available: ${Object.values(protocols).map(p => `${p.name} (${p.apy}% APY)`).join(', ')}

Give me: risk score (0-100), recommendation, 3 actions, and market outlook. JSON format.`;

    try {
      const response = await axios.post(
        GROK_API_URL,
        {
          model: "grok-beta",
          messages: [
            { role: "system", content: "You are Grok, a witty DeFi expert." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 400
        },
        {
          headers: {
            'Authorization': `Bearer ${this.grokKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = JSON.parse(response.data.choices[0].message.content);
      
      return {
        provider: 'grok',
        model: 'grok-beta',
        ...aiResponse,
        confidence: 0.90,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Grok API error:', error.message);
      // Fallback to rule-based
      return this.analyzeWithRuleBased(data);
    }
  }

  /**
   * Rule-based AI (fallback when no API keys)
   */
  analyzeWithRuleBased(data) {
    const { vaultBalance, riskProfile, btcPrice, btcChange, protocols } = data;

    // Calculate dynamic risk score
    const baseRiskScores = {
      conservative: 25,
      moderate: 55,
      aggressive: 85
    };

    const volatilityMultipliers = {
      conservative: 0.5,
      moderate: 1.0,
      aggressive: 1.5
    };

    const baseScore = baseRiskScores[riskProfile.toLowerCase()] || 55;
    const multiplier = volatilityMultipliers[riskProfile.toLowerCase()] || 1.0;
    const volatilityImpact = Math.abs(btcChange) * multiplier;
    const riskScore = Math.min(100, Math.max(0, baseScore + volatilityImpact));

    // Generate recommendation
    let recommendation, reasoning, marketOutlook, rebalanceNeeded;

    if (riskScore < 40) {
      recommendation = "Low volatility detected. Portfolio stable. Consider maintaining current position.";
      reasoning = "Market conditions are favorable with low volatility. Your conservative allocation is performing well.";
      marketOutlook = "neutral";
      rebalanceNeeded = false;
    } else if (riskScore < 70) {
      recommendation = "Moderate market volatility. Balanced approach recommended. Monitor positions closely.";
      reasoning = "Increased market activity suggests staying alert. Current allocation is appropriate for moderate risk.";
      marketOutlook = btcChange > 0 ? "bullish" : "bearish";
      rebalanceNeeded = Math.abs(btcChange) > 3;
    } else {
      recommendation = "High volatility detected. Consider reducing exposure or rebalancing to lower risk profile.";
      reasoning = "Significant market movements increase portfolio risk. Consider more conservative positioning.";
      marketOutlook = "bearish";
      rebalanceNeeded = true;
    }

    // Generate suggested actions
    const suggestedActions = [];
    
    if (Math.abs(btcChange) > 5) {
      suggestedActions.push(`High BTC volatility (${btcChange > 0 ? '+' : ''}${btcChange.toFixed(2)}%) - consider reducing position size`);
    } else if (riskProfile === 'aggressive' && btcChange > 3) {
      suggestedActions.push('Consider taking profits on recent gains');
    } else {
      suggestedActions.push('Hold current position and monitor market conditions');
    }

    // Add protocol-specific advice
    const avgProtocolRisk = Object.values(protocols).reduce((sum, p) => sum + p.riskScore, 0) / Object.keys(protocols).length;
    if (avgProtocolRisk > 50) {
      suggestedActions.push('Monitor DeFi protocol health - average risk elevated');
    } else {
      suggestedActions.push('Protocol health good - maintain current allocations');
    }

    suggestedActions.push('Review allocation monthly and rebalance if needed');

    return {
      provider: 'rule-based',
      model: 'internal',
      riskScore: Math.round(riskScore),
      recommendation,
      reasoning,
      suggestedActions,
      marketOutlook,
      rebalanceNeeded,
      confidence: 0.87,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate natural language insights
   */
  async generateInsight(query, context) {
    try {
      if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful DeFi assistant. Provide clear, concise answers about the user's portfolio."
            },
            {
              role: "user",
              content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${query}`
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        });

        return {
          answer: completion.choices[0].message.content,
          provider: 'openai'
        };
      } else {
        return {
          answer: "AI assistant not configured. Please add your OpenAI API key to enable smart insights.",
          provider: 'fallback'
        };
      }
    } catch (error) {
      console.error('Insight generation error:', error.message);
      return {
        answer: "Unable to generate insight at this time.",
        provider: 'error'
      };
    }
  }

  /**
   * Check if AI is available
   */
  isAvailable() {
    return !!(this.openai || this.grokKey);
  }

  /**
   * Get AI status
   */
  getStatus() {
    return {
      openai: !!this.openai,
      grok: !!(this.grokKey && this.grokKey !== 'your_grok_key_here'),
      defaultProvider: this.defaultProvider,
      available: this.isAvailable()
    };
  }
}

module.exports = new AIService();

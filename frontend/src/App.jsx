import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Shield, Wallet, ExternalLink, CheckCircle, RefreshCw } from 'lucide-react';
import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect';
import { uintCV, stringAsciiCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { getAllVaultData, checkContractStatus, getUserTransactions } from './utils/contractReader';
import TransactionHistory from './components/TransactionHistory';
import Toast from './components/Toast';
import AIDashboard from './components/AIDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MarketOverview from './components/MarketOverview';
import AIChat from './components/AIChat';

// Constants
const SATOSHIS_PER_BTC = 100000000;
const CONTRACT_ADDRESS = 'ST2X1GBHA2WJXREWP231EEQXZ1GDYZEEXYRAD1PA8';
const CONTRACT_NAME = 'sbtc-vault';

function App() {
  const [userSession] = useState(new UserSession({ appConfig: new AppConfig(['store_write', 'publish_data']) }));
  const [userData, setUserData] = useState(null);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [apy, setApy] = useState(8.5);
  const [riskProfile, setRiskProfile] = useState('moderate');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [contractActive, setContractActive] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      if (userSession.isUserSignedIn()) {
        const data = userSession.loadUserData();
        setUserData(data);
        // Load vault data when user is signed in
        loadVaultData(data.profile.stxAddress.testnet);
      }
    } catch (error) {
      console.error('Session error, clearing localStorage:', error);
      // Clear stale session data
      localStorage.clear();
      window.location.reload();
    }
    
    // Check contract status on mount
    checkContractStatus().then(setContractActive);
  }, []);

  const loadVaultData = async (address) => {
    setDataLoading(true);
    try {
      const [data, txs] = await Promise.all([
        getAllVaultData(address),
        getUserTransactions(address)
      ]);
      
      setVaultBalance(data.balance);
      setRiskProfile(data.riskProfile);
      setTotalDeposits(data.totalDeposits);
      setApy(data.apy);
      setTransactions(txs.slice(0, 10)); // Show last 10 transactions
      
      console.log('✅ Loaded vault data from blockchain:', data);
      console.log('📋 Loaded transactions:', txs.length);
    } catch (error) {
      console.error('Error loading vault data:', error);
      setTxStatus('Error loading data from blockchain');
    } finally {
      setDataLoading(false);
    }
  };

  const refreshData = () => {
    if (userData) {
      loadVaultData(userData.profile.stxAddress.testnet);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'sBTC Guardian Vaults',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const data = userSession.loadUserData();
        setUserData(data);
        loadVaultData(data.profile.stxAddress.testnet);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut('/');
    setUserData(null);
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 0.001) {
      alert('Minimum deposit is 0.001 sBTC');
      return;
    }

    setLoading(true);
    setTxStatus('Preparing transaction...');

    try {
      await openContractCall({
        network: STACKS_TESTNET,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'deposit',
        functionArgs: [
          uintCV(Math.floor(parseFloat(depositAmount) * SATOSHIS_PER_BTC)),
          stringAsciiCV(riskProfile)
        ],
        onFinish: (data) => {
          showToast(`Deposit successful! TX: ${data.txId.slice(0, 8)}...`, 'success');
          setDepositAmount('');
          setTimeout(() => {
            refreshData();
          }, 3000);
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'warning');
        },
      });
    } catch (error) {
      console.error('Deposit error:', error);
      showToast('Deposit failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Invalid withdrawal amount');
      return;
    }

    setLoading(true);
    setTxStatus('Preparing transaction...');

    try {
      await openContractCall({
        network: STACKS_TESTNET,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'withdraw',
        functionArgs: [uintCV(Math.floor(parseFloat(withdrawAmount) * SATOSHIS_PER_BTC))],
        onFinish: (data) => {
          showToast(`Withdrawal successful! TX: ${data.txId.slice(0, 8)}...`, 'success');
          setWithdrawAmount('');
          setTimeout(() => {
            refreshData();
          }, 3000);
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'warning');
        },
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      showToast('Withdrawal failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleRiskProfile = async (newProfile) => {
    if (newProfile === riskProfile) return;

    setLoading(true);

    try {
      await openContractCall({
        network: STACKS_TESTNET,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-risk-profile',
        functionArgs: [stringAsciiCV(newProfile)],
        onFinish: (data) => {
          setRiskProfile(newProfile);
          showToast('Risk profile updated successfully!', 'success');
          setTimeout(() => {
            refreshData();
          }, 3000);
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'warning');
        },
      });
    } catch (error) {
      console.error('Risk profile error:', error);
      showToast('Failed to update risk profile: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">sBTC Guardian Vaults</h1>
                <p className="text-sm text-gray-400">AI-Powered Bitcoin DeFi Protection</p>
              </div>
            </div>
            
            {!userData ? (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={refreshData}
                  disabled={dataLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-all duration-200 disabled:opacity-50"
                  title="Refresh vault data from blockchain"
                >
                  <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                  <span className="text-sm">{dataLoading ? 'Loading...' : 'Refresh'}</span>
                </button>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Connected</div>
                  <div className="text-white font-mono text-sm">
                    {userData.profile.stxAddress.testnet.slice(0, 6)}...
                    {userData.profile.stxAddress.testnet.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!contractActive && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-white font-semibold">Contract Connection Issue</p>
              <p className="text-red-200 text-sm">Cannot connect to smart contract on testnet. Please check your connection.</p>
            </div>
          </div>
        )}
        
        {txStatus && (
          <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <p className="text-white">{txStatus}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-gray-400 text-sm">Your Balance</h3>
                {dataLoading && <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>}
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">{vaultBalance.toFixed(4)} sBTC</div>
            <div className="text-sm text-gray-400 mt-1">≈ ${(vaultBalance * 45000).toLocaleString()}</div>
            {userData && (
              <div className="text-xs text-purple-400 mt-2 flex items-center space-x-1">
                <span>🔗</span>
                <span>Live on Stacks Testnet</span>
              </div>
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Current APY</h3>
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{apy}%</div>
            <div className="text-sm text-green-400 mt-1">+0.3% this week</div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Deposits</h3>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{isNaN(totalDeposits) ? '0.00' : totalDeposits.toFixed(2)} sBTC</div>
            <div className="text-sm text-gray-400 mt-1">All vaults combined</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit/Withdraw Card */}
          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Manage Your Vault</h2>
            
            <div className="space-y-6">
              {/* Deposit Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deposit sBTC
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.001"
                    min="0.001"
                    disabled={!userData || loading}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={!userData || loading || !depositAmount}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Deposit</span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Minimum: 0.001 sBTC</p>
              </div>

              {/* Withdraw Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Withdraw sBTC
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.001"
                    disabled={!userData || loading}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleWithdraw}
                    disabled={!userData || loading || !withdrawAmount}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Withdraw</span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Available: {vaultBalance.toFixed(4)} sBTC</p>
              </div>
            </div>
          </div>

          {/* Risk Profile Card */}
          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">AI Risk Management</h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Select your risk tolerance. Our AI will automatically rebalance your portfolio across DeFi protocols.
              </p>

              <div className="space-y-3">
                {[
                  { value: 'conservative', label: 'Conservative', desc: 'Lower risk, stable returns (~6% APY)', color: 'green' },
                  { value: 'moderate', label: 'Moderate', desc: 'Balanced risk/reward (~8.5% APY)', color: 'purple' },
                  { value: 'aggressive', label: 'Aggressive', desc: 'Higher risk, maximum yield (~12% APY)', color: 'red' },
                ].map((profile) => (
                  <button
                    key={profile.value}
                    onClick={() => toggleRiskProfile(profile.value)}
                    disabled={!userData || loading}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                      riskProfile === profile.value
                        ? `border-${profile.color}-500 bg-${profile.color}-500/20`
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{profile.label}</div>
                        <div className="text-sm text-gray-400">{profile.desc}</div>
                      </div>
                      {riskProfile === profile.value && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {!userData && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-200">
                    Connect your wallet to start earning with AI-powered risk management
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Market Overview - Always visible */}
        <div className="mt-8">
          <MarketOverview />
        </div>

        {/* AI Dashboard */}
        {userData && (
          <div className="mt-8">
            <AIDashboard vaultBalance={vaultBalance} riskProfile={riskProfile} />
          </div>
        )}

        {/* Analytics Dashboard */}
        {userData && (
          <div className="mt-8">
            <AnalyticsDashboard 
              address={userData.profile.stxAddress.testnet} 
              riskProfile={riskProfile} 
            />
          </div>
        )}

        {/* Transaction History */}
        {userData && (
          <div className="mt-8">
            <TransactionHistory transactions={transactions} loading={dataLoading} />
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <Shield className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Protected by AI Guardian</h3>
              <p className="text-gray-300 text-sm mb-4">
                Your sBTC is automatically monitored 24/7 by our AI engine. It analyzes market conditions, 
                protocol risks, and rebalances your portfolio to maximize returns while protecting your capital.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Smart Contract Audited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Real-time Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Auto-rebalancing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat - Always available */}
      <AIChat 
        vaultBalance={vaultBalance}
        riskProfile={riskProfile}
        address={userData?.profile.stxAddress.testnet}
      />
    </div>
  );
}

export default App;

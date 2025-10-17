import { CheckCircle, XCircle, Clock, ExternalLink, ArrowDownCircle, ArrowUpCircle, Settings } from 'lucide-react';

export default function TransactionHistory({ transactions, loading }) {
  if (loading) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Transactions</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-gray-400">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Transactions</h2>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No transactions yet</p>
          <p className="text-sm text-gray-500 mt-2">Make your first deposit to get started!</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    if (status === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    } else if (status === 'pending') {
      return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getFunctionIcon = (functionName) => {
    if (functionName === 'deposit') {
      return <ArrowDownCircle className="w-5 h-5 text-green-400" />;
    } else if (functionName === 'withdraw') {
      return <ArrowUpCircle className="w-5 h-5 text-blue-400" />;
    } else if (functionName === 'set-risk-profile') {
      return <Settings className="w-5 h-5 text-purple-400" />;
    }
    return <CheckCircle className="w-5 h-5 text-gray-400" />;
  };

  const getFunctionLabel = (functionName) => {
    const labels = {
      'deposit': 'Deposit',
      'withdraw': 'Withdrawal',
      'set-risk-profile': 'Risk Profile Update',
    };
    return labels[functionName] || functionName;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
        <span className="text-sm text-gray-400">{transactions.length} total</span>
      </div>
      
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.txId}
            className="flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200"
          >
            <div className="flex items-center space-x-4 flex-1">
              {/* Function Icon */}
              <div className="flex-shrink-0">
                {getFunctionIcon(tx.functionName)}
              </div>
              
              {/* Transaction Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-white font-medium">{getFunctionLabel(tx.functionName)}</p>
                  {getStatusIcon(tx.status)}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-400 truncate font-mono">
                    {tx.txId.slice(0, 6)}...{tx.txId.slice(-4)}
                  </p>
                  <span className="text-xs text-gray-500">•</span>
                  <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                </div>
              </div>
              
              {/* View on Explorer */}
              <a
                href={`https://explorer.hiro.so/txid/${tx.txId}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                title="View on Explorer"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 hover:text-purple-400" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {transactions.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all transactions →
          </button>
        </div>
      )}
    </div>
  );
}

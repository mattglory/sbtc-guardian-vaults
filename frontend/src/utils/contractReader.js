import { 
  cvToJSON, 
  principalCV,
  standardPrincipalCV,
  hexToCV
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const CONTRACT_ADDRESS = 'ST2X1GBHA2WJXREWP231EEQXZ1GDYZEEXYRAD1PA8';
const CONTRACT_NAME = 'sbtc-vault';
const SATOSHIS_PER_BTC = 100000000;
const TESTNET_API = 'https://api.testnet.hiro.so';

/**
 * Call a read-only function using fetch with Stacks.js formatting
 */
async function callReadOnly(functionName, clarityArgs, sender) {
  const url = `${TESTNET_API}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${functionName}`;
  
  // Format arguments - Stacks.js v7 format
  const formattedArgs = clarityArgs.map(arg => {
    // Get the hex representation
    return cvToJSON(arg);
  });
  
  console.log(`📞 Calling ${functionName}`, { sender, args: formattedArgs });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: sender || CONTRACT_ADDRESS,
      arguments: formattedArgs.map(arg => {
        // Convert back to CV format that API expects
        if (typeof arg === 'string') {
          return arg;
        }
        return JSON.stringify(arg);
      })
    })
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error (${response.status}): ${text}`);
  }
  
  return response.json();
}

/**
 * SIMPLE APPROACH: Read balance from transaction events instead of read-only calls
 * This bypasses the serialization issue entirely!
 */
export async function getUserVault(userAddress) {
  try {
    console.log('🔍 Getting vault from transaction history for:', userAddress);
    
    // Get recent transactions for this address
    const txUrl = `${TESTNET_API}/extended/v1/address/${userAddress}/transactions?limit=50`;
    const txResponse = await fetch(txUrl);
    const txData = await txResponse.json();
    
    let balance = 0;
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let riskProfile = 'conservative';
    
    // Process transactions to calculate balance
    const vaultTxs = txData.results.filter(tx => 
      tx.tx_type === 'contract_call' &&
      tx.contract_call?.contract_id === `${CONTRACT_ADDRESS}.${CONTRACT_NAME}` &&
      tx.tx_status === 'success'
    );
    
    console.log(`📋 Found ${vaultTxs.length} vault transactions`);
    
    for (const tx of vaultTxs) {
      const functionName = tx.contract_call?.function_name;
      
      if (functionName === 'deposit') {
        // Extract amount from function args
        const args = tx.contract_call?.function_args || [];
        if (args.length > 0) {
          const amountArg = args[0];
          const amount = parseInt(amountArg.repr?.replace('u', '') || '0');
          balance += amount;
          totalDeposits += amount;
          console.log(`💰 Deposit: ${amount} satoshis`);
        }
        
        // Extract risk profile from second arg
        if (args.length > 1) {
          const profileArg = args[1];
          riskProfile = profileArg.repr?.replace(/"/g, '') || 'conservative';
        }
      } else if (functionName === 'withdraw') {
        const args = tx.contract_call?.function_args || [];
        if (args.length > 0) {
          const amountArg = args[0];
          const amount = parseInt(amountArg.repr?.replace('u', '') || '0');
          balance -= amount;
          totalWithdrawals += amount;
          console.log(`💸 Withdrawal: ${amount} satoshis`);
        }
      } else if (functionName === 'set-risk-profile') {
        const args = tx.contract_call?.function_args || [];
        if (args.length > 0) {
          const profileArg = args[0];
          riskProfile = profileArg.repr?.replace(/"/g, '') || 'conservative';
        }
      }
    }
    
    console.log('✅ Calculated vault data:', {
      balance,
      totalDeposits,
      totalWithdrawals,
      riskProfile
    });
    
    return {
      'sbtc-balance': balance,
      'risk-profile': riskProfile,
      'total-deposits': totalDeposits,
      'total-withdrawals': totalWithdrawals,
      'earned-rewards': 0,
      'last-deposit-block': 0
    };
  } catch (error) {
    console.error('❌ Error reading vault from transactions:', error);
    return {
      'sbtc-balance': 0,
      'risk-profile': 'conservative',
      'total-deposits': 0,
      'total-withdrawals': 0,
      'earned-rewards': 0,
      'last-deposit-block': 0
    };
  }
}

/**
 * Get user's vault balance
 */
export async function getUserVaultBalance(userAddress) {
  const vault = await getUserVault(userAddress);
  const balance = vault['sbtc-balance'] || 0;
  console.log(`💰 User balance: ${balance} satoshis = ${balance / SATOSHIS_PER_BTC} BTC`);
  return balance / SATOSHIS_PER_BTC;
}

/**
 * Get user's risk profile
 */
export async function getUserRiskProfile(userAddress) {
  const vault = await getUserVault(userAddress);
  return vault['risk-profile'] || 'conservative';
}

/**
 * Get total vault TVL from API
 */
export async function getTotalVaultDeposits() {
  try {
    // Use the simpler API endpoint
    const url = `${TESTNET_API}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-total-tvl`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: CONTRACT_ADDRESS,
        arguments: []
      })
    });
    
    if (!response.ok) {
      console.warn('Could not fetch TVL, using 0');
      return 0;
    }
    
    const data = await response.json();
    
    if (data.result) {
      const clarityValue = hexToCV(data.result);
      const jsonValue = cvToJSON(clarityValue);
      
      if (jsonValue && jsonValue.value !== undefined) {
        const tvl = parseInt(jsonValue.value);
        if (!isNaN(tvl)) {
          console.log(`🏦 Total TVL: ${tvl} satoshis = ${tvl / SATOSHIS_PER_BTC} BTC`);
          return tvl / SATOSHIS_PER_BTC;
        }
      } else if (jsonValue && typeof jsonValue === 'number') {
        if (!isNaN(jsonValue)) {
          console.log(`🏦 Total TVL: ${jsonValue} satoshis = ${jsonValue / SATOSHIS_PER_BTC} BTC`);
          return jsonValue / SATOSHIS_PER_BTC;
        }
      } else if (typeof jsonValue === 'string') {
        const tvl = parseInt(jsonValue);
        if (!isNaN(tvl)) {
          console.log(`🏦 Total TVL: ${tvl} satoshis = ${tvl / SATOSHIS_PER_BTC} BTC`);
          return tvl / SATOSHIS_PER_BTC;
        }
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error reading TVL:', error);
    return 0;
  }
}

/**
 * Get estimated APY
 */
export async function getVaultAPY(userAddress) {
  try {
    const profile = await getUserRiskProfile(userAddress);
    const apy = profile === 'aggressive' ? 12.0 : 8.0;
    console.log(`📈 APY for ${profile}: ${apy}%`);
    return apy;
  } catch (error) {
    console.error('Error calculating APY:', error);
    return 8.0;
  }
}

/**
 * Get all user vault data
 */
export async function getAllVaultData(userAddress) {
  try {
    console.log('🔍 Fetching vault data for:', userAddress);
    
    const [vault, totalDeposits] = await Promise.all([
      getUserVault(userAddress),
      getTotalVaultDeposits(),
    ]);
    
    const balance = (vault['sbtc-balance'] || 0) / SATOSHIS_PER_BTC;
    const riskProfile = vault['risk-profile'] || 'conservative';
    const apy = await getVaultAPY(userAddress);
    
    const data = {
      balance,
      riskProfile,
      totalDeposits,
      apy,
      totalUserDeposits: (vault['total-deposits'] || 0) / SATOSHIS_PER_BTC,
      totalWithdrawals: (vault['total-withdrawals'] || 0) / SATOSHIS_PER_BTC,
      earnedRewards: (vault['earned-rewards'] || 0) / SATOSHIS_PER_BTC,
    };
    
    console.log('✅ Vault data loaded:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching vault data:', error);
    return {
      balance: 0,
      riskProfile: 'conservative',
      totalDeposits: 0,
      apy: 8.0,
      totalUserDeposits: 0,
      totalWithdrawals: 0,
      earnedRewards: 0,
    };
  }
}

/**
 * Check contract status
 */
export async function checkContractStatus() {
  try {
    const url = `${TESTNET_API}/v2/contracts/interface/${CONTRACT_ADDRESS}/${CONTRACT_NAME}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Contract not found');
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Contract is accessible:', CONTRACT_ADDRESS);
    console.log('📋 Available functions:', Object.keys(data.functions || {}));
    return true;
  } catch (error) {
    console.error('❌ Contract check failed:', error);
    return false;
  }
}

/**
 * Get user transaction history
 */
export async function getUserTransactions(userAddress) {
  try {
    const url = `${TESTNET_API}/extended/v1/address/${userAddress}/transactions?limit=50`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    const data = await response.json();
    
    const vaultTxs = data.results.filter(tx => 
      tx.tx_type === 'contract_call' &&
      tx.contract_call?.contract_id === `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`
    );
    
    return vaultTxs.map(tx => ({
      txId: tx.tx_id,
      status: tx.tx_status,
      functionName: tx.contract_call?.function_name,
      timestamp: new Date(tx.burn_block_time * 1000).toISOString(),
      blockHeight: tx.block_height,
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

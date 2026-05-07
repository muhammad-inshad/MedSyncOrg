import React, { useEffect, useState } from 'react';
import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import toast from 'react-hot-toast';

const HospitalWallet = () => {
  // Wallet Data States
  const [balance, setBalance] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [transactions, setTransactions] = useState<{
    amount: number;
    type: "credit" | "debit";
    date: string;
    description?: string;
  }[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Withdrawal Form States
  const [amount, setAmount] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Fetch Wallet Data - FIXED
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await hospitalApi.getwallet();
      console.log("API Result:", result.data);

      if (result?.data?.success && result.data.data) {
        const walletData = result.data.data;
        console.log("Wallet Data:", walletData);

        setBalance(walletData.balance || 0);
        setTotalEarned(walletData.totalenrnings || 0);
        setTotalWithdrawn(walletData.totalwithdrawn || 0);
        
        // ✅ FIXED: Use 'transactions' + REVERSE for chronological (newest first)
        const reversedTransactions = (walletData.transactions || []).slice().reverse();
        setTransactions(reversedTransactions);
      } else {
        setError("Failed to load wallet information");
      }
    } catch (err: unknown) {
      console.error("Error fetching wallet:", err);
      setError("Something went wrong while fetching wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Format date to "Apr 30" format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Format amount with sign
  const formatAmount = (amount: number, type: string) => {
    const formatted = `₹${Math.abs(amount).toLocaleString('en-IN')}`;
    return type === 'credit' ? `+${formatted}` : `−${formatted}`;
  };

  const handleWithdraw = async () => {
    setWithdrawError('');
    setSuccess('');

    const amt = parseFloat(amount);

    if (!amt || amt <= 0) {
      return setWithdrawError('Please enter a valid amount.');
    }

    if (amt > balance) {
      return setWithdrawError(`Amount exceeds available balance of ₹${balance.toLocaleString('en-IN')}.`);
    }

    try {
      const result = await hospitalApi.withdraw({ amount: amt });
      if (result?.data?.success) {
        toast.success(result.data.message || "Withdrawal successful");
        setAmount('');
        fetchWalletData();  // ✅ Refresh + reverse order
      } else {
        toast.error(result?.data?.message || "Failed to process withdrawal");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Withdrawal failed");
    }
  };

  const setPreset = (value: number) => {
    setAmount(String(value));
    setWithdrawError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4" />
            <p className="text-gray-500">Loading wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Hospital Wallet</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 max-w-6xl">
          {/* Left Column */}
          <div className="col-span-2 space-y-4">
            {/* Balance Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-xs text-gray-500 mb-1">Available balance</p>
              <p className="text-4xl font-medium tracking-tight text-gray-900">
                ₹{balance.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Last updated: today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Total earned</p>
                  <p className="text-base font-medium text-gray-800">
                    ₹{totalEarned.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Withdrawn</p>
                  <p className="text-base font-medium text-gray-800">
                    ₹{totalWithdrawn.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Withdraw Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <p className="text-sm font-semibold text-gray-800">Withdraw funds</p>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setWithdrawError('');
                    setSuccess('');
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {[500, 1000, 5000, Math.floor(balance)].map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setPreset(v)}
                    className="text-xs border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    {i === 3 ? 'Max' : `₹${v.toLocaleString('en-IN')}`}
                  </button>
                ))}
              </div>

              {withdrawError && <p className="text-xs text-red-500">{withdrawError}</p>}
              {success && <p className="text-xs text-green-600 text-center font-medium">{success}</p>}

              <button
                onClick={handleWithdraw}
                disabled={!amount || parseFloat(amount) > balance || parseFloat(amount) <= 0}
                className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Request Withdrawal
              </button>
            </div>
          </div>

          {/* Right Column - Transactions (NEWEST FIRST) */}
          <div className="col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full">
              <p className="text-sm font-semibold text-gray-800 mb-4">
                Recent transactions
              </p>

              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-2">
                {transactions.length > 0 ? (
                  transactions.map((t, i) => (
                    <div key={i} className="flex justify-between items-center py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                            ${t.type === 'credit'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-red-50 text-red-500'}`}
                        >
                          {t.type === 'credit' ? '↑' : '↓'}
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            {t.description || (t.type === 'credit' ? 'Payment Received' : 'Withdrawal')}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(t.date)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-sm font-medium ${
                          t.type === 'credit' ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {formatAmount(t.amount, t.type)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No transactions yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalWallet;
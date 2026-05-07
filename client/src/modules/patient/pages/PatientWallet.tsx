import React, { useEffect, useState } from 'react';
import { patientApi } from '@/constants/backend/patient/patient.api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientWallet = () => {
    // Wallet Data States
    const [balance, setBalance] = useState<number>(0);
    const [totalAdded, setTotalAdded] = useState<number>(0);
    const [totalSpent, setTotalSpent] = useState<number>(0);


    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Withdraw Form States
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [withdrawError, setWithdrawError] = useState<string>('');

    // Add Money Modal States
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [addAmount, setAddAmount] = useState<string>('');
    const [addError, setAddError] = useState<string>('');
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<{ amount: number; type: "credit" | "debit"; date: string; label?: string }[]>([]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            setError('');

            const result = await patientApi.getWallet();

            if (result?.data?.success && result.data.data) {
                const walletData = result.data.data;
console.log(result.data)
                setBalance(walletData.balance || 0);
                setTotalAdded(walletData.totalAdded || 0);
                setTotalSpent(walletData.totalSpent || 0);

                if (walletData.Transaction && Array.isArray(walletData.Transaction)) {
                    setTransactions(walletData.Transaction);
                } else {
                    setTransactions([]);
                }
            } else {
                setError('Failed to load wallet information');
            }
        } catch (err: unknown) {
            console.error('Error fetching wallet:', err);
            setError('Something went wrong while fetching wallet data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    const formatAmount = (amount: number, type: string) => {
        const formatted = `₹${Math.abs(amount).toLocaleString('en-IN')}`;
        return type === 'credit' ? `+${formatted}` : `−${formatted}`;
    };

    // Withdraw Handler
    const handleWithdraw = async () => {
        setWithdrawError('');
        const amt = parseFloat(withdrawAmount);

        if (!amt || amt <= 0) return setWithdrawError('Please enter a valid amount.');
        if (amt > balance)
            return setWithdrawError(`Amount exceeds available balance of ₹${balance.toLocaleString('en-IN')}.`);

        const result = await patientApi.withdraw({ amount: amt });
        if (result?.data?.success) {
            toast.success(result.data.message || 'Withdrawal successful');
            setWithdrawAmount('');
            fetchWalletData();
        } else {
            toast.error(result?.data?.message || 'Failed to process withdrawal');
        }
    };

    // Add Money Handler
    const handleAddMoney = async () => {
        setAddError('');
        const amt = parseFloat(addAmount);

        if (!amt || amt <= 0) return setAddError('Please enter a valid amount.');

        const result = await patientApi.addToWallet({ amount: amt });
        if (result?.data?.success) {
            toast.success(result.data.message || `₹${amt.toLocaleString('en-IN')} added to wallet`);
            setAddAmount('');
            setShowAddModal(false);
            fetchWalletData();
        } else {
            toast.error(result?.data?.message || 'Failed to add money');
        }
    };

    const setWithdrawPreset = (value: number) => {
        setWithdrawAmount(String(value));
        setWithdrawError('');
    };

    const setAddPreset = (value: number) => {
        setAddAmount(String(value));
        setAddError('');
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

            <div className="flex-1 p-6 overflow-y-auto">
               <div className='flex items-center justify-between mb-6'>
                <h1 className="text-xl font-semibold text-gray-800 mb-6">My Wallet</h1>
                <button
                    onClick={() => navigate('/patient/profile')}
                    className="flex items-center gap-2 text-gray-700"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
                  </div>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4 w-full">
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
                                    <p className="text-xs text-gray-500 mb-1">Total added</p>
                                    <p className="text-base font-medium text-gray-800">
                                        ₹{totalAdded.toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">Total spent</p>
                                    <p className="text-base font-medium text-gray-800">
                                        ₹{totalSpent.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Withdraw + Add Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                            <p className="text-sm font-semibold text-gray-800">Withdraw funds</p>

                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={withdrawAmount}
                                    onChange={(e) => { setWithdrawAmount(e.target.value); setWithdrawError(''); }}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                                />
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {[500, 1000, 5000, Math.floor(balance)].map((v, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setWithdrawPreset(v)}
                                        className="text-xs border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                                    >
                                        {i === 3 ? 'Max' : `₹${v.toLocaleString('en-IN')}`}
                                    </button>
                                ))}
                            </div>

                            {withdrawError && <p className="text-xs text-red-500">{withdrawError}</p>}

                            <button
                                onClick={handleWithdraw}
                                disabled={!withdrawAmount || parseFloat(withdrawAmount) > balance || parseFloat(withdrawAmount) <= 0}
                                className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Request Withdrawal
                            </button>

                            {/* Add Money Button */}
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium py-3 rounded-lg transition-colors"
                            >
                                + Add Money to Wallet
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Transactions */}
                    <div className="col-span-1">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full">
                            <p className="text-sm font-semibold text-gray-800 mb-4">Recent transactions</p>
                            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-2">
                                {transactions.length > 0 ? (
                                    transactions.map((t, i) => (
                                        <div key={i} className="flex justify-between items-center py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                          ${t.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}
                                                >
                                                    {t.type === 'credit' ? '↑' : '↓'}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        {t.label || (t.type === 'credit' ? 'Added to wallet' : 'Consultation')}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.date)}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                                                {formatAmount(t.amount, t.type)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-sm">No transactions yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Money Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
                >
                    <div className="bg-white rounded-2xl p-7 w-96 shadow-xl">
                        <p className="text-base font-semibold text-gray-900 mb-1">Add Money to Wallet</p>
                        <p className="text-xs text-gray-400 mb-5">Amount will be credited to your wallet instantly</p>

                        <label className="text-xs text-gray-500 block mb-1">Amount (₹)</label>
                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={addAmount}
                            onChange={(e) => { setAddAmount(e.target.value); setAddError(''); }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300 mb-3"
                        />

                        <div className="flex gap-2 flex-wrap mb-3">
                            {[500, 1000, 2000, 5000].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setAddPreset(v)}
                                    className="text-xs border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                                >
                                    ₹{v.toLocaleString('en-IN')}
                                </button>
                            ))}
                        </div>

                        {addError && <p className="text-xs text-red-500 mb-2">{addError}</p>}

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => { setShowAddModal(false); setAddAmount(''); setAddError(''); }}
                                className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMoney}
                                disabled={!addAmount || parseFloat(addAmount) <= 0}
                                className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Add Money
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientWallet;
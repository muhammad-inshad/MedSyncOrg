import React, { useState } from 'react'
import DoctorSidebar from '../components/DoctorSidebar'

const transactions = [
  { date: 'Apr 26', label: 'Consultation — Rahul M.', amount: '+₹800', type: 'credit' },
  { date: 'Apr 25', label: 'Withdrawal to SBI ****4821', amount: '−₹2,000', type: 'debit' },
  { date: 'Apr 24', label: 'Consultation — Priya K.', amount: '+₹1,200', type: 'credit' },
  { date: 'Apr 23', label: 'Withdrawal to HDFC ****2293', amount: '−₹5,000', type: 'debit' },
]

const BALANCE = 24500

const DoctorWallet = () => {
  const [amount, setAmount] = useState('')
  const [bank, setBank] = useState('SBI — ****4821')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleWithdraw = () => {
    setError('')
    setSuccess('')
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return setError('Please enter a valid amount.')
    if (amt > BALANCE) return setError(`Amount exceeds available balance of ₹${BALANCE.toLocaleString('en-IN')}.`)
    setSuccess(`₹${amt.toLocaleString('en-IN')} withdrawal request submitted successfully.`)
    setAmount('')
  }

  const setPreset = (v: number) => {
    setAmount(String(v))
    setError('')
    setSuccess('')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">My Wallet</h1>

        {/* Two-column grid */}
        <div className="grid grid-cols-3 gap-4 max-w-6xl">

          {/* Left column */}
          <div className="col-span-2 space-y-4">

            {/* Balance Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-xs text-gray-500 mb-1">Available balance</p>
              <p className="text-4xl font-medium tracking-tight text-gray-900">₹24,500.00</p>
              <p className="text-xs text-gray-400 mt-1">Last updated: today, 2:40 PM</p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Total earned</p>
                  <p className="text-base font-medium text-gray-800">₹1,02,300</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Withdrawn</p>
                  <p className="text-base font-medium text-gray-800">₹77,800</p>
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
                  onChange={e => { setAmount(e.target.value); setError(''); setSuccess('') }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">To bank account</label>
                <select
                  value={bank}
                  onChange={e => setBank(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option>SBI — ****4821</option>
                  <option>HDFC — ****2293</option>
                </select>
              </div>

              <div className="flex gap-2 flex-wrap">
                {[500, 1000, 5000, BALANCE].map((v, i) => (
                  <button
                    key={v}
                    onClick={() => setPreset(v)}
                    className="text-xs border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    {i === 3 ? 'Max' : `₹${v.toLocaleString('en-IN')}`}
                  </button>
                ))}
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                onClick={handleWithdraw}
                className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Withdraw
              </button>

              {success && <p className="text-xs text-green-600 text-center">{success}</p>}
            </div>

          </div>

          {/* Right column — Transactions */}
          <div className="col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full">
              <p className="text-sm font-semibold text-gray-800 mb-4">Recent transactions</p>
              <div className="divide-y divide-gray-100">
                {transactions.map((t, i) => (
                  <div key={i} className="flex justify-between items-center py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Icon dot */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                        ${t.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {t.type === 'credit' ? '↑' : '↓'}
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">{t.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DoctorWallet
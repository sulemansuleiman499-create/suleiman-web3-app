'use client';

import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import ConnectButton from '../components/ConnectButton';
import { useState, useEffect } from 'react';

type Transaction = {
  hash: string;
  to: string;
  amount: string;
  timestamp: string;
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({ address });

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.001');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const { sendTransaction } = useSendTransaction();

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Auto refresh balance after faucet
  useEffect(() => {
    if (isFaucetLoading) {
      const timer = setTimeout(() => {
        refetch();
        setIsFaucetLoading(false);
        setStatus('✅ Balance updated!');
      }, 25000);
      return () => clearTimeout(timer);
    }
  }, [isFaucetLoading, refetch]);

  const handleGetTestETH = () => {
    setIsFaucetLoading(true);
    setStatus('Opening faucet...');
    window.open('https://sepoliafaucet.com', '_blank');
  };

  const handleSend = async () => {
    if (!recipient || !amount) {
      setStatus('Please fill recipient and amount');
      return;
    }
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      setStatus('Invalid recipient address');
      return;
    }

    setIsSending(true);
    setStatus(`Sending ${amount} ETH...`);

    try {
      const hash = await sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });

      const newTx: Transaction = {
        hash,
        to: recipient,
        amount,
        timestamp: new Date().toLocaleString(),
      };

      setTransactions([newTx, ...transactions]); // Add to top

      setStatus(`✅ Sent ${amount} ETH!`);
      window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');

      // Clear form
      setRecipient('');
    } catch (err: any) {
      setStatus(`❌ ${err.message || 'Transaction failed'}`);
    } finally {
      setIsSending(false);
    }
  };

 return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full">
        {/* Main Card: Reduced padding on mobile (p-6) vs desktop (p-10) */}
        <div className="bg-zinc-950/95 backdrop-blur-3xl border border-blue-500/30 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8 sm:space-y-10">

          <div className="text-center">
            {/* Smaller icon on mobile */}
            <div className="mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center text-4xl sm:text-6xl shadow-2xl">
              🚀
            </div>
            {/* Responsive text sizes */}
            <h1 className="text-3xl sm:text-5xl font-bold text-white">Suleiman Web3</h1>
            <p className="text-blue-400 text-lg sm:text-2xl mt-1">Wallet Sender</p>
          </div>

          {!isConnected ? (
            <div className="text-center py-8 sm:py-12 space-y-6">
              <p className="text-xl sm:text-3xl text-white">Ready to send test ETH?</p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
              <p className="text-zinc-400 text-sm">Switch to Sepolia testnet in MetaMask</p>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-10">
              {/* Wallet Info: Responsive padding and text */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6">
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500">CONNECTED WALLET</p>
                  {/* Truncate/Break-all ensures address doesn't push the card out */}
                  <p className="font-mono text-blue-300 break-all mt-2 text-xs sm:text-sm">{address}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500">BALANCE</p>
                  <p className="text-3xl sm:text-5xl font-semibold text-emerald-400">
                    {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} ETH
                  </p>
                </div>
              </div>

              {/* Get Test ETH */}
              <button
                onClick={handleGetTestETH}
                disabled={isFaucetLoading}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-2xl sm:rounded-3xl font-semibold text-base sm:text-lg hover:brightness-110 transition"
              >
                {isFaucetLoading ? '⏳ Processing...' : '💧 Get Free Test ETH'}
              </button>

              {/* Send Form */}
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm text-zinc-400 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x1234..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl focus:border-blue-500 text-white text-sm sm:text-base outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-zinc-400 mb-2">Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl focus:border-blue-500 text-white text-sm sm:text-base outline-none"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSending || !recipient || !amount}
                  className="w-full py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl font-bold text-lg sm:text-xl hover:brightness-110 transition disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : `Send ${amount} ETH`}
                </button>
              </div>

              {/* Transaction History: Adjusted for mobile height */}
              {transactions.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                  <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {transactions.map((tx, index) => (
                      <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-400 font-medium">Sent {tx.amount} ETH</span>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            View →
                          </a>
                        </div>
                        <p className="text-zinc-400 text-[10px] sm:text-xs mt-1 break-all">To: {tx.to}</p>
                        <p className="text-zinc-500 text-[10px] mt-2">{tx.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status && (
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-center border border-zinc-700 bg-zinc-900 text-xs sm:text-sm animate-pulse">
                  {status}
                </div>
              )}
            </div>
          )}
          
          {/* Ensure ConnectButton is centered on mobile */}
          <div className="flex justify-center pt-4">
             <ConnectButton />
          </div>
        </div>
      </div>
    </main>
  );
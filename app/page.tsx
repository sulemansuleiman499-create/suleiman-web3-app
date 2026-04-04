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
  const { address, isConnected, chain } = useAccount();
  const { data: balance, refetch } = useBalance({ address });

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.001');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const { sendTransaction } = useSendTransaction();

  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

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

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setStatus('✅ Address copied to clipboard');
      setTimeout(() => setStatus(''), 2000);
    }
  };

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

      setTransactions([newTx, ...transactions]);
      setShowConfetti(true);

      setStatus(`✅ Successfully sent ${amount} ETH! Transaction confirmed.`);

      window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
      setRecipient('');

      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err: any) {
      setStatus(`❌ ${err.message || 'Transaction failed'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(at_center,#3b82f610_0%,transparent_70%)]"></div>

      <div className="max-w-lg w-full relative z-10">
        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-9 md:p-11 space-y-7 sm:space-y-9">

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-6 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-3xl flex items-center justify-center text-6xl shadow-[0_0_40px_rgb(139,92,246,0.4)]">
              🚀
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tighter">
              Suleiman Web3
            </h1>
            <p className="text-violet-400 text-xl mt-1 font-medium">Wallet Sender</p>
          </div>

          {!isConnected ? (
            <div className="text-center py-10 space-y-6">
              <p className="text-2xl sm:text-3xl text-white">Ready to send test ETH on Sepolia?</p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
              <p className="text-zinc-500">Make sure you're on Sepolia testnet in MetaMask</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Wallet Info Card */}
              <div className="bg-zinc-950 border border-white/10 rounded-3xl p-7 space-y-6">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase tracking-[2px] text-zinc-500">CONNECTED WALLET</p>
                    <button
                      onClick={copyAddress}
                      className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition text-sm"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <p className="font-mono text-zinc-300 break-all mt-3 text-base leading-relaxed tracking-wide">
                    {address}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[2px] text-zinc-500">NETWORK</p>
                  <p className="text-emerald-400 font-medium mt-1">
                    {chain?.name || 'Sepolia Testnet'}
                  </p>
                  <p className="text-4xl sm:text-5xl font-semibold text-white mt-2 tracking-tighter">
                    {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} <span className="text-2xl text-zinc-500">ETH</span>
                  </p>
                </div>
              </div>

              {/* Get Free Test ETH */}
              <button
                onClick={handleGetTestETH}
                disabled={isFaucetLoading}
                className="w-full py-4.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 transition font-semibold text-lg rounded-3xl disabled:opacity-70 shadow-lg shadow-emerald-500/30"
              >
                {isFaucetLoading ? '⏳ Processing...' : '💧 Get Free Test ETH'}
              </button>

              {/* Send Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-950 border border-white/10 rounded-3xl focus:border-violet-500 text-white placeholder-zinc-500 outline-none text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-950 border border-white/10 rounded-3xl focus:border-violet-500 text-white placeholder-zinc-500 outline-none text-base"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSending || !recipient || !amount}
                  className="w-full py-4.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 font-bold text-xl rounded-3xl transition disabled:opacity-60 shadow-lg shadow-violet-600/40"
                >
                  {isSending ? 'Sending...' : `Send ${amount} ETH`}
                </button>
              </div>

              {/* Transaction History */}
              {transactions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {transactions.map((tx, index) => (
                      <div key={index} className="bg-zinc-950 border border-white/10 rounded-2xl p-5 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-400 font-medium">Sent {tx.amount} ETH</span>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:text-violet-300"
                          >
                            View on Etherscan →
                          </a>
                        </div>
                        <p className="text-zinc-500 text-xs mt-3 break-all">To: {tx.to}</p>
                        <p className="text-zinc-600 text-xs mt-2">{tx.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status && (
                <div className={`p-5 rounded-3xl text-center text-sm font-medium border transition-all duration-300 ${showConfetti ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300' : 'border-zinc-700 bg-zinc-950'}`}>
                  {status}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <ConnectButton />
          </div>
        </div>
      </div>
    </main>
  );
}
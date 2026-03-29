'use client';

import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import ConnectButton from '../components/ConnectButton';
import { useState, useEffect } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({ address });

  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);

  const { sendTransaction } = useSendTransaction();

  useEffect(() => {
    if (isFaucetLoading) {
      const timer = setTimeout(() => {
        refetch();
        setIsFaucetLoading(false);
        setStatus('✅ Balance should be updated now!');
      }, 25000);
      return () => clearTimeout(timer);
    }
  }, [isFaucetLoading, refetch]);

  const handleGetTestETH = () => {
    setIsFaucetLoading(true);
    setStatus('Opening faucet... Claim test ETH and return.');
    window.open('https://sepoliafaucet.com', '_blank');
  };

  const handleSend = async () => {
    if (!recipient) {
      setStatus('Please paste a recipient address');
      return;
    }
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      setStatus('Invalid address. Must start with 0x and be 42 characters.');
      return;
    }

    setIsSending(true);
    setStatus('Sending 0.001 test ETH...');

    try {
      const hash = await sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther('0.001'),
      });
      setStatus(`✅ Sent! Hash: ${hash}`);
      window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
    } catch (err: any) {
      setStatus(`❌ ${err.message || 'Failed'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex items-center justify-center p-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#a855f720_0%,transparent_50%)]"></div>

      <div className="max-w-lg w-full relative z-10">
        <div className="bg-zinc-900/95 backdrop-blur-3xl border border-purple-400/30 rounded-3xl shadow-2xl p-10 space-y-10">

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-3xl flex items-center justify-center text-6xl shadow-2xl ring-2 ring-purple-400/30">
              🚀
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tighter">
              Suleiman Web3
            </h1>
            <p className="text-purple-400 text-2xl mt-2 font-light">Wallet Sender</p>
          </div>

          {!isConnected ? (
            <div className="text-center py-12 space-y-8">
              <p className="text-3xl text-zinc-100">Ready to send test ETH?</p>
              <ConnectButton />
              <p className="text-zinc-400">Make sure you're on Sepolia testnet in MetaMask</p>
            </div>
          ) : (
            <div className="space-y-9">
              {/* Wallet Card */}
              <div className="bg-zinc-800/70 border border-zinc-700 rounded-3xl p-8 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">Connected Wallet</p>
                  <p className="font-mono text-purple-300 break-all mt-2 text-sm">{address}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">Balance</p>
                  <p className="text-5xl font-semibold text-emerald-400 mt-2">
                    {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} <span className="text-2xl">ETH</span>
                  </p>
                </div>
              </div>

              {/* Faucet Button */}
              <button
                onClick={handleGetTestETH}
                disabled={isFaucetLoading}
                className="w-full py-5 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 disabled:opacity-70 rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {isFaucetLoading ? '⏳ Processing...' : '💧 Get Free Test ETH'}
              </button>

              {/* Send Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-zinc-400 mb-3">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x1234... paste any address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-6 py-5 bg-zinc-800 border border-zinc-700 focus:border-purple-500 rounded-3xl text-white placeholder-zinc-500 focus:outline-none text-base"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSending || !recipient}
                  className="w-full py-5 text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-50 rounded-3xl transition-all shadow-2xl"
                >
                  {isSending ? 'Sending...' : 'Send 0.001 Test ETH'}
                </button>
              </div>

              {status && (
                <div className={`p-6 rounded-3xl text-center text-base border ${status.includes('✅') ? 'bg-emerald-900/70 border-emerald-400 text-emerald-300' : 'bg-red-900/70 border-red-400 text-red-300'}`}>
                  {status}
                </div>
              )}
            </div>
          )}

          <ConnectButton />

          <p className="text-center text-xs text-zinc-500 pt-6">
            Built with Next.js + Wagmi + RainbowKit • Sepolia Testnet
          </p>
        </div>
      </div>
    </main>
  );
}
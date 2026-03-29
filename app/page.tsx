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
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="bg-zinc-950/95 backdrop-blur-3xl border border-blue-500/30 rounded-3xl shadow-2xl p-10 space-y-10">

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-6xl shadow-2xl ring-4 ring-blue-500/20">
              🚀
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tighter">Suleiman Web3</h1>
            <p className="text-blue-400 text-2xl mt-2">Wallet Sender</p>
          </div>

          {!isConnected ? (
            <div className="text-center py-12 space-y-8">
              <p className="text-3xl text-white">Ready to send test ETH?</p>
              <ConnectButton />
              <p className="text-zinc-400">Make sure you're on Sepolia testnet in MetaMask</p>
            </div>
          ) : (
            <div className="space-y-9">
              {/* Wallet Info */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">CONNECTED WALLET</p>
                  <p className="font-mono text-blue-300 break-all mt-2 text-sm">{address}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">BALANCE</p>
                  <p className="text-5xl font-semibold text-emerald-400 mt-2">
                    {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} <span className="text-2xl">ETH</span>
                  </p>
                </div>
              </div>

              {/* Get Free Test ETH */}
              <button
                onClick={handleGetTestETH}
                disabled={isFaucetLoading}
                className="w-full py-5 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-cyan-500 hover:brightness-110 disabled:opacity-70 rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {isFaucetLoading ? '⏳ Processing...' : '💧 Get Free Test ETH'}
              </button>

              {/* Send Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-zinc-400 mb-3">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x1234... paste any address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-6 py-5 bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-3xl text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSending || !recipient}
                  className="w-full py-5 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 disabled:opacity-50 rounded-3xl transition-all shadow-2xl"
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
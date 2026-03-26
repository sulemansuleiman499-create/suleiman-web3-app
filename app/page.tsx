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

  // Auto refresh balance after faucet claim
  useEffect(() => {
    if (isFaucetLoading) {
      const timer = setTimeout(() => {
        refetch();
        setIsFaucetLoading(false);
        setStatus('Balance should be updated now. Check again if needed.');
      }, 25000);
      return () => clearTimeout(timer);
    }
  }, [isFaucetLoading, refetch]);

  const handleGetTestETH = () => {
    setIsFaucetLoading(true);
    setStatus('Opening faucet... Claim 0.5 ETH then come back.');
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

      setStatus(`✅ Transaction sent successfully! Hash: ${hash}`);
      window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
    } catch (err: any) {
      setStatus(`❌ ${err.message || 'Transaction failed'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl shadow-2xl p-10 space-y-10">
          
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              🚀
            </div>
            <h1 className="text-4xl font-bold text-white">Suleiman Web3</h1>
            <p className="text-purple-400 mt-2 text-xl">Wallet Sender</p>
          </div>

          {!isConnected ? (
            <div className="text-center space-y-6 py-8">
              <p className="text-2xl text-zinc-300">Connect your wallet to continue</p>
              <ConnectButton />
              <p className="text-sm text-zinc-500">
                First time? Switch to <span className="text-purple-400">Sepolia testnet</span> in MetaMask
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Wallet Info */}
              <div className="bg-zinc-800/70 border border-zinc-700 rounded-2xl p-6 space-y-5">
                <div>
                  <p className="text-zinc-400 text-sm">CONNECTED WALLET</p>
                  <p className="font-mono text-purple-300 text-sm break-all mt-1.5">
                    {address}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">BALANCE</p>
                  <p className="text-4xl font-semibold text-emerald-400 mt-1">
                    {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} ETH
                  </p>
                </div>
              </div>

              {/* Faucet Button */}
              <button
                onClick={handleGetTestETH}
                disabled={isFaucetLoading}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 disabled:opacity-60 rounded-2xl transition-all duration-200 shadow-xl flex items-center justify-center gap-3"
              >
                {isFaucetLoading ? '⏳ Waiting for faucet...' : '💧 Get Free Test ETH (0.5 ETH)'}
              </button>

              {/* Send Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">RECIPIENT ADDRESS</label>
                  <input
                    type="text"
                    placeholder="0x1234... (paste any address)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-purple-500 rounded-2xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSending || !recipient}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all duration-200 shadow-xl"
                >
                  {isSending ? 'Sending 0.001 ETH...' : 'Send 0.001 Test ETH'}
                </button>
              </div>

              {status && (
                <div className={`p-5 rounded-2xl text-center text-sm font-medium ${status.includes('✅') ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/60 text-red-400 border border-red-500/30'}`}>
                  {status}
                </div>
              )}
            </div>
          )}

          <ConnectButton />

          <p className="text-center text-xs text-zinc-500 pt-4">
            Built with Next.js + Wagmi + RainbowKit • Sepolia Testnet
          </p>
        </div>
      </div>
    </main>
  );
}
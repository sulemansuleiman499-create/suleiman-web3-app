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

  // Auto refresh balance after claiming from faucet
  useEffect(() => {
    if (isFaucetLoading) {
      const timer = setTimeout(() => {
        refetch();
        setIsFaucetLoading(false);
        setStatus('✅ Balance updated! You should now see your test ETH.');
      }, 25000);
      return () => clearTimeout(timer);
    }
  }, [isFaucetLoading, refetch]);

  const handleGetTestETH = () => {
    setIsFaucetLoading(true);
    setStatus('Opening Alchemy Sepolia Faucet... Claim 0.1 ETH and return here.');
    window.open('https://sepoliafaucet.com', '_blank');   // You can change to another faucet if you prefer
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

      setStatus(`✅ Transaction sent! Hash: ${hash}`);
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
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-5xl shadow-xl">
              🚀
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Suleiman Web3</h1>
            <p className="text-purple-400 text-xl mt-1">Wallet Sender</p>
          </div>

          {!isConnected ? (
            <div className="text-center py-12 space-y-6">
              <p className="text-2xl text-zinc-200">Connect your wallet to start</p>
              <ConnectButton />
              <p className="text-sm text-zinc-500">Switch to Sepolia testnet in MetaMask</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Wallet Info */}
              <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-7 space-y-6">
                <div>
                  <p className="uppercase text-xs tracking-widest text-zinc-500">Connected Wallet</p>
                  <p className="font-mono text-sm text-purple-300 break-all mt-2">{address}</p>
                </div>
                <div>
                  <p className="uppercase text-xs tracking-widest text-zinc-500">Balance</p>
                  <p className="text-4xl font-semibold text-emerald-400 mt-1">
                    {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} <span className="text-xl">ETH</span>
                  </p>
                </div>
              </div>

              {/* Get Test ETH Button */}
              <button
                onClick={handleGetTestETH}
                disabled={isFaucetLoading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 disabled:opacity-70 rounded-2xl font-semibold text-lg transition-all"
              >
                {isFaucetLoading ? '⏳ Checking faucet...' : '💧 Get Free Test ETH (0.1 ETH)'}
              </button>

              {/* Send Section */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x1234... paste any address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl focus:border-purple-500 outline-none text-white placeholder-zinc-500"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSending || !recipient}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:brightness-110 disabled:opacity-50 font-semibold text-lg rounded-2xl transition-all shadow-lg"
                >
                  {isSending ? 'Sending 0.001 ETH...' : 'Send 0.001 Test ETH'}
                </button>
              </div>

              {status && (
                <div className={`p-5 rounded-2xl text-sm text-center border ${status.includes('✅') ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400' : 'bg-red-950 border-red-500/30 text-red-400'}`}>
                  {status}
                </div>
              )}
            </div>
          )}

          <ConnectButton />

          <p className="text-center text-xs text-zinc-500">
            Built with Next.js + Wagmi + RainbowKit • Sepolia Testnet
          </p>
        </div>
      </div>
    </main>
  );
}
'use client';

import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import ConnectButton from '../components/ConnectButton';
import { useState } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { sendTransaction } = useSendTransaction();

  const handleSend = async () => {
    if (!recipient) {
      setStatus('Please paste a recipient address');
      return;
    }
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      setStatus('Invalid address. Must be 0x followed by 40 characters.');
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
      setStatus(`❌ Error: ${err.message || 'Failed to send'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl shadow-2xl p-10 space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-6xl">🚀</div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome Suleiman!
          </h1>
          <p className="mt-3 text-gray-400 text-lg">Your Web3 Wallet Sender</p>
        </div>

        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-xl text-gray-300 mb-6">Connect your wallet to continue</p>
            <ConnectButton />
            <p className="mt-8 text-sm text-gray-500">
              First time? Switch to <span className="text-purple-400 font-medium">Sepolia testnet</span> in MetaMask.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Wallet Info Card */}
            <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Connected Wallet</p>
                <p className="font-mono text-purple-300 break-all text-sm mt-1">
                  {address}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Balance</p>
                <p className="text-3xl font-bold text-green-400">
                  {balance ? balance.formatted : '0.00'} ETH
                </p>
              </div>
            </div>

            {/* Send Form */}
            <div className="space-y-5">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x... (paste Trust Wallet or any address)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none transition"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={isSending || !recipient}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 font-bold text-lg rounded-2xl transition-all duration-200 shadow-lg disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending 0.001 ETH...' : 'Send 0.001 Test ETH'}
              </button>
            </div>

            {status && (
              <div className={`p-4 rounded-2xl text-center text-sm ${status.includes('✅') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                {status}
              </div>
            )}
          </div>
        )}

        <ConnectButton />

        <p className="text-center text-xs text-gray-500 pt-4">
          Built with Next.js + Wagmi + RainbowKit • Sepolia Testnet
        </p>
      </div>
    </main>
  );
}
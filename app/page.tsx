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

      setStatus(`✅ Sent! Transaction hash: ${hash}`);
      window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message || 'Failed to send'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-8">Welcome Suleiman! 🚀</h1>

      {isConnected ? (
        <div className="text-center space-y-8 w-full max-w-md">
          <div>
            <p className="text-2xl mb-1">Connected as:</p>
            <p className="font-mono text-blue-400 break-all text-sm">{address}</p>
            <p className="mt-4 text-xl">
              Balance: <span className="font-bold text-green-400">
                {balance ? balance.formatted : '0.00'} ETH
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Paste recipient address (Trust Wallet or any)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />

            <button
              onClick={handleSend}
              disabled={isSending || !recipient}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 font-bold rounded-lg text-lg transition"
            >
              {isSending ? 'Sending...' : 'Send 0.001 Test ETH'}
            </button>
          </div>

          {status && <p className="text-lg text-yellow-400">{status}</p>}
        </div>
      ) : (
        <p className="text-xl">Connect your wallet to continue</p>
      )}

      <ConnectButton />

      <p className="mt-16 text-sm opacity-70">
        First time? Switch to Sepolia testnet in MetaMask.
      </p>
    </main>
  );
}
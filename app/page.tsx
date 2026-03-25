'use client';

import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import ConnectButton from '../components/ConnectButton';
import { useState } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const [recipient, setRecipient] = useState<string>(''); // Input for any address
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [status, setStatus] = useState<string>('');

  const { sendTransaction } = useSendTransaction();
  const { data: receipt } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSendTestETH = async () => {
    if (!address || !recipient) {
      setStatus('Please enter a recipient address');
      return;
    }

    // Basic address validation (starts with 0x, 42 chars)
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      setStatus('Invalid recipient address');
      return;
    }

    setStatus('Sending...');
    try {
      const hash = await sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther('0.001'), // 0.001 test ETH
      });
      setTxHash(hash);
      setStatus('Transaction sent! Waiting for confirmation...');
    } catch (error) {
      setStatus('Error: ' + (error as Error).message);
    }
  };

  if (receipt) {
    setStatus(`Success! Tx hash: ${receipt.transactionHash}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-8">Welcome Suleiman! 🚀</h1>
      
      {isConnected ? (
        <div className="text-center mb-12 space-y-6 w-full max-w-md">
          <div>
            <p className="text-2xl mb-2">
              Connected as: <span className="font-mono text-blue-400 break-all">{address}</span>
            </p>
            <p className="text-xl">
              Balance: <span className="font-bold text-green-400">
                {balance ? balance.formatted : '0.00'} {balance ? balance.symbol : 'ETH'}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Paste recipient address (e.g. Trust Wallet)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
            />

            <button
              onClick={handleSendTestETH}
              disabled={!balance || balance.value === 0n || !recipient}
              className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-lg shadow-lg disabled:opacity-50"
            >
              Send 0.001 Test ETH
            </button>

            {status && <p className="text-lg mt-4 text-yellow-400">{status}</p>}
          </div>
        </div>
      ) : (
        <p className="text-xl mb-12">Connect your wallet to see your address and balance</p>
      )}

      <ConnectButton />

      <p className="mt-12 text-lg opacity-70">
        First time? Install MetaMask and switch to Sepolia testnet if needed.
      </p>
    </main>
  );
}
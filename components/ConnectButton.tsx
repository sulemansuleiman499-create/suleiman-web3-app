'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectButtonComponent() {
  return (
    <ConnectButton 
      label="Connect Wallet"
      accountStatus="address"
      showBalance={true}
      chainStatus="icon"
    />
  );
}
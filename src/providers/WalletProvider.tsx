"use client";

import {
  AptosWalletAdapterProvider,
  NetworkName,
} from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      onError={(error) => {
        console.error("Wallet adapter error:", error);
      }}
      network={NetworkName.Testnet} // Use Mainnet when ready
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default WalletProvider;

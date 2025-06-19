
i"use client"; // (If using Next.js and in app directory, ensure it's marked as a client component)

import { AptosWalletAdapterProvider, NetworkName } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  // SAFETY: window might be undefined during SSR (Next.js or similar)
  const dappInfo = {
    name: "Jungle Cups Game",
    url: typeof window !== "undefined" ? window.location.origin : "", // Fallback to empty string if server-side
    iconUrl: "/lovable-uploads/2b7b2c72-28d9-4d98-9913-f85587df0f8c.png",
  };

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      onError={(error) => {
        console.error("Wallet adapter error:", error);
      }}
      dappInfo={dappInfo}
      network={NetworkName.Testnet} // or Mainnet if you're live
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default WalletProvider;

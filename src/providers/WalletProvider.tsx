
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren, useEffect, useState } from "react";
import { Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  // We're not using plugins since we're having issues with the wallet-standard package
  // Instead, we'll rely on window.aptos which is provided by Petra and other wallets
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure the browser has loaded any wallet extensions
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, []);

  if (!isReady) {
    return null; // Wait until we've checked for wallet availability
  }

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      // Use proper property for network based on library requirements
      networkName={NetworkToNetworkName[Network.TESTNET]}
      plugins={[]} // Empty plugins array instead of optInWallets
      onError={(error) => {
        console.error("Wallet adapter error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default WalletProvider;

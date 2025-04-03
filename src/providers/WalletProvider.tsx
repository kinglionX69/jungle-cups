
import { AptosWalletAdapterProvider, NetworkName } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  // Define wallet adapter configuration
  return (
    <AptosWalletAdapterProvider
      plugins={[]}
      autoConnect={true}
      onError={(error) => {
        console.error('Wallet adapter error:', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default WalletProvider;

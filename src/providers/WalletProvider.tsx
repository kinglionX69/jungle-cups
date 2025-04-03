
import { AptosWalletAdapterProvider, NetworkName } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { PetraWallet } from "petra-plugin-wallet-adapter";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  // Define wallet adapter configuration with correct wallet plugins
  const wallets = [new PetraWallet()];

  return (
    <AptosWalletAdapterProvider
      wallets={wallets}
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


import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { PetraWallet } from "petra-plugin-wallet-adapter";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  // Define wallet adapter configuration with correct wallet plugins
  const wallets = [new PetraWallet()];
  
  // Define dApp info for wallet display
  const dappInfo = {
    name: "Jungle Cups Game",
    url: window.location.origin,
    icon: "/lovable-uploads/2b7b2c72-28d9-4d98-9913-f85587df0f8c.png",
  };

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      onError={(error) => {
        console.error('Wallet adapter error:', error);
      }}
      dappInfo={dappInfo}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default WalletProvider;

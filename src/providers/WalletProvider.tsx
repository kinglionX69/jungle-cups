
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  // Define dApp info for wallet display
  const dappInfo = {
    name: "Jungle Cups Game",
    url: window.location.origin,
    iconUrl: "/lovable-uploads/2b7b2c72-28d9-4d98-9913-f85587df0f8c.png",
  };

  return (
    <AptosWalletAdapterProvider
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

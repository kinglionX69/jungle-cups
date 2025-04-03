
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const dappInfo = {
    aptosConnect: {
      dappName: "Jungle Cups Game",
      dappImageURI: "/lovable-uploads/3f7aa2ea-d29b-4cf6-bfcf-b727b6905b84.png", // Cup image as the dApp logo
    },
  };

  return (
    <AptosWalletAdapterProvider
      dappInfo={dappInfo}
      autoConnect
      optInWallets={["Petra"]}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default WalletProvider;

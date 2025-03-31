
import Logo from "@/components/Logo";
import WalletConnect from "@/components/WalletConnect";

interface PageHeaderProps {
  onConnect: (wallet: string) => void;
  connected: boolean;
  walletAddress: string;
}

const PageHeader = ({
  onConnect,
  connected,
  walletAddress
}: PageHeaderProps) => {
  return (
    <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center backdrop-blur-sm bg-white/30 p-4 rounded-lg border border-jungle-green/30">
      <div className="mb-4 sm:mb-0">
        <Logo />
        <p className="text-jungle-darkGreen font-bungee ml-1 mx-0 my-[16px] text-shadow">Find the ball, win the prize!</p>
      </div>
      
      <WalletConnect onConnect={onConnect} connected={connected} walletAddress={walletAddress} />
    </header>
  );
};

export default PageHeader;

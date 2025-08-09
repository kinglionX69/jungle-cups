
import Logo from "@/components/Logo";
import WalletConnect from "@/components/WalletConnect";

interface WelcomeScreenProps {
  onConnect: (wallet: string) => void;
}

const WelcomeScreen = ({
  onConnect
}: WelcomeScreenProps) => {
  return (
    <div className="game-container text-center py-16">
      {/* Decorative elements */}
      <div className="absolute top-4 left-4 w-16 h-16 bg-jungle-lightGreen/30 rounded-full blur-md"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 bg-jungle-yellow/30 rounded-full blur-md"></div>
      
      <div className="flex justify-center mb-6">
        <Logo className="mx-auto" />
      </div>
      
      <h2 className="text-3xl font-luckiest text-jungle-darkGreen mb-4">
        Connect Your Wallet to Play
      </h2>
      
      <p className="mb-8 text-lg max-w-xl mx-auto text-jungle-darkGreen/90">
        Connect your Aptos wallet to start playing Jungle Cups and win APT!
      </p>
      
      <WalletConnect onConnect={onConnect} connected={false} walletAddress="" />
    </div>
  );
};

export default WelcomeScreen;

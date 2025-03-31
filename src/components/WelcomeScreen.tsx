
import Logo from "@/components/Logo";
import WalletConnect from "@/components/WalletConnect";

interface WelcomeScreenProps {
  onConnect: (wallet: string) => void;
}

const WelcomeScreen = ({
  onConnect
}: WelcomeScreenProps) => {
  return <div className="game-container text-center py-16">
      <div className="flex justify-center mb-6">
        <Logo className="mx-auto" />
      </div>
      <h2 className="text-3xl font-luckiest text-jungle-darkGreen mb-4">
        Connect Your Wallet to Play
      </h2>
      <p className="mb-8 text-lg max-w-xl mx-auto">Connect your Aptos wallet to start playing Jungle Cups Game & win APT or LionHeart🦁♥️ Emojicoin!</p>
      <WalletConnect onConnect={onConnect} connected={false} walletAddress="" />
    </div>;
};

export default WelcomeScreen;

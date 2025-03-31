
import { Trophy } from "lucide-react";
import WalletConnect from "@/components/WalletConnect";

interface WelcomeScreenProps {
  onConnect: (wallet: string) => void;
}

const WelcomeScreen = ({ onConnect }: WelcomeScreenProps) => {
  return (
    <div className="game-container text-center py-16">
      <Trophy className="w-16 h-16 mx-auto mb-6 text-jungle-yellow" />
      <h2 className="text-3xl font-luckiest text-jungle-darkGreen mb-4">
        Connect Your Wallet to Play
      </h2>
      <p className="mb-8 text-lg max-w-xl mx-auto">
        Connect your Aptos wallet to start playing the Jungle Cups Game and win APT or Emojicoin tokens!
      </p>
      <WalletConnect 
        onConnect={onConnect}
        connected={false}
        walletAddress=""
      />
    </div>
  );
};

export default WelcomeScreen;

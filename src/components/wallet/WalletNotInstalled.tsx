
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface WalletNotInstalledProps {
  onClick: () => void;
}

const WalletNotInstalled = ({ onClick }: WalletNotInstalledProps) => {
  const isMobile = useIsMobile();
  
  // Button styling based on device
  const buttonClasses = isMobile ? "w-full justify-center py-3 text-base" : "";

  return (
    <Button 
      className={`jungle-btn ${buttonClasses}`} 
      onClick={onClick}
    >
      <Smartphone className="mr-2 h-5 w-5" />
      Get Petra Wallet
    </Button>
  );
};

export default WalletNotInstalled;

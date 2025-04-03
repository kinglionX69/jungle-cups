
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { redirectToPetraMobile, isMobileDevice, isInPetraMobileBrowser } from "@/utils/mobileUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WalletNotInstalledProps {
  onClick: () => void;
}

const WalletNotInstalled = ({ onClick }: WalletNotInstalledProps) => {
  const isMobile = useIsMobile();
  const buttonClasses = isMobile ? "w-full justify-center py-3 text-base" : "";

  const handleClick = () => {
    if (isInPetraMobileBrowser()) {
      console.log("Already in Petra browser, trying to connect");
      onClick();
      return;
    }
    
    if (isMobileDevice()) {
      console.log("Mobile device detected, redirecting to Petra mobile");
      redirectToPetraMobile();
    } else {
      console.log("Desktop device detected, opening Petra website");
      window.open("https://petra.app/", "_blank");
    }
  };

  return (
    <Button 
      className={`jungle-btn ${buttonClasses}`} 
      onClick={handleClick}
    >
      <Smartphone className="mr-2 h-5 w-5" />
      {isInPetraMobileBrowser() ? "Connect Wallet" : "Get Petra Wallet"}
    </Button>
  );
};

export default WalletNotInstalled;

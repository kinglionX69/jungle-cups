
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { redirectToPetraMobile, isMobileDevice } from "@/utils/mobileUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WalletNotInstalledProps {
  onClick: () => void;
}

const WalletNotInstalled = ({ onClick }: WalletNotInstalledProps) => {
  const isMobile = useIsMobile();
  const buttonClasses = isMobile ? "w-full justify-center py-3 text-base" : "";

  return (
    <Button 
      className={`jungle-btn ${buttonClasses}`} 
      onClick={() => {
        if (isMobileDevice()) {
          redirectToPetraMobile();
        } else {
          window.open("https://petra.app/", "_blank");
        }
      }}
    >
      <Smartphone className="mr-2 h-5 w-5" />
      Connect Wallet
    </Button>
  );
};

export default WalletNotInstalled;

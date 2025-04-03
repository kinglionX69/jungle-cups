
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { redirectToPetraMobile, isMobileDevice, isInPetraMobileBrowser } from "@/utils/mobileUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";

interface WalletNotInstalledProps {
  onClick: () => void;
}

const WalletNotInstalled = ({ onClick }: WalletNotInstalledProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const buttonClasses = isMobile ? "w-full justify-center py-3 text-base" : "";

  const handleClick = () => {
    // If we're already in the Petra mobile browser, try to connect directly
    if (isInPetraMobileBrowser()) {
      console.log("Already in Petra browser, trying to connect directly");
      onClick();
      return;
    }
    
    // For other mobile devices, redirect to Petra app
    if (isMobileDevice()) {
      console.log("Mobile device detected, redirecting to Petra mobile app");
      toast({
        title: "Opening Petra Wallet",
        description: "Redirecting to the Petra mobile app...",
      });
      redirectToPetraMobile();
      return;
    }
    
    // For desktop devices, open the Petra website
    console.log("Desktop device detected, opening Petra website");
    toast({
      title: "Wallet Not Found",
      description: "Opening Petra website to download the extension",
    });
    window.open("https://petra.app/", "_blank");
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

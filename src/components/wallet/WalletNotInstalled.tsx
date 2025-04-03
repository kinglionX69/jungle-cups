
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { redirectToPetraMobile, isMobileDevice, isInPetraMobileBrowser } from "@/utils/mobileUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface WalletNotInstalledProps {
  onClick: () => void;
}

const WalletNotInstalled = ({ onClick }: WalletNotInstalledProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Button styling based on device
  const buttonClasses = isMobile ? "w-full justify-center py-3 text-base" : "";
  
  // Button text based on browser
  const buttonText = isInPetraMobileBrowser() ? "Connect Wallet" : "Get Petra Wallet";

  const handleClick = () => {
    // Prevent multiple clicks
    if (isRedirecting) return;
    
    try {
      setIsRedirecting(true);
      
      // Already in Petra mobile browser - try direct connection
      if (isInPetraMobileBrowser()) {
        console.log("Already in Petra browser, trying to connect directly");
        onClick();
        return;
      }
      
      // For mobile devices, redirect to Petra app
      if (isMobileDevice()) {
        console.log("Mobile device detected, redirecting to Petra mobile app");
        toast({
          title: "Opening Petra Wallet",
          description: "Redirecting to the Petra mobile app...",
        });
        redirectToPetraMobile();
        return;
      }
      
      // For desktop devices, open Petra website to download extension
      console.log("Desktop device detected, opening Petra website");
      toast({
        title: "Wallet Not Found",
        description: "Opening Petra website to download the extension",
      });
      window.open("https://petra.app/", "_blank");
    } catch (error) {
      console.error("Error in wallet redirection:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset redirecting state after a short delay
      setTimeout(() => setIsRedirecting(false), 1000);
    }
  };

  return (
    <Button 
      className={`jungle-btn ${buttonClasses}`} 
      onClick={handleClick}
      disabled={isRedirecting}
    >
      <Smartphone className="mr-2 h-5 w-5" />
      {buttonText}
    </Button>
  );
};

export default WalletNotInstalled;

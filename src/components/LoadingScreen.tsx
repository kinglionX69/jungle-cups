
import React, { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";

interface LoadingScreenProps {
  progress?: number;
}

const LoadingScreen = ({ progress }: LoadingScreenProps) => {
  const showProgress = progress !== undefined;
  const isMobile = useIsMobile();
  const [displayProgress, setDisplayProgress] = useState(0);
  
  // Single loading message for simplicity
  const loadingMessage = "Preparing the jungle cups game...";
  
  // Smooth progress animation with faster progression
  useEffect(() => {
    if (progress !== undefined) {
      // On mobile, progress faster
      const increment = isMobile ? 1.5 : 0.8;
      setDisplayProgress(prev => Math.max(prev, progress, prev + increment));
    }
  }, [progress, isMobile]);
  
  // Force progress to complete quickly
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (displayProgress < 100) {
      interval = setInterval(() => {
        setDisplayProgress(prev => {
          // Accelerate progress faster on mobile
          if (prev >= 95) return 100;
          if (isMobile) return prev + 2; // Faster on mobile
          return prev + 0.5;
        });
      }, 40); // Update more frequently for smoother animation
    }
    
    return () => clearInterval(interval);
  }, [displayProgress, isMobile]);
  
  return (
    <div 
      className="fixed inset-0 bg-jungle-background flex flex-col items-center justify-center z-50"
      style={{ backgroundColor: '#f0f9e8' }}
    >
      <div className={`text-center p-4 ${isMobile ? 'max-w-[95%]' : 'max-w-md'}`}>
        <div className="mb-4">
          <Logo className={isMobile ? "scale-90 mb-3" : "scale-125 mb-6"} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Loader2 className="h-5 w-5 text-jungle-green animate-spin" />
          <span className={`${isMobile ? 'text-base' : 'text-xl'} font-bungee text-jungle-darkGreen`}>
            Loading game...
          </span>
        </div>
        
        {showProgress && (
          <div className="w-full mt-2 mb-2">
            <Progress value={displayProgress} className="h-2" />
            <p className="text-xs text-right mt-1 text-jungle-darkGreen">
              {Math.round(displayProgress)}%
            </p>
          </div>
        )}
        
        <p className={`mt-2 text-jungle-darkGreen opacity-80 ${isMobile ? 'text-sm' : ''}`}>
          {loadingMessage}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;

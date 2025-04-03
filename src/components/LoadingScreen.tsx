
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
  
  // Smooth progress animation
  useEffect(() => {
    if (progress !== undefined) {
      // Ensure progress always moves forward, even if actual progress stalls
      setDisplayProgress(prev => Math.max(prev, progress, prev + 0.5));
    }
  }, [progress]);
  
  // Force progress to complete if it gets stuck
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (displayProgress < 100) {
      interval = setInterval(() => {
        setDisplayProgress(prev => {
          // Accelerate progress if it seems stuck
          if (prev >= 95) return 100;
          if (prev < 30) return prev + 0.2;
          if (prev < 70) return prev + 0.1;
          return prev + 0.05;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [displayProgress]);
  
  return (
    <div className="fixed inset-0 bg-jungle-background bg-opacity-95 flex flex-col items-center justify-center z-50">
      <div className={`text-center p-6 ${isMobile ? 'max-w-[90%]' : 'max-w-md'}`}>
        <div className="mb-6">
          <Logo className={isMobile ? "scale-100 mb-6" : "scale-125 mb-8"} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Loader2 className="h-6 w-6 text-jungle-green animate-spin" />
          <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bungee text-jungle-darkGreen`}>
            Loading game assets...
          </span>
        </div>
        
        {showProgress && (
          <div className="w-full mt-4 mb-2">
            <Progress value={displayProgress} className="h-2" />
            <p className="text-xs text-right mt-1 text-jungle-darkGreen">
              {Math.round(displayProgress)}%
            </p>
          </div>
        )}
        
        <p className={`mt-4 text-jungle-darkGreen opacity-80 ${isMobile ? 'text-sm' : ''}`}>
          Preparing the jungle for some exciting cup action!
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;

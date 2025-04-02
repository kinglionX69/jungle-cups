
import React from "react";
import Logo from "@/components/Logo";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  progress?: number;
}

const LoadingScreen = ({ progress }: LoadingScreenProps) => {
  const showProgress = progress !== undefined;
  
  return (
    <div className="fixed inset-0 bg-jungle-background bg-opacity-95 flex flex-col items-center justify-center z-50">
      <div className="text-center max-w-md p-6">
        <div className="mb-6">
          <Logo className="scale-125 mb-8" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Loader2 className="h-8 w-8 text-jungle-green animate-spin" />
          <span className="text-xl font-bungee text-jungle-darkGreen">Loading game assets...</span>
        </div>
        
        {showProgress && (
          <div className="w-full mt-4 mb-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-right mt-1 text-jungle-darkGreen">
              {Math.round(progress)}%
            </p>
          </div>
        )}
        
        <p className="mt-4 text-jungle-darkGreen opacity-80">
          Preparing the jungle for some exciting cup action!
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;

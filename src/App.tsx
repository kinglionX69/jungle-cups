
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { useIsMobile } from "./hooks/use-mobile";
import { WalletProvider } from "./providers/WalletProvider";

const queryClient = new QueryClient();

function App() {
  const isMobile = useIsMobile();
  
  // Only include essential game assets - reduced list
  const gameImages = [
    "/lovable-uploads/3f7aa2ea-d29b-4cf6-bfcf-b727b6905b84.png", // Cup 1
    "/lovable-uploads/691ee6e4-5edb-458c-91da-1ac2fb0bb0a5.png", // Ball
  ];

  // Set shorter timeout for mobile
  const timeout = isMobile ? 3000 : 5000;
  
  const { imagesLoaded, loadingProgress } = useImagePreloader({ 
    imageUrls: gameImages,
    timeout
  });
  
  const [showLoader, setShowLoader] = useState(true);
  
  // Force progress to complete after a shorter timeout
  useEffect(() => {
    const forceLoadingTimeout = setTimeout(() => {
      console.log("Force loading complete after timeout");
      setShowLoader(false);
    }, isMobile ? 3500 : 6000); // Shorter timeout for mobile
    
    return () => clearTimeout(forceLoadingTimeout);
  }, [isMobile]);
  
  useEffect(() => {
    if (imagesLoaded) {
      // Add a minimal delay before hiding loader
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 300); // Very short delay
      
      return () => clearTimeout(timer);
    }
  }, [imagesLoaded]);

  return (
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {showLoader && <LoadingScreen progress={loadingProgress} />}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </WalletProvider>
  );
}

export default App;

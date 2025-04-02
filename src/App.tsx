
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

const queryClient = new QueryClient();

const App = () => {
  // Game asset images that need to be preloaded
  const gameImages = [
    "/lovable-uploads/3f7aa2ea-d29b-4cf6-bfcf-b727b6905b84.png", // Cup 1
    "/lovable-uploads/fd90dd73-5d4f-4bca-ad3b-0683d39ee2cd.png", // Cup 2
    "/lovable-uploads/6c1f9c73-4732-4a6e-90b0-82e808afc3ab.png", // Cup 3
    "/lovable-uploads/691ee6e4-5edb-458c-91da-1ac2fb0bb0a5.png", // Ball
    "/lovable-uploads/1dbfd59c-8518-41c7-893a-3f6ee1f27680.png", // Background
  ];

  const { imagesLoaded, loadingProgress } = useImagePreloader({ imageUrls: gameImages });
  const [showLoader, setShowLoader] = useState(true);
  
  useEffect(() => {
    if (imagesLoaded) {
      // Add a small delay before hiding loader for smoother transition
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [imagesLoaded]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showLoader && <LoadingScreen progress={loadingProgress} />}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

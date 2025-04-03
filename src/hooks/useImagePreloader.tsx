
import { useState, useEffect } from "react";

interface ImagePreloaderProps {
  imageUrls: string[];
  timeout?: number;
}

export const useImagePreloader = ({ imageUrls, timeout = 5000 }: ImagePreloaderProps) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  useEffect(() => {
    if (!imageUrls.length) {
      setImagesLoaded(true);
      setLoadingProgress(100);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;
    const failedImagesList: string[] = [];
    let timeoutId: NodeJS.Timeout;

    // Set a maximum loading time - safety fallback
    timeoutId = setTimeout(() => {
      console.log("Image loading timed out, proceeding anyway");
      setImagesLoaded(true);
      setLoadingProgress(100);
    }, timeout);

    const preloadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        // Set a shorter timeout per image - 2 seconds max
        const imgTimeout = setTimeout(() => {
          console.log(`Image load timed out: ${url}`);
          loadedCount++;
          failedImagesList.push(url);
          const progress = Math.min(Math.round((loadedCount / totalImages) * 100), 100);
          setLoadingProgress(progress);
          resolve();
        }, 2000); // Shorter 2 second timeout per image
        
        img.onload = () => {
          clearTimeout(imgTimeout);
          loadedCount++;
          const progress = Math.min(Math.round((loadedCount / totalImages) * 100), 100);
          setLoadingProgress(progress);
          resolve();
        };
        
        img.onerror = () => {
          clearTimeout(imgTimeout);
          console.error(`Failed to load image: ${url}`);
          failedImagesList.push(url);
          loadedCount++;
          const progress = Math.min(Math.round((loadedCount / totalImages) * 100), 100);
          setLoadingProgress(progress);
          resolve();
        };
        
        img.src = url;
      });
    };

    const preloadAllImages = async () => {
      try {
        // Always load images sequentially to reduce memory pressure
        for (const url of imageUrls) {
          await preloadImage(url);
        }
        
        setFailedImages(failedImagesList);
        setImagesLoaded(true);
        
        // Ensure we reach 100% progress
        setLoadingProgress(100);
      } catch (error) {
        console.error("Error preloading images:", error);
        setImagesLoaded(true); // Continue anyway to not block the app
        setLoadingProgress(100);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    preloadAllImages();
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [imageUrls, timeout]);

  return { imagesLoaded, loadingProgress, failedImages };
};

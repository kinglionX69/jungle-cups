
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

    // Set a maximum loading time
    timeoutId = setTimeout(() => {
      console.log("Image loading timed out, proceeding anyway");
      setImagesLoaded(true);
      setLoadingProgress(100);
    }, timeout);

    const preloadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          loadedCount++;
          const progress = Math.min(Math.round((loadedCount / totalImages) * 100), 100);
          setLoadingProgress(progress);
          resolve();
        };
        
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          failedImagesList.push(url);
          loadedCount++;
          const progress = Math.min(Math.round((loadedCount / totalImages) * 100), 100);
          setLoadingProgress(progress);
          resolve(); // Still resolve to continue loading other images
        };
        
        // Set a small timeout for each image to prevent blocking
        const imgTimeout = setTimeout(() => {
          console.log(`Image load timed out: ${url}`);
          if (!img.complete) {
            failedImagesList.push(url);
            loadedCount++;
            const progress = Math.min(Math.round((loadedCount / totalImages) * 100), 100);
            setLoadingProgress(progress);
            resolve();
          }
        }, 3000); // 3 second timeout per image
        
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
        // Load images sequentially on mobile to prevent overwhelming the connection
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
          for (const url of imageUrls) {
            await preloadImage(url);
          }
        } else {
          // Use Promise.all to load all images in parallel on desktop
          await Promise.all(imageUrls.map(url => preloadImage(url)));
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

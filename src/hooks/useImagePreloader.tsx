
import { useState, useEffect } from "react";

interface ImagePreloaderProps {
  imageUrls: string[];
}

export const useImagePreloader = ({ imageUrls }: ImagePreloaderProps) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!imageUrls.length) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    const preloadImage = (url: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          loadedCount++;
          setLoadingProgress((loadedCount / totalImages) * 100);
          resolve();
        };
        
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          loadedCount++;
          setLoadingProgress((loadedCount / totalImages) * 100);
          resolve(); // Still resolve to continue loading other images
        };
        
        img.src = url;
      });
    };

    const preloadAllImages = async () => {
      try {
        // Use Promise.all to load all images in parallel
        await Promise.all(imageUrls.map(url => preloadImage(url)));
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error preloading images:", error);
        setImagesLoaded(true); // Continue anyway to not block the app
      }
    };

    preloadAllImages();
  }, [imageUrls]);

  return { imagesLoaded, loadingProgress };
};

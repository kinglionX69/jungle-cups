
import { useState, useEffect } from "react";

interface ImagePreloaderProps {
  imageUrls: string[];
}

export const useImagePreloader = ({ imageUrls }: ImagePreloaderProps) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!imageUrls.length) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const imageElements: HTMLImageElement[] = [];

    const onLoad = () => {
      loadedCount += 1;
      setProgress(Math.round((loadedCount / imageUrls.length) * 100));
      
      // Check if all images have loaded
      if (loadedCount === imageUrls.length) {
        console.log("All images have been preloaded");
        setImagesLoaded(true);
      }
    };

    // Preload images
    imageUrls.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = onLoad;
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        onLoad(); // Count errors as loaded to avoid hanging
      };
      imageElements.push(img);
    });

    // Cleanup function
    return () => {
      imageElements.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls]);

  return { imagesLoaded, progress };
};

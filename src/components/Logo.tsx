
import React, { useState, useEffect } from "react";

const Logo = ({ className = "" }: { className?: string }) => {
  // Images for cup and ball
  const cup1Image = "/lovable-uploads/3f7aa2ea-d29b-4cf6-bfcf-b727b6905b84.png";
  const cup2Image = "/lovable-uploads/fd90dd73-5d4f-4bca-ad3b-0683d39ee2cd.png";
  const cup3Image = "/lovable-uploads/6c1f9c73-4732-4a6e-90b0-82e808afc3ab.png";
  const ballImage = "/lovable-uploads/691ee6e4-5edb-458c-91da-1ac2fb0bb0a5.png";
  
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Preload images to prevent blank logo
  useEffect(() => {
    const imagesToLoad = [cup1Image, cup2Image, cup3Image, ballImage];
    let loadedCount = 0;
    
    imagesToLoad.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
          setImagesLoaded(true);
        }
      };
    });
  }, []);

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`relative transition-opacity duration-300 ${imagesLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Three cups stacked - using the uploaded images for all three cups now */}
        <div className="w-14 h-12 relative -mb-2 z-30 transform rotate-[-15deg] translate-x-2">
          <img 
            src={cup1Image} 
            alt="Cup 1" 
            className="w-full h-full object-contain" 
            style={{ backgroundColor: 'transparent' }}
          />
        </div>
        <div className="w-14 h-12 relative -mb-2 z-20">
          <img 
            src={cup2Image} 
            alt="Cup 2" 
            className="w-full h-full object-contain" 
            style={{ backgroundColor: 'transparent' }}
          />
        </div>
        <div className="w-14 h-12 relative z-10 transform rotate-[15deg] -translate-x-2">
          <img 
            src={cup3Image} 
            alt="Cup 3" 
            className="w-full h-full object-contain" 
            style={{ backgroundColor: 'transparent' }}
          />
        </div>
        
        {/* Ball peeking out - using new lion ball image */}
        <div className="w-8 h-8 absolute bottom-0 right-0 z-40">
          <img 
            src={ballImage} 
            alt="Ball" 
            className="w-full h-full object-contain" 
            style={{ backgroundColor: 'transparent' }}
          />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-luckiest ml-3 drop-shadow-lg">
        <span className="text-jungle-green">Jungle</span> 
        <span className="text-jungle-darkGreen">Cups</span>
      </h1>
    </div>
  );
};

export default Logo;

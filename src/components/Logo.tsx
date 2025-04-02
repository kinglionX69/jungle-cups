
import React from "react";

const Logo = ({ className = "" }: { className?: string }) => {
  // Images for cup and ball
  const cup1Image = "/lovable-uploads/3f7aa2ea-d29b-4cf6-bfcf-b727b6905b84.png";
  const cup2Image = "/lovable-uploads/fd90dd73-5d4f-4bca-ad3b-0683d39ee2cd.png";
  const ballImage = "/lovable-uploads/2b7b2c72-28d9-4d98-9913-f85587df0f8c.png";

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        {/* Three cups stacked - using the uploaded images for first two */}
        <div className="w-14 h-12 relative -mb-2 z-30 transform rotate-[-15deg] translate-x-2">
          <img src={cup1Image} alt="Cup 1" className="w-full h-full object-contain" />
        </div>
        <div className="w-14 h-12 relative -mb-2 z-20">
          <img src={cup2Image} alt="Cup 2" className="w-full h-full object-contain" />
        </div>
        <div className="w-12 h-10 bg-jungle-brown rounded-t-full border-2 border-yellow-700 relative z-10 transform rotate-[15deg] -translate-x-2 shadow-md"></div>
        
        {/* Ball peeking out - using uploaded lion image */}
        <div className="w-8 h-8 absolute bottom-0 right-0 z-40">
          <img src={ballImage} alt="Ball" className="w-full h-full object-contain" />
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

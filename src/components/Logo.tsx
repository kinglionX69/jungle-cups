
import React from "react";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        {/* Three cups stacked */}
        <div className="w-12 h-10 bg-jungle-brown rounded-t-full border-2 border-yellow-700 relative -mb-2 z-30 transform rotate-[-15deg] translate-x-2 shadow-md"></div>
        <div className="w-12 h-10 bg-jungle-brown rounded-t-full border-2 border-yellow-700 relative -mb-2 z-20 shadow-md"></div>
        <div className="w-12 h-10 bg-jungle-brown rounded-t-full border-2 border-yellow-700 relative z-10 transform rotate-[15deg] -translate-x-2 shadow-md"></div>
        
        {/* Ball peeking out */}
        <div className="w-6 h-6 bg-jungle-yellow rounded-full border-2 border-yellow-600 absolute bottom-0 right-0 z-40 shadow-inner"></div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-luckiest ml-3 drop-shadow-lg">
        <span className="text-jungle-green">Jungle</span> 
        <span className="text-jungle-darkGreen">Cups</span>
      </h1>
    </div>
  );
};

export default Logo;


import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CupProps {
  index: number;
  hasBall: boolean;
  onClick: (index: number) => void;
  isShuffling: boolean;
  isRevealed: boolean;
  gameEnded: boolean;
  selected: boolean;
  isLifted: boolean;
}

const Cup = ({
  index,
  hasBall,
  onClick,
  isShuffling,
  isRevealed,
  gameEnded,
  selected,
  isLifted,
}: CupProps) => {
  const [shuffleAnimation, setShuffleAnimation] = useState("");
  const [showAnticipation, setShowAnticipation] = useState(false);
  const [showWobble, setShowWobble] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Images for cups 1, 2 and 3
  const cup1Image = "/lovable-uploads/3f7aa2ea-d29b-4cf6-bfcf-b727b6905b84.png";
  const cup2Image = "/lovable-uploads/fd90dd73-5d4f-4bca-ad3b-0683d39ee2cd.png";
  const cup3Image = "/lovable-uploads/6c1f9c73-4732-4a6e-90b0-82e808afc3ab.png";
  
  // Ball image - using the new design
  const ballImage = "/lovable-uploads/691ee6e4-5edb-458c-91da-1ac2fb0bb0a5.png";
  
  // Preload images to prevent blank screens
  useEffect(() => {
    const preloadImages = () => {
      const imageUrls = [cup1Image, cup2Image, cup3Image, ballImage];
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          if (url === getCupImage()) {
            setImageLoaded(true);
          }
        };
      });
    };
    
    preloadImages();
  }, []);
  
  useEffect(() => {
    if (isShuffling) {
      setShuffleAnimation(`animate-cup-shuffle-${index + 1}`);
    } else {
      setShuffleAnimation("");
    }
  }, [isShuffling, index]);

  useEffect(() => {
    if (selected && !isRevealed) {
      setShowAnticipation(true);
      if (isRevealed) {
        setShowAnticipation(false);
      }
    } else {
      setShowAnticipation(false);
    }
    
    if (!isRevealed && !isShuffling && !isLifted && selectedCupExists() && !selected) {
      if (!hasBall) {
        setTimeout(() => {
          setShowWobble(true);
          setTimeout(() => setShowWobble(false), 400);
        }, Math.random() * 400);
      }
    } else {
      setShowWobble(false);
    }
  }, [selected, isRevealed, hasBall, isShuffling, isLifted]);

  const selectedCupExists = () => {
    return showAnticipation || selected;
  };

  const isClickable = !isShuffling && !gameEnded && !isLifted && !isRevealed;

  const handleCupClick = () => {
    if (isClickable) {
      onClick(index);
    } else if (isShuffling) {
      console.log("Cannot select cup during shuffling");
    } else if (isLifted) {
      console.log("Cannot select cup during initial reveal");
    }
  };

  const getCupImage = () => {
    if (index === 0) return cup1Image;
    if (index === 1) return cup2Image;
    return cup3Image;
  };

  return (
    <div className="flex flex-col items-center relative">
      <div
        className={cn(
          "cup-image",
          shuffleAnimation,
          selected && "ring-4 ring-yellow-400",
          isRevealed && selected && "animate-cup-reveal",
          showAnticipation && "animate-anticipation",
          showWobble && "animate-wobble",
          isLifted && "transform -translate-y-12 transition-transform duration-700",
          isClickable && "cursor-pointer",
          !isClickable && "cursor-default",
          "transform transition-all duration-300 w-36 h-40 relative",
          !imageLoaded && "opacity-0",
          imageLoaded && "opacity-100"
        )}
        onClick={handleCupClick}
        style={{ zIndex: (isShuffling || isLifted) ? 5 : 10 }}
      >
        <img 
          src={getCupImage()} 
          alt={`Cup ${index + 1}`} 
          className="w-full h-full object-contain"
          style={{ backgroundColor: 'transparent' }}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      
      {showAnticipation && (
        <div className="absolute inset-0 -z-10 animate-pulse">
          <div className="absolute inset-0 bg-jungle-yellow/30 rounded-full blur-xl transform scale-110"></div>
        </div>
      )}
      
      {hasBall && (isLifted || (isRevealed && selected)) && (
        <div className={cn(
          "ball absolute left-1/2 transform -translate-x-1/2 animate-fade-in",
          isLifted ? "bottom-0" : "bottom-12"
        )}>
          <img 
            src={ballImage} 
            alt="Ball" 
            className="w-12 h-12 object-contain" 
            style={{ backgroundColor: 'transparent' }}
          />
        </div>
      )}
    </div>
  );
};

export default Cup;

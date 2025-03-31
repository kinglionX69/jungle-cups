
import { ReactNode } from "react";

interface GameContainerProps {
  children: ReactNode;
}

const GameContainer = ({ children }: GameContainerProps) => {
  return (
    <div className="game-container relative overflow-hidden">
      {/* Subtle leaf decoration in the corners */}
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-jungle-lightGreen/30 rounded-full blur-md"></div>
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-jungle-yellow/20 rounded-full blur-md"></div>
      
      {/* Floating fireflies effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-70"></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse opacity-60 animation-delay-300"></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-80 animation-delay-700"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse opacity-65 animation-delay-1500"></div>
      </div>
      
      {children}
    </div>
  );
};

export default GameContainer;

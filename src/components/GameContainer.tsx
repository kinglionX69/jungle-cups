
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
      
      {children}
    </div>
  );
};

export default GameContainer;

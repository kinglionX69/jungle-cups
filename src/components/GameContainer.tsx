
import { ReactNode } from "react";

interface GameContainerProps {
  children: ReactNode;
}

const GameContainer = ({ children }: GameContainerProps) => {
  return (
    <div className="game-container relative overflow-hidden bg-white/80 backdrop-blur-sm">
      {children}
    </div>
  );
};

export default GameContainer;

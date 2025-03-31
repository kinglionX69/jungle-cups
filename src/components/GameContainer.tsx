
import { ReactNode } from "react";

interface GameContainerProps {
  children: ReactNode;
}

const GameContainer = ({ children }: GameContainerProps) => {
  return (
    <div className="game-container">
      {children}
    </div>
  );
};

export default GameContainer;

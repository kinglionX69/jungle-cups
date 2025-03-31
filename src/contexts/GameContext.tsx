
import { createContext, useContext } from "react";
import { GameContextType } from "@/types/gameTypes";

// Create the context with an empty default value
export const GameContext = createContext<GameContextType | undefined>(undefined);

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};


// Utility functions for game logic

// Shuffle the cups and ball position
export const shuffleCups = (currentBallPosition: number): number => {
  // Generate a new random position for the ball
  const newPosition = Math.floor(Math.random() * 3);
  return newPosition;
};

// Calculate win chance - can be adjusted for different difficulty levels
export const calculateWinChance = (): number => {
  return 0.5; // 50% win chance
};

// Determine if the player won - true for honest game, can be manipulated for house edge
export const didPlayerWin = (selectedCup: number, ballPosition: number): boolean => {
  return selectedCup === ballPosition;
};

// Play shuffle sound
export const playShuffleSound = () => {
  const audio = new Audio("/sounds/shuffle.mp3");
  audio.volume = 0.5;
  audio.play().catch(e => console.error("Error playing sound:", e));
};

// Play cups down sound
export const playCupsDownSound = () => {
  const audio = new Audio("/sounds/click.mp3");
  audio.volume = 0.4;
  audio.play().catch(e => console.error("Error playing sound:", e));
};

// Play win sound
export const playWinSound = () => {
  const audio = new Audio("/sounds/win.mp3");
  audio.volume = 0.7;
  audio.play().catch(e => console.error("Error playing sound:", e));
};

// Play lose sound
export const playLoseSound = () => {
  const audio = new Audio("/sounds/lose.mp3");
  audio.volume = 0.7;
  audio.play().catch(e => console.error("Error playing sound:", e));
};

// Play click sound
export const playClickSound = () => {
  const audio = new Audio("/sounds/click.mp3");
  audio.volume = 0.3;
  audio.play().catch(e => console.error("Error playing sound:", e));
};

// Game timing constants (in milliseconds)
export const TIMING = {
  INITIAL_REVEAL: 2000,  // Time showing the ball at the beginning (reduced from 3000)
  CUPS_DOWN: 800,        // Time to lower the cups (reduced from 1000)
  SHUFFLE_DURATION: 1200 // Reduced from 1500 for even faster shuffling
};

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

// Import safe audio functions
import { 
  playShuffleSoundSafe, 
  playCupsDownSoundSafe, 
  playWinSoundSafe, 
  playLoseSoundSafe, 
  playClickSoundSafe, 
  playAnticipationSoundSafe 
} from './safeAudio';

// Updated sound functions to use safe audio
export const playShuffleSound = () => playShuffleSoundSafe();
export const playCupsDownSound = () => playCupsDownSoundSafe();
export const playWinSound = () => playWinSoundSafe();
export const playLoseSound = () => playLoseSoundSafe();
export const playClickSound = () => playClickSoundSafe();
export const playAnticipationSound = () => playAnticipationSoundSafe();

// Game timing constants (in milliseconds)
export const TIMING = {
  INITIAL_REVEAL: 2000,  // Time showing the ball at the beginning (reduced from 3000)
  CUPS_DOWN: 800,        // Time to lower the cups (reduced from 1000)
  SHUFFLE_DURATION: 1200 // Reduced from 1500 for even faster shuffling
};

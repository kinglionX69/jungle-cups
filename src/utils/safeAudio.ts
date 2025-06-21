
// Safe audio playback utilities
export const safePlayAudio = async (audioPath: string, volume: number = 0.5): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(audioPath);
      audio.volume = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1
      
      const handleSuccess = () => {
        console.log(`🔊 AUDIO: Successfully played ${audioPath}`);
        cleanup();
        resolve();
      };
      
      const handleError = (error: any) => {
        console.warn(`⚠️ AUDIO: Failed to play ${audioPath}:`, error);
        cleanup();
        resolve(); // Resolve anyway to not block the flow
      };
      
      const cleanup = () => {
        audio.removeEventListener('ended', handleSuccess);
        audio.removeEventListener('error', handleError);
      };
      
      audio.addEventListener('ended', handleSuccess);
      audio.addEventListener('error', handleError);
      
      // Set a timeout to resolve in case the audio never ends or errors
      setTimeout(() => {
        cleanup();
        resolve();
      }, 5000);
      
      audio.play().catch(handleError);
    } catch (error) {
      console.warn(`⚠️ AUDIO: Exception playing ${audioPath}:`, error);
      resolve(); // Don't let audio errors crash the app
    }
  });
};

export const playClickSoundSafe = () => safePlayAudio("/sounds/click.mp3", 0.3);
export const playShuffleSoundSafe = () => safePlayAudio("/sounds/shuffle.mp3", 0.5);
export const playCupsDownSoundSafe = () => safePlayAudio("/sounds/click.mp3", 0.4);
export const playWinSoundSafe = () => safePlayAudio("/sounds/win.mp3", 0.7);
export const playLoseSoundSafe = () => safePlayAudio("/sounds/lose.mp3", 0.7);
export const playAnticipationSoundSafe = () => safePlayAudio("/sounds/click.mp3", 0.2);

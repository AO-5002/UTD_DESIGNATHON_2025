/**
 * Utility functions for playing sounds in the app
 */

export const playSound = (soundUrl: string) => {
  try {
    const audio = new Audio(soundUrl);

    // Set volume to a reasonable level
    audio.volume = 0.5;

    // Play with proper error handling
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Only log if it's not a user interaction error
        if (error.name !== "NotAllowedError") {
          console.error("Error playing sound:", error);
        }
        // Silently fail for NotAllowedError (browser autoplay policy)
      });
    }
  } catch (error) {
    // Silently catch any other errors
    console.debug("Audio initialization error:", error);
  }
};

// Predefined sound effects
export const SOUNDS = {
  CLICK: "/sounds/click.wav",
  DELETE: "/sounds/delete.wav",
  // Add more sounds as needed
} as const;

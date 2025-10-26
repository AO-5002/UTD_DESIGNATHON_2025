/**
 * Utility functions for playing sounds in the app
 */

export const playSound = (soundUrl: string) => {
  try {
    const audio = new Audio(soundUrl);
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  } catch (error) {
    console.error("Error creating audio:", error);
  }
};

// Predefined sound effects
export const SOUNDS = {
  CLICK: "/sounds/click.wav",
  DELETE: "/sounds/delete.wav",
  // Add more sounds as needed
} as const;

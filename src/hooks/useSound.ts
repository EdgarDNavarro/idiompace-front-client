// src/hooks/useSound.js
import { useCallback } from "react";

export const useSound = (src: any) => {
  const play = useCallback(() => {
    const sound = new Audio(src);
    sound.play();
  }, [src]);

  return play;
};

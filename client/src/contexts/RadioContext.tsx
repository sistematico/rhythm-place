import { createContext, useContext, useState, useRef, ReactNode, RefObject } from 'react';
import type { Station, RadioState } from '../types/radio';

interface RadioContextType extends RadioState {
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  setCurrentStation: (station: Station | null) => void;
  playerRef: RefObject<any>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const playerRef = useRef<any>(null);

  return (
    <RadioContext.Provider
      value={{
        isPlaying,
        volume,
        isMuted,
        currentStation,
        setIsPlaying,
        setVolume,
        setIsMuted,
        setCurrentStation,
        playerRef,
      }}
    >
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio must be used within RadioProvider');
  }
  return context;
}
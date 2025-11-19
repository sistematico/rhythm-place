"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

interface AudioContextType {
  title: string;
  artist: string;
  setTitle: (title: string) => void;
  setArtist: (artist: string) => void;
  playing: boolean;
  play: () => void;
  pause: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  muted: boolean;
  toggleMute: (muted?: boolean) => void;
  cycleGenre: () => void;
}

const genres = [
  { id: "rock", name: "Rock", path: "rock" },
  { id: "rock", name: "Rock", path: "rock" },
  { id: "rock", name: "Rock", path: "rock" },
];

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_STREAM_BASE_URL!;
  const [genre, setGenre] = useState<string>(genres[0].path);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  const updateSource = (mountId: string) => {
    if (!audioRef.current) return;
    const mp = genres.find((m) => m.id === mountId)?.path || mountId;
    audioRef.current.src = `${baseUrl}/${mp}?t=${Date.now() / 1000}`;
  };

  function play() {
    if (audioRef.current) {
      updateSource(genre);
      audioRef.current.play();
      setPlaying(true);
    }
  }

  function pause() {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      updateSource(genre);
    }
  }

  function toggleMute(m?: boolean) {
    // Optional boolean allows explicit set or toggle behavior
    const nextMuted = typeof m === "boolean" ? m : !muted;
    setMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  }

  const cycleGenre = () => {
    const idx = genres.findIndex((m) => m.path === genre);
    const next = genres[(idx + 1) % genres.length];
    setGenre(next.path);
  };

  useEffect(() => {
    // Restore stored mountpoint if any (client-only)
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem("genre");
        if (stored) setGenre(stored);
      }
    } catch {}

    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <AudioContext.Provider
      value={{
        play,
        pause,
        playing,
        volume,
        setVolume,
        toggleMute,
        muted,
        title,
        artist,
        setTitle,
        setArtist,
        cycleGenre,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={`${baseUrl}/${genre}`}
      />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

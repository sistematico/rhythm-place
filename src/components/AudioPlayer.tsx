"use client";

import { useAudio } from "@/context/AudioContext";
import { Play, Pause, ArrowLeftRight, VolumeOff, Volume2 } from "lucide-react";

export default function AudioPlayer() {
  const { play, pause, playing, volume, setVolume, muted, toggleMute, genre, cycleGenre } = useAudio();

  function volumeClass(volume: number) {
    if(volume > 90) return "#a31616ff";
    if(volume > 50) return "#165aa3ff";
    if(volume > 10) return "#16a34a";
    return "#16a34a";
  }
  
  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) toggleMute(true);
    else if (muted) toggleMute(false);
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-md border-2 border-black dark:border-white">
      {playing ? <button onClick={pause}><Pause /></button> : <button onClick={play}><Play /></button>}
      <Volume2 />
      <button className="hidden md:block -mt-1 cursor-pointer">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : Number(volume)}
          onChange={handleVolume}
          className={`w-16 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider shadow-sm ${volume > 0 ? "opacity-100" : "opacity-50"} `}
          style={{
            background: `linear-gradient(to right, ${volumeClass(volume)} 0%, ${volumeClass(volume)} ${(muted ? 0 : Number(volume)) * 100}%, #4b5563 ${(muted ? 0 : Number(volume)) * 100}%, #4b5563 100%)`,
            boxShadow: `0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(22, 163, 74, ${(muted ? 0 : Number(volume)) * 0.5})`,
          }}
          aria-label="Controle de volume"
        />
      </button>
      <button onClick={cycleGenre}><ArrowLeftRight /></button>
      <span>{genre}</span>
    </div>
  );
}
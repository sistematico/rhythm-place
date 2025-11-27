"use client";

import { useAudio } from "@/context/AudioContext";
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";
import TrackHistory from "./TrackHistory";

export default function AudioPlayer() {
  const { play, pause, playing, volume, setVolume, muted, toggleMute, genreName, cycleGenre, title, artist } = useAudio();

  function volumeClass(volume: number) {
    if(volume > 0.9) return "#a31616ff";
    if(volume > 0.5) return "#165aa3ff";
    if(volume > 0.1) return "#16a34a";
    return "#16a34a";
  }
  
  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) toggleMute(true);
    else if (muted) toggleMute(false);
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg max-w-md">
      {/* Informações da música */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-h-[3rem] border-b border-gray-200 dark:border-gray-800 pb-3 flex-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate" title={title}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={artist}>
            {artist}
          </p>
        </div>
        <TrackHistory />
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={playing ? pause : play}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md"
            aria-label={playing ? "Pausar" : "Reproduzir"}
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Trocar gênero */}
          <button
            onClick={cycleGenre}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            aria-label="Trocar gênero"
            title={`Gênero: ${genreName}`}
          >
            <SkipForward size={20} />
          </button>

          {/* Indicador de gênero */}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
            {genreName}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleMute()}
            className="p-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label={muted ? "Ativar som" : "Silenciar"}
          >
            {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : Number(volume)}
              onChange={handleVolume}
              className="w-20 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${volumeClass(volume)} 0%, ${volumeClass(volume)} ${(muted ? 0 : Number(volume)) * 100}%, #d1d5db ${(muted ? 0 : Number(volume)) * 100}%, #d1d5db 100%)`,
              }}
              aria-label="Controle de volume"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
              {Math.round((muted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
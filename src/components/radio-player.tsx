"use client";

import { Pause, Play, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { useId } from "react";
import { useRadioPlayer } from "@/contexts/radio-player";

export function RadioPlayer() {
  const volumeInputId = useId();
  const {
    isMuted,
    isPlaying,
    isMetadataLoading,
    nowPlaying,
    streamError,
    volume,
    handlePlaybackToggle,
    handleRefresh,
    handleVolumeChange,
    handleMuteToggle,
  } = useRadioPlayer();

  const currentTrack = nowPlaying?.title ?? "Transmissao ao vivo";
  const currentArtist = nowPlaying?.artist ?? "Rhythm Place";

  return (
    <section className="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-white/12 bg-slate-950/40 p-4 text-left shadow-[0_20px_60px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mt-2 min-w-0 space-y-1">
            <p className="truncate text-lg font-semibold text-white sm:text-xl">
              {currentTrack}
            </p>
            <p className="truncate text-sm text-slate-300/88 sm:text-[0.95rem]">
              {isMetadataLoading ? "Carregando metadados..." : currentArtist}
            </p>
            {streamError ? (
              <output className="text-sm text-amber-200/95" aria-live="polite">
                {streamError}
              </output>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handlePlaybackToggle}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/14 bg-white text-slate-950 transition hover:scale-[1.02] hover:bg-slate-100"
            aria-label={
              isPlaying ? "Pausar transmissao" : "Reproduzir transmissao"
            }
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-white/14"
            aria-label="Atualizar stream"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={handleMuteToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-white/14"
            aria-label={isMuted ? "Ativar audio" : "Silenciar audio"}
          >
            {isMuted ? (
              <VolumeX className="h-4.5 w-4.5" />
            ) : (
              <Volume2 className="h-4.5 w-4.5" />
            )}
          </button>

          <label htmlFor={volumeInputId} className="hidden md:block">
            <span className="sr-only">Volume</span>
            <input
              id={volumeInputId}
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) =>
                handleVolumeChange(Number(event.target.value))
              }
              className="h-1.5 w-28 cursor-pointer accent-sky-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-0 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:size-0"
              aria-label="Volume"
            />
          </label>
        </div>
      </div>
    </section>
  );
}

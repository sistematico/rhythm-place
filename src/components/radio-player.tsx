"use client";

import { Pause, Play, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { type NowPlaying, STREAM_PROXY_PATH } from "@/lib/radio";

const DEFAULT_VOLUME = 0.72;
const NOW_PLAYING_ENDPOINT = "/api/now-playing";
const STREAM_HEALTH_ENDPOINT = "/api/stream-health";
const STREAM_ERROR_MESSAGE =
  "A transmissao esta indisponivel agora. Tente atualizar em alguns instantes.";

function buildStreamUrl(timestamp: number) {
  return `${STREAM_PROXY_PATH}?ts=${timestamp}`;
}

async function checkStreamAvailability(timestamp: number) {
  const response = await fetch(`${STREAM_HEALTH_ENDPOINT}?ts=${timestamp}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { available?: boolean };

  return payload.available === true;
}

export function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = useRef(DEFAULT_VOLUME);
  const shouldResumeAfterRefreshRef = useRef(false);
  const volumeInputId = useId();

  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [streamTimestamp, setStreamTimestamp] = useState<number | null>(null);
  const [metadataRefreshToken, setMetadataRefreshToken] = useState<
    number | null
  >(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  useEffect(() => {
    setMetadataRefreshToken(Date.now());
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const syncAudioState = () => {
      setIsMuted(audio.muted || audio.volume === 0);
      setIsPlaying(!audio.paused);
      setVolume(audio.volume);

      if (audio.volume > 0) {
        previousVolumeRef.current = audio.volume;
      }
    };

    const handleAudioError = () => {
      setIsPlaying(false);
      setStreamError(STREAM_ERROR_MESSAGE);
    };

    const clearStreamError = () => {
      setStreamError(null);
    };

    syncAudioState();

    audio.addEventListener("play", syncAudioState);
    audio.addEventListener("play", clearStreamError);
    audio.addEventListener("pause", syncAudioState);
    audio.addEventListener("volumechange", syncAudioState);
    audio.addEventListener("emptied", syncAudioState);
    audio.addEventListener("loadstart", clearStreamError);
    audio.addEventListener("canplay", clearStreamError);
    audio.addEventListener("error", handleAudioError);

    return () => {
      audio.removeEventListener("play", syncAudioState);
      audio.removeEventListener("play", clearStreamError);
      audio.removeEventListener("pause", syncAudioState);
      audio.removeEventListener("volumechange", syncAudioState);
      audio.removeEventListener("emptied", syncAudioState);
      audio.removeEventListener("loadstart", clearStreamError);
      audio.removeEventListener("canplay", clearStreamError);
      audio.removeEventListener("error", handleAudioError);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume;
    audio.muted = isMuted;
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || streamTimestamp === null) {
      return;
    }

    const shouldResume = shouldResumeAfterRefreshRef.current;
    shouldResumeAfterRefreshRef.current = false;

    setStreamError(null);
    audio.src = buildStreamUrl(streamTimestamp);
    audio.load();

    if (!shouldResume) {
      setIsPlaying(false);
      return;
    }

    void audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, [streamTimestamp]);

  useEffect(() => {
    let isCancelled = false;

    if (metadataRefreshToken === null) {
      return;
    }

    async function loadNowPlaying(
      cacheKey: number,
      shouldShowLoading: boolean,
    ) {
      if (shouldShowLoading) {
        setIsMetadataLoading(true);
      }

      try {
        const response = await fetch(
          `${NOW_PLAYING_ENDPOINT}?refresh=${cacheKey}&ts=${Date.now()}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(`Metadata request failed with ${response.status}`);
        }

        const payload = (await response.json()) as NowPlaying;

        if (!isCancelled) {
          setNowPlaying(payload);
        }
      } catch {
        if (!isCancelled) {
          setNowPlaying(
            (currentValue) =>
              currentValue ?? {
                artist: "Rhythm Place",
                mount: "/stream",
                rawTitle: "",
                title: "Transmissao ao vivo",
                updatedAt: new Date().toISOString(),
              },
          );
        }
      } finally {
        if (!isCancelled) {
          setIsMetadataLoading(false);
        }
      }
    }

    void loadNowPlaying(metadataRefreshToken, true);

    const intervalId = window.setInterval(() => {
      void loadNowPlaying(Date.now(), false);
    }, 15000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [metadataRefreshToken]);

  async function handlePlaybackToggle() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      const nextTimestamp = Date.now();

      setStreamError(null);

      if (!(await checkStreamAvailability(nextTimestamp))) {
        setIsPlaying(false);
        setStreamError(STREAM_ERROR_MESSAGE);
        return;
      }

      if (streamTimestamp === null) {
        shouldResumeAfterRefreshRef.current = true;
        setStreamTimestamp(nextTimestamp);
        return;
      }

      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
        setStreamError(STREAM_ERROR_MESSAGE);
      }

      return;
    }

    audio.pause();
  }

  async function handleRefresh() {
    const audio = audioRef.current;
    const nextTimestamp = Date.now();

    setStreamError(null);

    if (!(await checkStreamAvailability(nextTimestamp))) {
      setStreamError(STREAM_ERROR_MESSAGE);
      return;
    }

    shouldResumeAfterRefreshRef.current = Boolean(audio && !audio.paused);
    setStreamTimestamp(nextTimestamp);
    setMetadataRefreshToken(nextTimestamp);
  }

  function handleVolumeChange(nextVolume: number) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = nextVolume;
    audio.muted = nextVolume === 0;

    if (nextVolume > 0) {
      previousVolumeRef.current = nextVolume;
    }
  }

  function handleMuteToggle() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.muted || audio.volume === 0) {
      const nextVolume =
        previousVolumeRef.current > 0
          ? previousVolumeRef.current
          : DEFAULT_VOLUME;
      audio.muted = false;
      audio.volume = nextVolume;
      return;
    }

    previousVolumeRef.current =
      audio.volume > 0 ? audio.volume : DEFAULT_VOLUME;
    audio.muted = true;
  }

  const currentTrack = nowPlaying?.title ?? "Transmissao ao vivo";
  const currentArtist = nowPlaying?.artist ?? "Rhythm Place";

  return (
    <section className="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-white/12 bg-slate-950/40 p-4 text-left shadow-[0_20px_60px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
      <audio ref={audioRef} preload="none">
        <track kind="captions" />
      </audio>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-sky-100/70">
            Live radio
          </p>
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
              className="h-1.5 w-28 cursor-pointer accent-sky-200"
              aria-label="Volume"
            />
          </label>
        </div>
      </div>
    </section>
  );
}

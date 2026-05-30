"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

type RadioPlayerContextValue = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isMuted: boolean;
  isPlaying: boolean;
  isMetadataLoading: boolean;
  nowPlaying: NowPlaying | null;
  streamError: string | null;
  volume: number;
  handlePlaybackToggle: () => Promise<void>;
  handleRefresh: () => Promise<void>;
  handleVolumeChange: (nextVolume: number) => void;
  handleMuteToggle: () => void;
};

const RadioPlayerContext = createContext<RadioPlayerContextValue | null>(null);

export function useRadioPlayer() {
  const context = useContext(RadioPlayerContext);

  if (!context) {
    throw new Error("useRadioPlayer must be used within a RadioPlayerProvider");
  }

  return context;
}

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = useRef(DEFAULT_VOLUME);
  const shouldResumeAfterRefreshRef = useRef(false);

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
                mount: "/main",
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

  return (
    <RadioPlayerContext.Provider
      value={{
        audioRef,
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
      }}
    >
      {/* The audio element lives here so it never unmounts during navigation */}
      <audio ref={audioRef} preload="none">
        <track kind="captions" />
      </audio>
      {children}
    </RadioPlayerContext.Provider>
  );
}

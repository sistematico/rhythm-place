"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

interface Song {
  id: number;
  artist: string | null;
  title: string | null;
  path: string;
  genre: string;
  createdAt: string;
}

interface AudioContextType {
  title: string;
  artist: string;
  genre: string;
  genreName: string;
  volume: number;
  playing: boolean;
  muted: boolean;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: (muted?: boolean) => void;
  cycleGenre: () => void;
}

const genres = [
  { name: "Principal", path: "main" },
  { name: "Rock", path: "rock" },
  { name: "Dance", path: "dance" },
];

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const baseUrl = import.meta.env.VITE_STREAM_BASE_URL!;
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastSongIdRef = useRef<number | null>(null);
  
  const [genre, setGenre] = useState<string>(genres[0].path);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [title, setTitle] = useState("Rhythm Place");
  const [artist, setArtist] = useState("Aguardando...");

  // Buscar música atual da API
  const fetchCurrentSong = async (genrePath: string) => {
    try {
      const response = await fetch(`/api/song/${genrePath}`);
      if (response.ok) {
        const song: Song = await response.json();
        
        // Só atualizar se for uma música diferente
        if (!lastSongIdRef.current || lastSongIdRef.current !== song.id) {
          lastSongIdRef.current = song.id;
          setTitle(song.title || "Música Desconhecida");
          setArtist(song.artist || "Artista Desconhecido");
          
          // Salvar no localStorage para histórico
          if (typeof window !== "undefined") {
            const history = JSON.parse(localStorage.getItem("trackHistory") || "[]");
            history.unshift({
              ...song,
              playedAt: new Date().toISOString(),
            });
            // Manter apenas as últimas 50 músicas
            localStorage.setItem("trackHistory", JSON.stringify(history.slice(0, 50)));
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar música atual:", error);
    }
  };

  // Conectar ao SSE para mudanças de música
  const connectToTrackChanges = (genrePath: string) => {
    // Fechar conexão anterior se existir
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Criar nova conexão SSE
    const eventSource = new EventSource(`/api/song/current/${genrePath}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'track-change') {
          // Quando houver mudança de música, buscar os dados atualizados
          fetchCurrentSong(genrePath);
        }
      } catch (error) {
        console.error("Erro ao processar evento SSE:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Erro na conexão SSE:", error);
      eventSource.close();
      // Reconectar após 5 segundos
      setTimeout(() => {
        if (playing) {
          connectToTrackChanges(genrePath);
        }
      }, 5000);
    };

    eventSourceRef.current = eventSource;
  };

  const updateSource = (genrePath: string) => {
    if (!audioRef.current) return;
    audioRef.current.src = `${baseUrl}/${genrePath}?t=${Date.now() / 1000}`;
  };

  function play() {
    if (audioRef.current) {
      updateSource(genre);
      audioRef.current.play();
      setPlaying(true);
      // Buscar música atual e conectar ao SSE
      fetchCurrentSong(genre);
      connectToTrackChanges(genre);
    }
  }

  function pause() {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      // Desconectar do SSE quando pausar
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  }

  function toggleMute(m?: boolean) {
    const nextMuted = typeof m === "boolean" ? m : !muted;
    setMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  }

  const cycleGenre = () => {
    const idx = genres.findIndex((m) => m.path === genre);
    const next = genres[(idx + 1) % genres.length];
    
    if (audioRef.current && playing) {
      // Pausar e limpar antes de mudar
      audioRef.current.pause();
      audioRef.current.src = "";
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      setGenre(next.path);
      setGenre(next.path);
      lastSongIdRef.current = null;
      setTitle("Rhythm Place");
      setArtist("Carregando...");
      // Aguardar antes de atualizar
      setTimeout(() => {
        if (audioRef.current) {
          updateSource(next.path);
          audioRef.current.load();
          audioRef.current.play().catch((err) => {
            console.error("Erro ao reproduzir após trocar de gênero:", err);
          });
          fetchCurrentSong(next.path);
          connectToTrackChanges(next.path);
        }
      }, 100);
    } else {
      setGenre(next.path);
      updateSource(next.path);
      if (playing) {
        fetchCurrentSong(next.path);
        connectToTrackChanges(next.path);
      }
    }
  };

  // Restaurar configurações do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedGenre = localStorage.getItem("genre");
        if (storedGenre) setGenre(storedGenre);
        
        const storedVolume = localStorage.getItem("volume");
        if (storedVolume) setVolume(parseFloat(storedVolume));
      } catch (error) {
        console.error("Erro ao restaurar configurações:", error);
      }
    }
  }, []);

  // Atualizar volume no audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    // Salvar volume no localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("volume", volume.toString());
    }
  }, [volume]);

  // Salvar gênero no localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("genre", genre);
    }
  }, [genre]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const genreName = genres.find((g) => g.path === genre)?.name || "Principal";

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
        genre,
        genreName,
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

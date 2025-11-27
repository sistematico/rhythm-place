"use client";

import { useEffect, useState } from "react";
import { Clock, Music } from "lucide-react";

interface HistoryTrack {
  id: number;
  artist: string | null;
  title: string | null;
  genre: string;
  playedAt: string;
}

export default function TrackHistory() {
  const [history, setHistory] = useState<HistoryTrack[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadHistory = () => {
        const stored = localStorage.getItem("trackHistory");
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      };

      loadHistory();

      // Atualizar a cada 30 segundos se aberto
      const interval = setInterval(() => {
        if (isOpen) loadHistory();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
        aria-label="Histórico de músicas"
        title="Histórico de músicas"
      >
        <Clock size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-50">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Music size={18} />
              Histórico de Músicas
            </h3>
          </div>

          {history.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Nenhuma música tocada ainda
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {history.map((track) => (
                <li
                  key={`${track.id}-${track.playedAt}`}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-gray-900 dark:text-white">
                        {track.title || "Música Desconhecida"}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {track.artist || "Artista Desconhecido"}
                      </p>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {track.genre}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                      {formatTime(track.playedAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

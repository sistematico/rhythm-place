"use client";

import { Music2, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface Song {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
}

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
}

export function RequestModal({ open, onClose }: RequestModalProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync <dialog> open state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      dialog.close();
    }
  }, [open]);

  // Close on native dialog cancel (Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handler = () => onClose();
    dialog.addEventListener("cancel", handler);
    return () => dialog.removeEventListener("cancel", handler);
  }, [onClose]);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/songs/search?q=${encodeURIComponent(query)}`,
        );
        const data: Song[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (clickedOutside) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="m-auto w-full max-w-lg rounded-[1.75rem] border border-white/10 p-0 text-white shadow-[0_30px_100px_rgba(2,6,23,0.7)] backdrop:bg-black/55 backdrop:backdrop-blur-sm open:flex open:flex-col"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 60%), linear-gradient(180deg, #020611 0%, #030914 55%, #020611 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-wide text-white/70 uppercase">
          Pedidos
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition hover:bg-white/8 hover:text-white/70"
          aria-label="Fechar"
        >
          <X size={15} />
        </button>
      </div>

      {/* Search input */}
      <div className="px-5 pt-4 pb-3">
        <label htmlFor={inputId} className="sr-only">
          Pesquisar música
        </label>
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white/25"
          />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por título, artista ou álbum..."
            className="w-full rounded-xl border border-white/8 bg-white/5 py-2.5 pr-4 pl-9 text-sm text-white/90 placeholder-white/22 outline-none transition focus:border-white/18 focus:bg-white/7"
          />
        </div>
      </div>

      {/* Results */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        {loading && (
          <p className="py-6 text-center text-sm text-white/28">
            Pesquisando...
          </p>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <p className="py-6 text-center text-sm text-white/28">
            Nenhuma música encontrada.
          </p>
        )}

        {!loading && query.length < 2 && (
          <p className="py-8 text-center text-sm text-white/22">
            Digite ao menos 2 caracteres para pesquisar.
          </p>
        )}

        {results.length > 0 && (
          <ul className="space-y-0.5">
            {results.map((song) => (
              <li key={song.id}>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/5">
                    <Music2 size={14} className="text-white/35" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white/85">
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-white/35">
                      {[song.artist, song.album].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}

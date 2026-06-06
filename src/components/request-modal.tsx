"use client";

import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Music2,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { DeezerSearchResponse } from "@/app/api/deezer/search/route";
import { PAGE_SIZE } from "@/app/api/deezer/search/route";

type DeezerResult = DeezerSearchResponse["results"][number];

// ---------------------------------------------------------------------------
// DownloadButton
// ---------------------------------------------------------------------------

type DownloadStatus =
  | "idle"
  | "queued"
  | "downloading"
  | "done"
  | "already_downloaded"
  | "error";

function DownloadButton({ trackId }: { trackId: number }) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [percent, setPercent] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleDownload() {
    if (
      status === "done" ||
      status === "already_downloaded" ||
      status === "queued" ||
      status === "downloading"
    ) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("queued");
    setPercent(0);

    try {
      const response = await fetch(`/api/deezer/download?trackId=${trackId}`, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });

        for (;;) {
          const boundary = buf.indexOf("\n\n");
          if (boundary === -1) break;
          const block = buf.slice(0, boundary);
          buf = buf.slice(boundary + 2);

          let eventName = "message";
          let data = "";
          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) eventName = line.slice(7).trim();
            else if (line.startsWith("data: ")) data = line.slice(6).trim();
          }

          if (eventName === "progress") {
            const { percent: p } = JSON.parse(data) as { percent: number };
            setStatus("downloading");
            setPercent(p);
          } else if (eventName === "done") {
            setStatus("done");
            return;
          } else if (eventName === "already_downloaded") {
            setStatus("already_downloaded");
            return;
          } else if (eventName === "error") {
            const { message } = JSON.parse(data) as { message: string };
            throw new Error(message);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setStatus("error");
      }
    }
  }

  if (status === "done") {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
        <Check size={13} />
      </div>
    );
  }

  if (status === "already_downloaded") {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/30"
        title="Já baixado"
      >
        <Check size={13} />
      </div>
    );
  }

  if (status === "downloading") {
    return (
      <div className="flex h-7 shrink-0 items-center gap-1 rounded-lg bg-white/5 px-1.5 text-white/50">
        <Loader2 size={12} className="animate-spin" />
        <span className="min-w-[2ch] text-right font-mono text-[11px]">
          {percent}%
        </span>
      </div>
    );
  }

  if (status === "queued") {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/30"
        title="Na fila..."
      >
        <Loader2 size={13} className="animate-spin" />
      </div>
    );
  }

  // idle or error
  return (
    <button
      type="button"
      onClick={handleDownload}
      title={status === "error" ? "Tentar novamente" : "Baixar"}
      className={[
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition",
        status === "error"
          ? "bg-red-500/12 text-red-400 hover:bg-red-500/20"
          : "text-white/25 hover:bg-white/8 hover:text-white/70",
      ].join(" ")}
    >
      {status === "error" ? <AlertCircle size={13} /> : <Download size={13} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// RequestModal
// ---------------------------------------------------------------------------

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
}

export function RequestModal({ open, onClose }: RequestModalProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<DeezerResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
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

  // Reset all state when modal closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setPage(0);
      setResults([]);
      setTotal(0);
      setFetchError(false);
    }
  }, [open]);

  // Debounce query → debouncedQuery (600 ms) and reset page atomically
  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery("");
      setPage(0);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 600);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch when debouncedQuery or page changes; page changes are immediate (no debounce)
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setTotal(0);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setFetchError(false);

    fetch(
      `/api/deezer/search?q=${encodeURIComponent(debouncedQuery)}&page=${page}`,
      { signal: controller.signal, cache: "no-store" },
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DeezerSearchResponse>;
      })
      .then((data) => {
        setResults(data.results);
        setTotal(data.total);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setResults([]);
        setTotal(0);
        setFetchError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
      setLoading(false);
    };
  }, [debouncedQuery, page]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const outside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (outside) onClose();
  }

  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0;
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;
  const firstResult = total > 0 ? page * PAGE_SIZE + 1 : 0;
  const lastResult = total > 0 ? Math.min((page + 1) * PAGE_SIZE, total) : 0;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="m-auto w-full max-w-lg rounded-[1.75rem] border border-white/10 p-0 text-white shadow-[0_30px_100px_rgba(2,6,23,0.7)] backdrop:bg-black/55 backdrop:backdrop-blur-sm open:flex open:max-h-[90vh] open:flex-col"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 60%), linear-gradient(180deg, #020611 0%, #030914 55%, #020611 100%)",
      }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-4">
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
      <div className="shrink-0 px-5 pt-4 pb-3">
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
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        {loading && (
          <p className="py-6 text-center text-sm text-white/28">
            Pesquisando...
          </p>
        )}

        {!loading && fetchError && (
          <p className="py-6 text-center text-sm text-red-400/60">
            Falha ao buscar músicas. Tente novamente.
          </p>
        )}

        {!loading && !fetchError && debouncedQuery && results.length === 0 && (
          <p className="py-6 text-center text-sm text-white/28">
            Nenhuma música encontrada.
          </p>
        )}

        {!loading && !debouncedQuery && (
          <p className="py-8 text-center text-sm text-white/22">
            Digite ao menos 2 caracteres para pesquisar.
          </p>
        )}

        {results.length > 0 && (
          <ul className="space-y-0.5 pb-3">
            {results.map((song) => (
              <li key={song.id}>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5">
                  {song.cover ? (
                    <Image
                      src={song.cover}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/5">
                      <Music2 size={14} className="text-white/35" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/85">
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-white/35">
                      {[song.artist, song.album].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <DownloadButton trackId={song.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex shrink-0 items-center justify-between border-t border-white/8 px-5 py-3">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/8 hover:text-white/80 disabled:pointer-events-none disabled:opacity-25"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs text-white/35">
            {firstResult}–{lastResult} de {total.toLocaleString("pt-BR")}
          </span>

          <button
            type="button"
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/8 hover:text-white/80 disabled:pointer-events-none disabled:opacity-25"
            aria-label="Próxima página"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </dialog>
  );
}

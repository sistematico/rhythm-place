import { deezerQueued } from "@/lib/deezer-queue";

export const dynamic = "force-dynamic";

const DEEZER_SEARCH_URL = "https://api.deezer.com/search";
export const PAGE_SIZE = 25;

type DeezerTrack = {
  id: number;
  title: string;
  artist: { name: string };
  album: { title: string; cover_small: string };
};

type DeezerPayload = {
  data?: DeezerTrack[];
  total?: number;
  error?: { type: string; message: string; code: number };
};

export type DeezerSearchResponse = {
  results: Array<{
    id: number;
    title: string;
    artist: string;
    album: string;
    cover: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Math.max(
    0,
    Math.floor(Number(searchParams.get("page") ?? 0)) || 0,
  );

  if (q.length < 2) {
    return Response.json({
      results: [],
      total: 0,
      page: 0,
      pageSize: PAGE_SIZE,
    } satisfies DeezerSearchResponse);
  }

  try {
    const payload = await deezerQueued(async () => {
      const url = new URL(DEEZER_SEARCH_URL);
      url.searchParams.set("q", q);
      url.searchParams.set("index", String(page * PAGE_SIZE));
      url.searchParams.set("limit", String(PAGE_SIZE));

      const response = await fetch(url.toString(), {
        cache: "no-store",
        signal: request.signal,
      });

      if (!response.ok) {
        throw new Error(`Deezer responded with ${response.status}`);
      }

      return (await response.json()) as DeezerPayload;
    });

    if (payload.error) {
      return Response.json(
        { error: "Deezer recusou a busca." },
        { status: 502 },
      );
    }

    const results = (payload.data ?? []).map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      cover: track.album.cover_small,
    }));

    return Response.json({
      results,
      total: payload.total ?? 0,
      page,
      pageSize: PAGE_SIZE,
    } satisfies DeezerSearchResponse);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return new Response(null, { status: 499 });
    }
    return Response.json(
      { error: "Falha ao buscar músicas." },
      { status: 502 },
    );
  }
}

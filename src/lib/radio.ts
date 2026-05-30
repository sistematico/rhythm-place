export const STREAM_MOUNT = "/main";
export const STREAM_PROXY_PATH = "/radio/stream";

const STATUS_PATH = "/status-json.xsl";
const DEFAULT_ARTIST = "Rhythm Place";
const DEFAULT_TITLE = "Transmissao ao vivo";

type IcecastSource = {
  artist?: string;
  listenurl?: string;
  mount?: string;
  server_description?: string;
  title?: string;
};

type IcecastPayload = {
  icestats?: {
    source?: IcecastSource | IcecastSource[];
  };
};

export type NowPlaying = {
  artist: string;
  mount: string;
  rawTitle: string;
  title: string;
  updatedAt: string;
};

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function addCandidate(candidates: string[], seen: Set<string>, value?: string) {
  if (!value) {
    return;
  }

  const normalizedValue = normalizeBaseUrl(value);

  if (seen.has(normalizedValue)) {
    return;
  }

  seen.add(normalizedValue);
  candidates.push(normalizedValue);
}

function buildCandidateBases(request?: Request) {
  const candidates: string[] = [];
  const seen = new Set<string>();

  addCandidate(candidates, seen, process.env.ICECAST_INTERNAL_BASE_URL);
  addCandidate(candidates, seen, "http://icecast:8000");
  addCandidate(candidates, seen, "http://127.0.0.1:8000");
  addCandidate(candidates, seen, "http://localhost:8000");

  if (!request) {
    return candidates;
  }

  const url = new URL(request.url);
  addCandidate(candidates, seen, `http://${url.hostname}:8000`);

  return candidates;
}

async function fetchIcecastPayload(request?: Request) {
  let lastError: unknown;

  for (const baseUrl of buildCandidateBases(request)) {
    try {
      const response = await fetch(`${baseUrl}${STATUS_PATH}`, {
        cache: "no-store",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Icecast metadata request failed with ${response.status}`,
        );
      }

      return (await response.json()) as IcecastPayload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to fetch Icecast metadata");
}

function getSources(payload: IcecastPayload) {
  const source = payload.icestats?.source;

  if (!source) {
    return [];
  }

  return Array.isArray(source) ? source : [source];
}

function splitTrackTitle(rawTitle: string) {
  const normalizedTitle = rawTitle.trim();

  if (!normalizedTitle) {
    return {
      artist: DEFAULT_ARTIST,
      title: DEFAULT_TITLE,
    };
  }

  const [artist, ...titleParts] = normalizedTitle.split(" - ");

  if (titleParts.length === 0) {
    return {
      artist: DEFAULT_ARTIST,
      title: normalizedTitle,
    };
  }

  return {
    artist: artist.trim() || DEFAULT_ARTIST,
    title: titleParts.join(" - ").trim() || DEFAULT_TITLE,
  };
}

function pickActiveSource(sources: IcecastSource[]) {
  return (
    sources.find((source) => source.mount === STREAM_MOUNT) ??
    sources.find((source) => source.listenurl?.endsWith(STREAM_MOUNT)) ??
    sources[0]
  );
}

export function parseNowPlaying(payload: IcecastPayload): NowPlaying {
  const source = pickActiveSource(getSources(payload));
  const rawTitle =
    source?.title?.trim() ?? source?.server_description?.trim() ?? "";
  const splitTrack = splitTrackTitle(rawTitle);

  return {
    artist: source?.artist?.trim() || splitTrack.artist,
    mount: source?.mount?.trim() || STREAM_MOUNT,
    rawTitle,
    title: splitTrack.title,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchNowPlaying(request?: Request) {
  const payload = await fetchIcecastPayload(request);
  return parseNowPlaying(payload);
}

export async function fetchStreamResponse(request: Request) {
  const incomingUrl = new URL(request.url);
  let lastError: unknown;

  for (const baseUrl of buildCandidateBases(request)) {
    try {
      const targetUrl = new URL(`${baseUrl}${STREAM_MOUNT}`);
      targetUrl.search = incomingUrl.search;

      const response = await fetch(targetUrl, {
        cache: "no-store",
      });

      if (!response.ok || !response.body) {
        throw new Error(
          `Icecast stream request failed with ${response.status}`,
        );
      }

      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to fetch Icecast stream");
}

export async function checkStreamAvailability(request: Request) {
  const payload = await fetchIcecastPayload(request);
  const source = pickActiveSource(getSources(payload));
  return source?.mount === STREAM_MOUNT || source?.listenurl?.endsWith(STREAM_MOUNT) === true;
}

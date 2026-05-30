import { fetchNowPlaying } from "@/lib/radio";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const nowPlaying = await fetchNowPlaying(request);
    return Response.json(nowPlaying, {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return Response.json(
      {
        artist: "Rhythm Place",
        mount: "/main",
        rawTitle: "",
        title: "Transmissao ao vivo",
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "cache-control": "no-store, no-cache, must-revalidate",
        },
        status: 200,
      },
    );
  }
}

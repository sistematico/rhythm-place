import { fetchStreamResponse } from "@/lib/radio";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const upstreamResponse = await fetchStreamResponse(request);

    return new Response(upstreamResponse.body, {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
        "content-type":
          upstreamResponse.headers.get("content-type") ?? "audio/mpeg",
      },
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });
  } catch {
    return new Response("Stream unavailable", {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
        "content-type": "text/plain; charset=utf-8",
      },
      status: 503,
    });
  }
}

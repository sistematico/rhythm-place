import { checkStreamAvailability } from "@/lib/radio";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await checkStreamAvailability(request);

    return Response.json(
      { available: true },
      {
        headers: {
          "cache-control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch {
    return Response.json(
      { available: false },
      {
        headers: {
          "cache-control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}

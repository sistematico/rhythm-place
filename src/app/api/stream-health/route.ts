import { checkStreamAvailability } from "@/lib/radio";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const available = await checkStreamAvailability(request);

    return Response.json(
      { available },
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
